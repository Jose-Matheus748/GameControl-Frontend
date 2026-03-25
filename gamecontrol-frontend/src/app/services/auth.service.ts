import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse } from '../models/auth-response.model';
import { LoginDTO } from '../models/login-dto.model';
import { User } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user = signal<User | null>(null);

  constructor(private http: HttpClient) {
    this.loadFromStorage();
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  private loadFromStorage() {
    if (!this.isBrowser()) return;

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (token && userId) {
      this.http.get<User>(`http://localhost:8080/user/${userId}`)
        .subscribe(user => this.user.set(user));
    }
  }

  login(loginDTO: LoginDTO): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`http://localhost:8080/login`, loginDTO)
      .pipe(
        tap(res => {
          if (this.isBrowser() && res.user?.id != null) {
            localStorage.setItem('token', res.token);
            localStorage.setItem('userId', res.user.id.toString());
          }
          this.user.set(res.user ?? null);
        })
      );
  }

  logout() {
    if (this.isBrowser()) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
    }
    this.user.set(null);
  }

  isLoggedIn(): boolean {
    return this.user() !== null;
  }
}
