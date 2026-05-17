import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Game, GameService } from '../../services/games.service';
import { Component, OnInit } from '@angular/core';
import { retry, delay } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core';

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
    this.gameService.getCarousel()
      .pipe(delay(100), retry(2))
      .subscribe({
        next: (games) => {
          this.gameCards = games;
          this.index = 0;
          this.loading = false;
          setTimeout(() => this.cdr.detectChanges(), 0);
        }
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

  // Quantidade de páginas para os indicadores de ponto
  get pageIndicators(): number[] {
    const totalPages = Math.ceil(this.gameCards.length / 4);
    return Array(totalPages).fill(0);
  }

  // Página atual (0-based)
  get currentPage(): number {
    return Math.floor(this.index / 4);
  }

  getCoverUrl(game: Game): string {
    if (!game.coverImageUrl) return 'assets/default-cover.jpg';
    if (game.coverImageUrl.startsWith('http://') || game.coverImageUrl.startsWith('https://')) {
      return game.coverImageUrl;
    }
    return `http://localhost:8080/uploads/${game.coverImageUrl}`;
  }
}
