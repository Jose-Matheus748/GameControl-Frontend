import { Component } from '@angular/core';
import { Destaque, DESTAQUES } from './game-of-week.data';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game-of-week',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-of-week.component.html',
})
export class GameOfWeekComponent {
  destaque: Destaque = DESTAQUES[0];

  get stars() {
    return Array(5)
      .fill(0)
      .map((_, i) => i < (this.destaque.rating || 0));
  }
}
