import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-searchbar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './searchbar.component.html',
})
export class SearchbarComponent {
  searchTerm = '';

  @Output() search = new EventEmitter<string>();

  constructor(private router: Router) {}

  onInputChange() {
    // Busca automática somente na página de jogos
    if (this.router.url.startsWith('/games')) {
      this.search.emit(this.searchTerm);
    }
  }

  onEnterSearch() {
    // Em qualquer página, Enter faz a busca
    this.search.emit(this.searchTerm);
  }
}
