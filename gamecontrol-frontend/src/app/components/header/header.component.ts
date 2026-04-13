import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';
import { SearchbarComponent } from '../searchbar/searchbar.component';
import { Router } from '@angular/router';
import { LucideUserRound } from '@lucide/angular';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, SearchbarComponent, LucideUserRound],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  showRegister = false;

  constructor(public authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout();
  }

  onSearchGames(term: string) {
    this.router.navigate(['/games'], {
    queryParams: { search: term }
  });
  }
}
