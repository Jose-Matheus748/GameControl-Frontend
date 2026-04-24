import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { LucideGamepad2, LucidePlus, LucideTrash2 } from '@lucide/angular';

@Component({
  selector: 'app-playlist-section',
  standalone: true,
  imports: [CommonModule, LucideTrash2, LucidePlus, LucideGamepad2],
  templateUrl: './playlist-section.html',
})
export class PlaylistSectionComponent {
  @Input() playlists: any[] = [];

  @Output() criarPlaylist = new EventEmitter<void>();
  @Output() deletarPlaylist = new EventEmitter<number>();

  onCriarPlaylist(): void {
    this.criarPlaylist.emit();
  }

  onDeletarPlaylist(id: number): void {
    this.deletarPlaylist.emit(id);
  }
}
