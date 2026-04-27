import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse } from '../models/auth-response.model';
import { LoginDTO } from '../models/login-dto.model';
import { Usuario, UsuarioService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user = signal<Usuario | null>(null);
  isReady = signal(false);

  private authReady: Promise<void>;

  constructor(
    private http: HttpClient,
    private userService: UsuarioService,
  ) {
    this.authReady = this.loadFromStorage();
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  private loadFromStorage(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.isBrowser()) {
        this.isReady.set(true);
        resolve();
        return;
      }

      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (token && userId) {
        this.userService.getById(userId).subscribe({
          next: (user) => {
            this.user.set(user);
            this.isReady.set(true);
            resolve();
          },
          error: () => {
            this.logout();
            this.isReady.set(true);
            resolve();
          },
        });
      } else {
        this.isReady.set(true);
        resolve();
      }
    });
  }

  waitForAuth(): Promise<void> {
    return this.authReady;
  }

  login(loginDTO: LoginDTO): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`http://localhost:8080/api/users/login`, loginDTO)
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
