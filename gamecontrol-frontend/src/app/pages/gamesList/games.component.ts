import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { Game, GameService } from "../../services/games.service";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-games-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './games.component.html',
})
export class GamesListComponent implements OnInit {
  games: Game[] = [];
  filteredGames: Game[] = [];
  paginated: Game[] = [];
  loading = true;
  page = 0;
  pageSize = 49;

  constructor(
    private gameService: GameService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.gameService.getAll().subscribe({
      next: (data) => {
        this.games = data;

        this.route.queryParams.subscribe(params => {
          const search = params['search']?.toLowerCase() || '';
          this.filteredGames = this.games.filter(game =>
            game.title.toLowerCase().includes(search)
          );
          this.page = 0;
          this.updatePage();
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error('Erro ao carregar jogos', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get totalPages(): number {
    return Math.ceil(this.filteredGames.length / this.pageSize);
  }

  // Limita os indicadores a no máximo 8 pontos visíveis
  get pageRange(): number[] {
    const total = this.totalPages;
    if (total <= 8) return Array.from({ length: total }, (_, i) => i);

    const half = 4;
    let start = Math.max(0, this.page - half);
    let end = Math.min(total - 1, this.page + half);

    if (this.page < half) end = Math.min(total - 1, 7);
    if (this.page > total - 1 - half) start = Math.max(0, total - 8);

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  updatePage(): void {
    const start = this.page * this.pageSize;
    this.paginated = this.filteredGames.slice(start, start + this.pageSize);
    this.cdr.detectChanges();
  }

  next(): void {
    if ((this.page + 1) * this.pageSize < this.filteredGames.length) {
      this.page++;
      this.updatePage();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prev(): void {
    if (this.page > 0) {
      this.page--;
      this.updatePage();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToPage(p: number): void {
    this.page = p;
    this.updatePage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getCoverUrl(game: Game): string {
    if (!game.coverImageUrl) return 'assets/default-cover.jpg';
    if (game.coverImageUrl.startsWith('http://') || game.coverImageUrl.startsWith('https://')) {
      return game.coverImageUrl;
    }
    return `http://localhost:8080/uploads/${game.coverImageUrl}`;
  }
}
