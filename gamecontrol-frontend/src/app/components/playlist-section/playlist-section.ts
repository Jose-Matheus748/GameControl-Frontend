import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { LucideGamepad2, LucidePlus, LucideTrash2 } from '@lucide/angular';
import { Playlist } from '../../services/playlist.service';

@Component({
  selector: 'app-playlist-section',
  standalone: true,
  imports: [CommonModule, LucideTrash2, LucidePlus, LucideGamepad2],
  templateUrl: './playlist-section.html',
})
export class PlaylistSectionComponent {
  private _playlists: Playlist[] = [];

  @Input()
  set playlists(value: Playlist[] | null | undefined) {
    this._playlists = Array.isArray(value) ? value : [];
  }

  get playlists(): Playlist[] {
    return this._playlists;
  }

  @Output() criarPlaylist = new EventEmitter<void>();
  @Output() deletarPlaylist = new EventEmitter<number>();

  onCriarPlaylist(): void {
    try {
      this.criarPlaylist.emit();
    } catch (error) {
      console.error('Erro ao emitir evento de criação de playlist:', error);
    }
  }

  onDeletarPlaylist(id?: number): void {
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
