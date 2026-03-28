import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-achievement-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './achievement-badge.component.html',
})
export class AchievementBadgeComponent {
  @Input() badge!: Badge; 
}
