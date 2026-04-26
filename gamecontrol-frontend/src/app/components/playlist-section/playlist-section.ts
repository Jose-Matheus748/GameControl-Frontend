import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { LucideGamepad2, LucidePlus, LucideTrash2 } from '@lucide/angular';
import { Playlist } from '../../services/playlist.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-playlist-section',
  standalone: true,
  imports: [CommonModule, LucideTrash2, LucidePlus, LucideGamepad2],
  templateUrl: './playlist-section.html',
})
export class PlaylistSectionComponent {
  private _playlists: Playlist[] = [];

  constructor(private router: Router) {}

  @Input()
  set playlists(value: Playlist[] | null | undefined) {
    this._playlists = Array.isArray(value) ? value : [];
  }

  get playlists(): Playlist[] {
    return this._playlists;
  }

  @Output() criarPlaylist = new EventEmitter<void>();
  @Output() deletarPlaylist = new EventEmitter<string>();

  onCriarPlaylist(): void {
    try {
      this.criarPlaylist.emit();
    } catch (error) {
      console.error('Erro ao emitir evento de criação de playlist:', error);
    }
  }

  openPlaylist(id: string) {
    this.router.navigate(['/playlists', id]);
  }

  onDeletarPlaylist(event: MouseEvent, id?: string): void {
    event.stopPropagation();

    try {
      if (!id) {
        console.warn('Tentativa de deletar playlist sem ID válido');
        return;
      }

      this.deletarPlaylist.emit(id)
    } catch (error) {
      console.error('Erro ao emitir evento de exclusão de playlist:', error);
    }
  }
}
