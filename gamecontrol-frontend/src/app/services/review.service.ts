import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Review {
  id?: string;
  userId: string;
  userName: string;
  profilePictureUrl?: string;
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

export interface GameReviewsPage {
  userReview: Review | null;
  game: any;
  reviews: Review[];
  average: number;
  displayAverage: string;
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
  return this.http.post<Review>(this.apiUrl, review, {
    params: { userId: review.userId }
  });
}

  delete(id: string, userId: string): Observable<string> {
  return this.http.delete(`${this.apiUrl}/${id}`, {
    params: { userId },
    responseType: 'text'
  });
}

  getReviewPage(gameId: string, userId?: string): Observable<GameReviewsPage> {
    let params = new HttpParams();

    if (userId) {
      params = params.set('userId', userId);
    }

    return this.http.get<GameReviewsPage>(`${this.apiUrl}/${gameId}/reviews-page`, { params });
  }
}
