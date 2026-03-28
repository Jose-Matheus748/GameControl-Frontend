import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FollowService {
  private apiUrl = 'http://localhost:8080/api/follow';

  constructor(private http: HttpClient) {}

  followUser(followerId: number, followedId: number): Observable<string> {
    return this.http.post(`${this.apiUrl}/${followerId}/follow/${followedId}`, {}, { responseType: 'text' });
  }

  unfollowUser(followerId: number, followedId: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${followerId}/unfollow/${followedId}`, { responseType: 'text' });
  }

  getFollowers(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${userId}/followers`).pipe(
      map(res => res || []),
      catchError(() => of([]))
    );
  }

  getFollowing(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${userId}/following`).pipe(
      map(res => res || []),
      catchError(() => of([]))
    );
  }
}
