import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { Usuario, UsuarioService } from '../../services/user.service';

export interface UserCard {
  id: string | number;
  image: string;
  nickname: string;
}

@Component({
  selector: 'app-user-carousel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-carousel.component.html',
})
export class UserCarouselComponent {
  private readonly usuarioService = inject(UsuarioService);

  index = 0;
  visibleItems = 5;

  userCards$ = this.usuarioService.getAll().pipe(
    map((users: Usuario[]) => {
      const loggedUserId = localStorage.getItem('userId');
      return users
        .filter((user) => String(user.id) !== String(loggedUserId))
        .map((user) => ({
          id: user.id!,
          nickname: user.username,
          image: user.profilePictureUrl || 'https://i.pravatar.cc/150?img=1',
        }));
    }),
    catchError((err) => {
      console.error('Erro ao carregar usuários', err);
      return of<UserCard[]>([]);
    })
  );
  
  next(length: number) {
    if (this.index < length - this.visibleItems) {
      this.index++;
    }
  }

  prev() {
    if (this.index > 0) {
      this.index--;
    }
  }
}
