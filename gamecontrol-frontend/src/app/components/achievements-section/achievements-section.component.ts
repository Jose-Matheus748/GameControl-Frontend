import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AchievementBadgeComponent, Badge } from '../../components/achievement-badge/achievement-badge.component'; // Ajuste o caminho

@Component({
  selector: 'app-achievements-section',
  standalone: true,
  imports: [CommonModule, AchievementBadgeComponent],
  templateUrl: './achievements-section.component.html',
})
export class AchievementsSectionComponent {
    achievements: Badge[] = [
    { id: 1, name: 'Pioneiro', description: 'Primeiro jogo visitado', icon: 'trophy' },
    { id: 2, name: 'Comentador', description: 'Comentou em 10 jogos', icon: 'chat' },
    { id: 3, name: 'Amigável', description: 'Seguiu 20 pessoas', icon: 'sword' },
    { id: 4, name: 'Colecionador', description: 'Encontrou 50 itens', icon: 'gem' },
    { id: 5, name: 'Invencível', description: 'Conseguiu 5 badges', icon: 'shield' },
    { id: 6, name: 'Influencer', description: 'Foi seguido por 100 pessoas', icon: 'zap' },
  ];

  constructor() {
    // No futuro, você chamaria um serviço aqui para buscar os dados:
    // this.userService.getAchievements(userId).subscribe(data => this.achievements = data);
  }
}
