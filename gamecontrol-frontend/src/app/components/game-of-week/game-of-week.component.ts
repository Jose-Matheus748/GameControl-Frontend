import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService, Game } from '../../services/games.service';
import { ReviewService } from '../../services/review.service';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-game-of-week',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './game-of-week.component.html',
})
export class GameOfWeekComponent implements OnInit {
  private readonly GAME_ID = '115289';

  game?: Game;
  averageRating = 0;
  loading = true;

  constructor(
    private gameService: GameService,
    private reviewService: ReviewService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    forkJoin({
      game: this.gameService.getById(this.GAME_ID),
      average: this.reviewService.getAverage(this.GAME_ID)
    }).subscribe({
      next: ({ game, average }) => {
        this.game = game;
        this.averageRating = Math.round(average);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao carregar jogo da semana:', err)
    });
  }

  get stars() {
    return Array(5).fill(0).map((_, i) => i < this.averageRating);
  }
}
