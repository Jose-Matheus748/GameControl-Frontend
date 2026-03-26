import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Game, GameService } from '../../services/games.service';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './carousel.component.html'
})

export class CarouselComponent implements OnInit {
  gameCards: Game[] = [];
  index = 0;
  loading = true;
  errorMessage = '';


  constructor(
    private gameService: GameService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.gameService.getAll().subscribe({
      next: (games) => {
        const limitedGames = games.slice(0, 12);

        this.gameCards = limitedGames.map((game) => ({
          ...game,
          image: game.coverImageUrl || 'https://via.placeholder.com/300x200?text=Sem+Imagem',
          link: `/games/${game.id}`,
          description: game.description || 'Sem descrição disponível',
        }));

        this.loading = false;

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao buscar jogos:', err);
        this.errorMessage = 'Erro ao carregar os jogos 😞';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  next() {
    if (this.index + 4 < this.gameCards.length) this.index += 4;
  }

  prev() {
    if (this.index > 0) this.index -= 4;
  }

  get visible() {
    return this.gameCards.slice(this.index, this.index + 4);
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
