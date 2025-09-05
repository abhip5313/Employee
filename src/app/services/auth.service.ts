import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly LOGIN_KEY = 'isLoggedIn';
  private readonly ROLE_KEY = 'role';  // ✅ guard शी match
  private readonly BASE_URL = 'https://localhost:7165/api/Auth';

  constructor(private http: HttpClient) {}

  // ✅ Local login state
  login(userRole: string) {
    localStorage.setItem(this.LOGIN_KEY, 'true');
    localStorage.setItem(this.ROLE_KEY, userRole);
  }

  logout() {
    localStorage.removeItem(this.LOGIN_KEY);
    localStorage.removeItem(this.ROLE_KEY);
  }

  isLoggedIn(): boolean {
    return localStorage.getItem(this.LOGIN_KEY) === 'true';
  }

  getUserRole(): string {
    return localStorage.getItem(this.ROLE_KEY) ?? '';
  }

  // ✅ Forgot Password APIs
  sendOtp(payload: { email: string; userType: string }): Observable<any> {
    return this.http.post(`${this.BASE_URL}/forgot-password`, payload);
  }

  verifyOtp(payload: { email: string; otp: string }): Observable<any> {
    return this.http.post(`${this.BASE_URL}/verify-otp`, payload);
  }

  resetPassword(payload: { email: string; otp: string; newPassword: string }): Observable<any> {
    return this.http.post(`${this.BASE_URL}/reset-password`, payload);
  }
}
