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

    constructor (
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

    updatePage() {
      const start = this.page * this.pageSize;
      const end = start + this.pageSize;

      this.paginated = this.filteredGames.slice(start, end);
      this.cdr.detectChanges();
    }

    next() {
        if ((this.page + 1) * this.pageSize < this.filteredGames.length) {
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

    getCoverUrl(game: Game): string {
        if (!game.coverImageUrl) {
            return 'assets/default-cover.jpg';
        }

        if (game.coverImageUrl.startsWith('http://') || game.coverImageUrl.startsWith('https://')) {
            return game.coverImageUrl;
        }

        return `http://localhost:8080/uploads/${game.coverImageUrl}`;
    }
}
