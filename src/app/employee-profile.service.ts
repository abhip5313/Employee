import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeProfileService {
  private apiUrl = 'http://localhost:5130/api/EmployeeProfile'; // backend endpoint

  constructor(private http: HttpClient) {}

  getEmployeeProfile(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}
