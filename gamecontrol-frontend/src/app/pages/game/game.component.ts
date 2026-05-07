import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GameService, Game } from '../../services/games.service';
import { switchMap } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { GameComment, GameCommentsService } from '../../services/gameComments.service';
import { AuthService } from '../../services/auth.service';
import { GenreService, Genre } from '../../services/genre.service';
import { PlaylistService, Playlist } from '../../services/playlist.service';
import { ReviewService } from '../../services/review.service';
import { firstValueFrom, forkJoin } from 'rxjs';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './game.component.html'
})
export class GameComponent implements OnInit {
  gameData?: Game;
  loading = true;
  errorMessage = '';
  comments: GameComment[] = [];
  newCommentContent: string = '';
  genreNames: string[] = [];
  showPlaylistModal = false;
  userPlaylists: Playlist[] = [];
  selectedPlaylists = new Set<string>();
  stars = Array(5).fill(0);
  averageRating = 0;
  saving = false;

  deleteCommentModalOpen = false;
  commentToDelete: string | number | null = null;

  get currentUserId(): string | undefined {
    const id = this.authService.user()?.id;
    return id != null ? String(id) : undefined;
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  constructor(
    private route: ActivatedRoute,
    private gameService: GameService,
    private commentsService: GameCommentsService,
    private authService: AuthService,
    private genreService: GenreService,
    private cdr: ChangeDetectorRef,
    private playlistService: PlaylistService,
    private reviewService: ReviewService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params
      .pipe(switchMap((params) => {
        const gameId = +params['id'];
        return this.gameService.getById(gameId);
      }))
      .subscribe({
        next: (game) => {
          this.gameData = game;
          this.loading = false;
          this.loadComments(game.id!);
          this.loadAverage(game.id!);

          if (game.genreIds?.length) {
            this.loadGenres(game.genreIds);
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erro ao carregar jogo:', err);
          this.errorMessage = 'Erro ao carregar este jogo 😞';
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  loadComments(gameId: string | number): void {
    this.commentsService.getCommentsByGame(gameId).subscribe({
      next: (comments) => {
        this.comments = comments;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar comentários:', err);
      }
    });
  }

  loadGenres(genreIds: string[]): void {
    this.genreService.getAll().subscribe({
      next: (genres) => {
        this.genreNames = genres
          .filter(genre => genreIds.includes(genre.id))
          .map(genre => genre.name);

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar gêneros:', err);
      }
    });
  }

  submitComment(): void {
    const userId = this.currentUserId;

    if (!this.newCommentContent.trim() || !this.gameData?.id || userId == null) {
      return;
    }

    this.commentsService.createComment(
      userId,
      this.gameData.id,
      this.newCommentContent
    ).subscribe({
      next: (comment) => {
        this.newCommentContent = '';
        this.comments = [comment, ...this.comments];
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erro ao enviar comentário:', err);
      }
    });
  }

  deleteComment(deletedCommentId: string | number): void {
    this.commentToDelete = deletedCommentId;
    this.deleteCommentModalOpen = true;
  }

  confirmDeleteComment(): void {
    if (!this.commentToDelete) {
      return;
    }

    this.commentsService.deleteComment(this.commentToDelete).subscribe({
      next: () => {
        this.comments = this.comments.filter(
          (comment) => String(comment.id) !== String(this.commentToDelete)
        );

        this.deleteCommentModalOpen = false;
        this.commentToDelete = null;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Erro ao deletar comentário:', error);

        this.deleteCommentModalOpen = false;
        this.commentToDelete = null;
      },
    });
  }

  cancelDeleteComment(): void {
    this.deleteCommentModalOpen = false;
    this.commentToDelete = null;
  }

  canDelete(comment: GameComment): boolean {
    const loggedInUserId = this.currentUserId;
    if (loggedInUserId == null || comment.user.id == null) {
      return false;
    }
    return String(comment.user.id) === String(loggedInUserId);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  goToReviews(): void {
    if (!this.gameData?.id) return;

    this.router.navigate(['/games', this.gameData.id, 'reviews']);
  }

  addToPlaylist(): void {
    const userId = this.currentUserId;
    if (!userId) return;

    this.playlistService.getPlaylistsByUser(userId).subscribe({
      next: (playlists) => {
        this.userPlaylists = playlists;

        const gameId = String(this.gameData?.id);

        this.selectedPlaylists = new Set(
          playlists
            .filter(p => p.jogosIds?.includes(gameId))
            .map(p => p.id!)
        );

        this.showPlaylistModal = true;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao carregar playlists', err)
    });
  }

  togglePlaylist(playlistId: string) {
    if (this.selectedPlaylists.has(playlistId)) {
      this.selectedPlaylists.delete(playlistId);
    } else {
      this.selectedPlaylists.add(playlistId);
    }
  }

  savePlaylists() {
    if (!this.gameData?.id) return;

    const gameId = String(this.gameData.id);

    const requests = this.userPlaylists.map(p => {
      const playlistId = p.id!;
      const isSelected = this.selectedPlaylists.has(playlistId);
      const alreadyHas = p.jogosIds?.includes(gameId);

      if (isSelected && !alreadyHas) {
        return this.playlistService.addGameToPlaylist(playlistId, gameId);
      }

      if (!isSelected && alreadyHas) {
        return this.playlistService.removeGameFromPlaylist(playlistId, gameId);
      }

      return null;
    }).filter(r => r !== null);

    if (requests.length === 0) {
      this.showPlaylistModal = false;
      return;
    }

    this.saving = true;

    forkJoin(requests).subscribe({
      next: () => {
        this.showPlaylistModal = false;
      },
      error: (err) => {
        console.error('Erro ao atualizar playlists', err);
      },
      complete: () => {
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadAverage(gameId: number) {
    this.reviewService.getAverage(String(gameId)).subscribe({
      next: (avg) => {
        this.averageRating = avg;
        this.cdr.detectChanges();
      }
    });
  }

  get displayRating(): string {
    const rounded = Math.round(this.averageRating * 10) / 10;
    return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(1);
  }
}
