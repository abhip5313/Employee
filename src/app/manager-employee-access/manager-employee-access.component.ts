import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

interface ManagerEmployee {
  id: number;
  name: string;
  email: string;
}

interface Department {
  id: number;
  departmentnm: string;
  hasAccess: boolean; // toggle state
}

@Component({
  selector: 'app-manager-employee-access',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manager-employee-access.component.html',
  styleUrls: ['./manager-employee-access.component.css']
})
export class ManagerEmployeeAccessComponent implements OnInit {

  employees: ManagerEmployee[] = [];
  departments: Department[] = [];
  selectedManagerId: number | null = null;

  private readonly baseUrl = 'https://localhost:7165/api';
  private employeeApiUrl = 'https://localhost:7165/api/ManagerEmployees';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadManagers();
  }

  loadManagers() {
    this.http.get<ManagerEmployee[]>(`${this.employeeApiUrl}/GetAll`).subscribe({
      next: data => this.employees = data ?? [],
      error: err => Swal.fire('Error', 'Failed to load managers', 'error')
    });
  }

  viewAccess() {
    if (!this.selectedManagerId) return;

    this.http.get<Department[]>(`${this.baseUrl}/Department/user-departments/${this.selectedManagerId}`).subscribe({
      next: data => {
        // backend returns departments with hasAccess true/false for this manager employee
        this.departments = data ?? [];
      },
      error: err => Swal.fire('Error', 'Failed to load department access', 'error')
    });
  }

  toggleAccess(dept: Department) {
    dept.hasAccess = !dept.hasAccess;
  }

  saveAccess() {
    if (!this.selectedManagerId) return;

    // send each department access separately
    const requests = this.departments.map(d => ({
      EmployeeId: this.selectedManagerId,
      DepartmentId: d.id,
      HasAccess: d.hasAccess
    }));

    // call backend for each toggle (or send all at once if backend supports array)
    this.http.post(`${this.baseUrl}/Department/update-access`, requests).subscribe({
      next: () => Swal.fire('Success', 'Access updated successfully!', 'success'),
      error: err => Swal.fire('Error', 'Failed to save access', 'error')
    });
  }

}
