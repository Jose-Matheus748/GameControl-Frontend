import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface User {
  id: string | number;
  username: string;
}

export interface GameComment {
  id: string | number;
  content: string;
  createdAt: string;
  user: User;
}

/** JSON plano do backend (GameCommentDTO) — sem objeto aninhado `user`. */
interface GameCommentDto {
  id: string;
  userId: string;
  username?: string | null;
  gameId?: string;
  content: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class GameCommentsService {
  private apiUrl = 'http://localhost:8080/api/gamecomments';

  constructor(private http: HttpClient) {}

  getCommentsByGame(gameId: string | number): Observable<GameComment[]> {
    const gameIdForPath = String(gameId);
    return this.http
      .get<GameCommentDto[]>(`${this.apiUrl}/game/${gameIdForPath}`)
      .pipe(
        map((dtos) => dtos.map((dto) => this.fromDto(dto))),
      );
  }

  createComment(userId: string | number, gameId: string | number, content: string): Observable<GameComment> {
    const newCommentPayload = {
      userId: String(userId),
      gameId: String(gameId),
      content,
    };

    return this.http
      .post<GameCommentDto>(this.apiUrl, newCommentPayload)
      .pipe(map((createdDto) => this.fromDto(createdDto)));
  }

  deleteComment(commentId: string | number): Observable<void> {
    return this.http
      .delete(`${this.apiUrl}/${String(commentId)}`, { responseType: 'text' })
      .pipe(map(() => undefined));
  }

  private fromDto(dto: GameCommentDto): GameComment {
    return {
      id: dto.id,
      content: dto.content,
      createdAt: dto.createdAt,
      user: {
        id: dto.userId,
        username: dto.username ?? '',
      },
    };
  }
}
