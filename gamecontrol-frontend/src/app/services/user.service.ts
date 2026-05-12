import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Usuario {
  id?: string | number;
  email?: string;
  password?: string;
  username: string;
  bio?: string;
  profilePictureUrl?: string;
  birthDate?: string;
  country?: string;
  role?: string;
  followers?: string[];
  following?: string[];
}

@Injectable({
  providedIn: 'root',
})

export class UsuarioService {
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  getById(id: string | number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  create(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, usuario);
  }

  update(id: string | number, usuario: Partial<Usuario>): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuario);
  }

  uploadProfilePicture(id: string | number, base64Image: string): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}/profile-picture`, {
      profilePictureUrl: base64Image
    });
  }

  delete(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }

  followUser(followerId: string | number, followedId: string | number): Observable<string> {
    const encodedFollowerId = encodeURIComponent(String(followerId));
    const encodedFollowedId = encodeURIComponent(String(followedId));
    return this.http.post(
      `${this.apiUrl}/${encodedFollowerId}/follow/${encodedFollowedId}`,
      {},
      { responseType: 'text' },
    );
  }

  unfollowUser(followerId: string | number, followedId: string | number): Observable<string> {
    const encodedFollowerId = encodeURIComponent(String(followerId));
    const encodedFollowedId = encodeURIComponent(String(followedId));
    return this.http.delete(
      `${this.apiUrl}/${encodedFollowerId}/follow/${encodedFollowedId}`,
      { responseType: 'text' },
    );
  }

}
