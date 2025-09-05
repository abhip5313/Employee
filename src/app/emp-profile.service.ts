import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmpProfileService {
  private baseUrl = 'http://localhost:5130/api'

  constructor(private http:HttpClient) { }

  getEmployeeProfile(id: number): Observable<any> {
    const employee$ = this.http.get(`${this.baseUrl}/Employee/${id}`);
    const salary$ = this.http.get(`${this.baseUrl}/Salary/employee/${id}`);
    const attendance$ = this.http.get(`${this.baseUrl}/Attendance/employee/${id}`);

    return forkJoin({ employee: employee$, salary: salary$, attendance: attendance$ });
  }
}
