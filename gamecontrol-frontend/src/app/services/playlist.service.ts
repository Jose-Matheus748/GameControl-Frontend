import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Playlist {
  id?: string;
  nome: string;
  descricao?: string;
  usuarioId?: string;
  jogosIds?: string[];
}

export const PLAYLISTS_API_BASE = 'http://localhost:8080/api/usuario-playlists';

@Injectable({
  providedIn: 'root',
})
export class PlaylistService {
  private readonly apiUrl = PLAYLISTS_API_BASE;

  constructor(private readonly http: HttpClient) {}

  getPlaylistsByUser(usuarioId: string): Observable<Playlist[]> {
    return this.http.get<Playlist[]>(`${this.apiUrl}/usuario/${usuarioId}`);
  }

  getById(id: string): Observable<Playlist> {
    return this.http.get<Playlist>(`${this.apiUrl}/${id}`);
  }

  createPlaylist(usuarioId: string, playlist: Playlist): Observable<Playlist> {
    return this.http.post<Playlist>(
      `${this.apiUrl}?usuarioId=${usuarioId}`,
      playlist
    );
  }

  updatePlaylist(id: string, playlist: Playlist): Observable<Playlist> {
    return this.http.put<Playlist>(`${this.apiUrl}/${id}`, playlist);
  }

  deletePlaylist(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  addGameToPlaylist(playlistId: string, gameId: string): Observable<Playlist> {
    return this.http.post<Playlist>(
      `${this.apiUrl}/${playlistId}/jogos/${gameId}`,
      {}
    );
  }

  removeGameFromPlaylist(playlistId: string, gameId: string): Observable<Playlist> {
    return this.http.delete<Playlist>(
      `${this.apiUrl}/${playlistId}/jogos/${gameId}`
    );
  }
}
