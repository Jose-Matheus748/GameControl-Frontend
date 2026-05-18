import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlaylistService, Playlist } from '../../services/playlist.service';
import { GameService, Game } from '../../services/games.service';
import { ToastService } from '../../services/toast.service';
import { catchError, of, forkJoin } from 'rxjs';

@Component({
  selector: 'app-playlist-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './playlist.component.html',
})
export class PlaylistDetailComponent implements OnInit {

  playlist?: Playlist;
  games: Game[] = [];
  paginated: Game[] = [];
  isOwner = false;
  loading = true;

  page = 0;
  pageSize = 20;

  editing = false;
  editNome = '';
  editDescricao = '';
  saving = false;

  constructor(
    private route: ActivatedRoute,
    private playlistService: PlaylistService,
    private gameService: GameService,
    private cdr: ChangeDetectorRef,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.playlistService.getById(id).subscribe({
      next: (data) => {
        this.playlist = data;

        const loggedUserId = localStorage.getItem('userId');
        this.isOwner = !!loggedUserId && loggedUserId === data.usuarioId;

        const ids = data.jogosIds || [];

        if (ids.length === 0) {
          this.games = [];
          this.updatePage();
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }

        this.loadGamesByIds(ids);
      },
      error: (err) => {
        console.error('Erro ao carregar playlist', err);
        this.loading = false;
      }
    });
  }

  loadGamesByIds(ids: string[]) {
    if (!ids.length) {
      this.games = [];
      this.updatePage();
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    const requests = ids.map(id =>
      this.gameService.getById(id).pipe(
        catchError((err) => {
          console.warn('Erro ao carregar jogo ID:', id, err);
          return of(null);
        })
      )
    );

    forkJoin(requests).subscribe({
      next: (games) => {
        this.games = games.filter(g => g !== null);
        this.updatePage();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro geral ao carregar jogos', err);
        this.loading = false;
      }
    });
  }

  updatePage() {
    const start = this.page * this.pageSize;
    const end = start + this.pageSize;
    this.paginated = this.games.slice(start, end);
  }

  next() {
    if ((this.page + 1) * this.pageSize < this.games.length) {
      this.page++;
      this.updatePage();
    }
  }

  prev() {
    if (this.page > 0) {
      this.page--;
      this.updatePage();
    }
  }

  startEdit() {
    if (!this.playlist) return;
    this.editNome = this.playlist.nome;
    this.editDescricao = this.playlist.descricao || '';
    this.editing = true;
  }

  cancelEdit() {
    this.editing = false;
    this.editNome = '';
    this.editDescricao = '';
  }

  saveEdit() {
    if (!this.playlist?.id || !this.editNome.trim()) return;

    this.saving = true;

    const updated: Playlist = {
      ...this.playlist,
      nome: this.editNome.trim(),
      descricao: this.editDescricao.trim()
    };

    this.playlistService.updatePlaylist(this.playlist.id, updated).subscribe({
      next: (result) => {
        this.playlist = result;
        this.editing = false;
        this.saving = false;
        this.cdr.detectChanges();
        this.toast.sucesso('Playlist atualizada com sucesso!');
      },
      error: (err) => {
        this.toast.erro('Erro ao atualizar playlist', err);
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  removeGame(gameId: string) {
    if (!this.playlist?.id) return;

    this.playlistService
      .removeGameFromPlaylist(this.playlist.id, gameId)
      .subscribe({
        next: (updated) => {
          this.playlist = updated;

          const ids = updated.jogosIds || [];

          if (ids.length === 0) {
            this.games = [];
            this.updatePage();
            this.loading = false;
            this.cdr.detectChanges();
            return;
          }

          this.loadGamesByIds(ids);
        },
        error: (err) => console.error('Erro ao remover jogo', err)
      });
  }

  getCoverUrl(game: Game): string {
    if (!game.coverImageUrl) return 'assets/default-cover.jpg';

    if (game.coverImageUrl.startsWith('http')) {
      return game.coverImageUrl;
    }

    return `http://localhost:8080/uploads/${game.coverImageUrl}`;
  }
}
