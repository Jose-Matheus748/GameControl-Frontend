import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GameService, Game } from '../../services/games.service';
import { switchMap } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { GameComment, GameCommentsService } from '../../services/gameComments.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game.component.html'
})
export class GameComponent implements OnInit {
  gameData?: Game;
  loading = true;
  errorMessage = '';
  comments: GameComment[] = [];
  newCommentContent: string = '';

  get currentUserId(): string | number | undefined {
    return this.authService.user()?.id;
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  constructor(
    private route: ActivatedRoute,
    private gameService: GameService,
    private commentsService: GameCommentsService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
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

  loadComments(gameId: number): void {
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

  deleteComment(commentId: number): void {
    if (!confirm('Tem certeza que deseja deletar este comentário?')) {
      return;
    }

    this.commentsService.deleteComment(commentId).subscribe({
      next: (success) => {
        if (success) {
          this.comments = this.comments.filter(c => c.id !== commentId);
          this.cdr.markForCheck();
        } else {
          console.error('Falha ao deletar comentário no backend.');
        }
      },
      error: (err) => {
        console.error('Erro ao deletar comentário:', err);
      }
    });
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
}
