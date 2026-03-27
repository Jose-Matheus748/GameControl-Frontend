import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: number;
  username: string;
}

export interface GameComment {
  id: number;
  content: string;
  createdAt: string;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class GameCommentsService {
  private apiUrl = 'http://localhost:8080/api/gamecomments';

  constructor(private http: HttpClient) {}

  getCommentsByGame(gameId: number): Observable<GameComment[]> {
    return this.http.get<GameComment[]>(`${this.apiUrl}/game/${gameId}`);
  }

  createComment(userId: number, gameId: number, content: string): Observable<GameComment> {
    const params = {
      userId: userId.toString(),
      gameId: gameId.toString(),
      content: content,
    };
    return this.http.post<GameComment>(this.apiUrl, null, {
      params,
      responseType: 'json' as 'json',
    });
  }

  deleteComment(commentId: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${commentId}`);
  }
}
