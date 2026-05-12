import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface PostCommentDTO {
  id: string;
  userId: string;
  username: string;
  postId: string;
  content: string;
  createdAt: string;
}

export interface CreatePostCommentRequest {
  userId: string;
  postId: string;
  content: string;
}

@Injectable({
  providedIn: 'root',
})
export class PostCommentService {
  private readonly apiUrl = 'http://localhost:8080/api/postcomments';

  constructor(private http: HttpClient) {}

  listarPorPost(postId: string): Observable<PostCommentDTO[]> {
    return this.http.get<PostCommentDTO[]>(`${this.apiUrl}/post/${postId}`);
  }

  criar(dados: CreatePostCommentRequest): Observable<PostCommentDTO> {
    return this.http.post<PostCommentDTO>(this.apiUrl, dados);
  }

  deletar(commentId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${commentId}`);
  }
}
