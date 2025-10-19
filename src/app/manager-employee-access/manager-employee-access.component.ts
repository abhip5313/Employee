import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

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

  // Simple toast function
  showToast(message: string, type: 'success' | 'error' | 'info' | 'warning') {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  loadManagers() {
    this.http.get<ManagerEmployee[]>(`${this.employeeApiUrl}/GetAll`).subscribe({
      next: data => this.employees = data ?? [],
      error: () => this.showToast('Failed to load managers', 'error')
    });
  }

  viewAccess() {
    if (!this.selectedManagerId) {
      this.showToast('Please select a manager', 'warning');
      return;
    }

    this.http.get<any[]>(`${this.baseUrl}/ManagerEmployeeDepartment/manager/${this.selectedManagerId}/departments`).subscribe({
      next: data => {
        this.departments = data.map(d => ({
          id: d.departmentId,
          departmentnm: d.departmentnm,
          hasAccess: d.isActive ?? false
        }));
      },
      error: () => this.showToast('Failed to load department access', 'error')
    });
  }

  toggleAccess(dept: Department) {
    dept.hasAccess = !dept.hasAccess;
  }

  saveAccess() {
    if (!this.selectedManagerId) {
      this.showToast('Please select a manager', 'warning');
      return;
    }

    if (!this.departments.length) {
      this.showToast('No departments to save', 'info');
      return;
    }

    // Loop through each department and call the toggle API individually
    const requests = this.departments.map(d => ({
      ManagerEmployeeId: this.selectedManagerId,
      DepartmentId: d.id,
      IsActive: d.hasAccess
    }));

    // Send each toggle update separately
    requests.forEach(req => {
      this.http.post(`${this.baseUrl}/ManagerEmployeeDepartment/update-toggle`, req).subscribe({
        next: () => this.showToast(`Department "${this.departments.find(dep => dep.id === req.DepartmentId)?.departmentnm}" updated!`, 'success'),
        error: () => this.showToast('Failed to save access', 'error')
      });
    });
  }
}
