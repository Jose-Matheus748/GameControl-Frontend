import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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

  constructor(private http: HttpClient) {}

  listarTodos(): Observable<UserPostDTO[]> {
    return this.http.get<UserPostDTO[]>(this.apiUrl);
  }

  listarPorUsuario(userId: string): Observable<UserPostDTO[]> {
    return this.http.get<UserPostDTO[]>(`${this.apiUrl}/user/${userId}`);
  }

  criarPost(dados: CreateUserPostRequest): Observable<UserPostDTO> {
    return this.http.post<UserPostDTO>(this.apiUrl, dados);
  }

  deletarPost(postId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${postId}`);
  }
}
