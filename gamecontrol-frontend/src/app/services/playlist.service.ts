import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from './user.service';

export interface Game {
  id: number;
  title: string;
  description?: string;
  coverImageUrl?: string;
  developer?: string;
  publisher?: string;
  releaseDate?: string;
  genres?: string;
}

export interface Playlist {
  id?: number;
  nome: string;
  descricao?: string;
  usuario?: Usuario;
  games?: Game[];
}

export const PLAYLISTS_API_BASE = 'http://localhost:8080/api/usuario-playlists';

export function fetchPlaylistsByUserId(
  http: HttpClient,
  usuarioId: string | number
): Observable<Playlist[]> {
  return http.get<Playlist[]>(`${PLAYLISTS_API_BASE}/usuario/${usuarioId}`);
}

@Injectable({
  providedIn: 'root',
})
export class PlaylistService {
  private readonly apiUrl = PLAYLISTS_API_BASE;

  constructor(private readonly http: HttpClient) {}

  getPlaylistsByUser = (usuarioId: string | number): Observable<Playlist[]> =>
    fetchPlaylistsByUserId(this.http, usuarioId);

  getById(id: number): Observable<Playlist> {
    return this.http.get<Playlist>(`${this.apiUrl}/${id}`);
  }

  createPlaylist(usuarioId: string | number, playlist: Playlist): Observable<Playlist> {
    return this.http.post<Playlist>(`${this.apiUrl}?usuarioId=${usuarioId}`, playlist);
  }

  updatePlaylist(id: number, playlist: Playlist): Observable<Playlist> {
    return this.http.put<Playlist>(`${this.apiUrl}/${id}`, playlist);
  }

  deletePlaylist(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  addGameToPlaylist(playlistId: number, gameId: number): Observable<Playlist> {
    return this.http.post<Playlist>(`${this.apiUrl}/${playlistId}/jogos/${gameId}`, {});
  }

  removeGameFromPlaylist(playlistId: number, gameId: number): Observable<Playlist> {
    return this.http.delete<Playlist>(`${this.apiUrl}/${playlistId}/jogos/${gameId}`);
  }
}
