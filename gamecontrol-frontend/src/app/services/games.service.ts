import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Game {
  id?: number;
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
  private cache = new Map<number, Game>();

  constructor(private http: HttpClient) {}

  getAll(): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.apiUrl}`);
  }

  getById(id: number): Observable<Game> {
    if (this.cache.has(id)) {
      return of(this.cache.get(id)!);
    }

    return this.http.get<Game>(`${this.apiUrl}/${id}`).pipe(
      tap(game => this.cache.set(id, game))
    );
  }

  getCarousel(): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.apiUrl}/recentes`);
  }

  uploadGame(formData: FormData): Observable<Game> {
    return this.http.post<Game>(`${this.apiUrl}`, formData);
  }

  update(id: number, game: Game): Observable<Game> {
    return this.http.put<Game>(`${this.apiUrl}/${id}`, game);
  }

  delete(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }
}
