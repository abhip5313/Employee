import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

export interface Employee {
  id: number;
  nm: string;
  email: string;
  designationnm: string;
  departmentnm: string;
  mobile: string;
  pwd: string;
  basicSalary: number;
  pf: number;
  joiningDate?: string;
  profilePic?: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  employeeId: number | null = null;
  employee: Employee | null = null;
  baseUrl = 'https://localhost:7165';

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.employeeId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.employeeId) {
      this.loadEmployee(this.employeeId);
    }
  }

  loadEmployee(id: number) {
    this.http.get<Employee>(`${this.baseUrl}/api/Employee/${id}`).subscribe({
      next: res => {
        console.log('Employee API Response:', res);
        this.employee = {
          ...res,
          joiningDate: res.joiningDate ? new Date(res.joiningDate).toISOString() : ''
        };
      },
      error: err => {
        console.error('Error loading employee:', err);
      }
    });
  }
}
