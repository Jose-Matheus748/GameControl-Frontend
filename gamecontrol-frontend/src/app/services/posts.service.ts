import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

export interface UserPostDTO {
  id: string;
  userId: string;
  username: string;
  text: string;
  likes: number;
  commentIds?: string[];
  createdAt: string;
}

export interface CreateUserPostRequest {
  userId: string;
  text: string;
}

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private readonly apiUrl = 'http://localhost:8080/api/posts';

  private postsCache$?: Observable<UserPostDTO[]>;

  constructor(private http: HttpClient) {}

  listarTodos(forceRefresh = false): Observable<UserPostDTO[]> {
    return this.http.get<UserPostDTO[]>(this.apiUrl);
  }

  listarPorUsuario(userId: string): Observable<UserPostDTO[]> {
    return this.http.get<UserPostDTO[]>(`${this.apiUrl}/user/${userId}`);
  }

  criarPost(dados: CreateUserPostRequest): Observable<UserPostDTO> {
    return this.http.post<UserPostDTO>(this.apiUrl, dados).pipe(tap(() => this.limparCache()));
  }

  deletarPost(postId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${postId}`).pipe(tap(() => this.limparCache()));
  }

  limparCache(): void {
    this.postsCache$ = undefined;
  }
}
