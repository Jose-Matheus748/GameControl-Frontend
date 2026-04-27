import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PlaylistService, Playlist } from '../../services/playlist.service';
import { GameService, Game } from '../../services/games.service';
import { catchError, of, forkJoin } from 'rxjs';

@Component({
  selector: 'app-playlist-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './playlist.component.html',
})
export class PlaylistDetailComponent implements OnInit {

  playlist?: Playlist;
  games: Game[] = [];
  paginated: Game[] = [];

  loading = true;

  page = 0;
  pageSize = 20;

  constructor(
    private route: ActivatedRoute,
    private playlistService: PlaylistService,
    private gameService: GameService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.playlistService.getById(id).subscribe({
      next: (data) => {
        this.playlist = data;

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
      this.gameService.getById(Number(id)).pipe(
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

  removeGame(gameId: number) {
    if (!this.playlist?.id) return;

    this.playlistService
      .removeGameFromPlaylist(this.playlist.id, String(gameId))
      .subscribe({
        next: (updated) => {
          this.playlist = updated;

          const ids = updated.jogosIds || [];

          // 🔥 TRATAMENTO CRÍTICO
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
