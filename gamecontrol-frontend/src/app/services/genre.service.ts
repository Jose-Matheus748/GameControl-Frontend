import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Genre {
  id: string;
  name: string;
  slug: string;
  gameIds?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class GenreService {
  private apiUrl = 'http://localhost:8080/api/genres';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Genre[]> {
    return this.http.get<Genre[]>(this.apiUrl);
  }
}
