import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './managerdashboard.component.html',
  styleUrls: ['./managerdashboard.component.css'],
})
export class ManagerDashboardComponent implements OnInit {
  employeesCount: number = 0;       // Manager Employees
  totalEmployees: number = 0;       // Total Employees
  departmentsCount: number = 0;
  paymentsCount: number = 0;
  todaysAttendance: number = 0;
  todayDate: string = '';

  private apiUrl = 'https://localhost:7165/api'; // Your backend base URL

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.todayDate = new Date().toLocaleDateString();

    this.loadEmployeesCount();
    this.loadTotalEmployees();
    this.loadDepartments();
    this.loadPayments();
    this.loadTodaysAttendance();
  }

  // ✅ Manager Employees Count
  loadEmployeesCount() {
    this.http
      .get<{ count: number }>(`${this.apiUrl}/ManagerEmployees/GetCount`)
      .subscribe({
        next: (res) => (this.employeesCount = res.count),
        error: (err) =>
          console.error('Error fetching manager employees count', err),
      });
  }

  // ✅ Total Employees Count
  loadTotalEmployees() {
  this.http.get<any>(`${this.apiUrl}/Employee/count`).subscribe({
    next: (res) => {
      console.log('Total Employees API response:', res);
      if (typeof res === 'number') {
        this.totalEmployees = res;
      } else if (res.count !== undefined) {
        this.totalEmployees = res.count;
      }
    },
    error: (err) => console.error('Error fetching total employees', err),
  });
}


  loadDepartments() {
    this.http.get<any[]>(`${this.apiUrl}/Department`).subscribe({
      next: (res) => (this.departmentsCount = res.length),
      error: (err) => console.error('Error fetching departments', err),
    });
  }

  loadPayments() {
    this.http
      .get<{ total: number; paid: number; unpaid: number }>(
        `${this.apiUrl}/SalaryNotification/count`
      )
      .subscribe({
        next: (res) => (this.paymentsCount = res.total),
        error: (err) => console.error('Error fetching payments', err),
      });
  }

  loadTodaysAttendance() {
    this.http
      .get<{ count: number }>(`${this.apiUrl}/Attendance/today`)
      .subscribe({
        next: (res) => (this.todaysAttendance = res.count),
        error: (err) => console.error('Error fetching attendance', err),
      });
  }
}
