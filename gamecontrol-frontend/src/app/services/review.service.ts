import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Review {
  id?: string;
  userId: string;
  userName: string;
  gameId: string;
  rating: number;
  description: string;
  createdAt: string;
}

export interface CreateReviewRequest {
  userId: string;
  gameId: string;
  rating: number;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  private apiUrl = 'http://localhost:8080/api/reviews';

  constructor(private http: HttpClient) {}

  getByGame(gameId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/game/${gameId}`);
  }

  getAverage(gameId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/game/${gameId}/average`);
  }

  create(review: CreateReviewRequest): Observable<Review> {
    return this.http.post<Review>(this.apiUrl, review);
  }

  delete(id: string): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }
}
