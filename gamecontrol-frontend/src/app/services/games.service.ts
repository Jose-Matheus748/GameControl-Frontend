import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Game {
  id?: string;
  title: string;
  description?: string;
  developer?: string;
  publisher?: string;
  releaseDate?: string;
  coverImageUrl?: string;
  externalLink: string;
  genreIds?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private apiUrl = 'http://localhost:8080/api/games';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.apiUrl}`);
  }

  getById(id: string): Observable<Game> {
    return this.http.get<Game>(`${this.apiUrl}/${id}`);
  }

  uploadGame(formData: FormData): Observable<Game> {
    return this.http.post<Game>(`${this.apiUrl}`, formData);
  }

  update(id: string, game: Game): Observable<Game> {
    return this.http.put<Game>(`${this.apiUrl}/${id}`, game);
  }

  delete(id: string): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }
}
