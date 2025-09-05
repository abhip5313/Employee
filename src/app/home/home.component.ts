import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'home',
  standalone: true,
  imports: [CommonModule,HttpClientModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  totalEmployees: number = 0;
  totalDepartments: number = 0;


  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getEmployeeCount();
    this.getDepartmentCount();
  }

  getEmployeeCount() {
    this.http.get<number>('https://localhost:7165/api/Employee/count')
      .subscribe({
        next: (data) => this.totalEmployees = data,
        error: (err) => console.error('Failed to load employee count:', err)
      });
  }

  getDepartmentCount() {
    this.http.get<number>('https://localhost:7165/api/Department/count')
      .subscribe({
        next: (data) => this.totalDepartments = data,
        error: (err) => console.error('Failed to load department count:', err)
      });
  }
}

