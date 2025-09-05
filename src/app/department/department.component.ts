import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

interface Department {
  id: number;
  departmentnm: string;
  isActive: boolean;
}

interface Designation {
  id: number;
  name: string;             // designation name
  departmentNm: string;   // department name
  isActive: boolean;
}


@Component({
  selector: 'app-department',
  standalone: true,
  imports: [CommonModule, NgbNavModule, ReactiveFormsModule, FormsModule],
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.css']
})
export class DepartmentComponent implements OnInit {
  departments: Department[] = [];
  designations: Designation[] = [];

  _frmGroup: FormGroup;          // Department form
  designationForm: FormGroup;    // Designation form

  active = 1;
  designationActive = 1;

  private readonly baseUrl = 'https://localhost:7165/api';

  constructor(
    fb: FormBuilder,
    private http: HttpClient,
    private modalService: NgbModal,
    private auth: AuthService
  ) {
    // Department form
    this._frmGroup = fb.group({
      departmentnm: ['', Validators.required],
      isActive: [true]
    });

    // Designation form
    this.designationForm = fb.group({
      departmentId: ['', Validators.required],
      designationnm: ['', Validators.required],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadDepartments();
    this.loadDesignations();
  }

  // 🔹 Tabs switch
  onTabChange(event: any) {
    if (event?.nextId === 2) {
      this.loadDepartments();
    }
  }

  // 🔹 Load Departments
  loadDepartments() {
    this.http.get<Department[]>(`${this.baseUrl}/Department`).subscribe({
      next: (response) => (this.departments = response ?? []),
      error: (err) => {
        console.error('Failed to load departments:', err);
        if (err.status === 401) this.auth.logout();
      }
    });
  }

  // 🔹 फक्त Active departments designation dropdown साठी
  get activeDepartments(): Department[] {
    return this.departments.filter(d => d.isActive);
  }

  // 🔹 Load Designations
  loadDesignations() {
    this.http.get<Designation[]>(`https://localhost:7165/api/Designations`).subscribe({
      next: (response) => (this.designations = response ?? []),
      error: (err) => {
        console.error('Failed to load designations:', err);
        if (err.status === 401) this.auth.logout();
      }
    });
  }

  // 🔹 Save Department
  save() {
    if (this._frmGroup.invalid) {
      this._frmGroup.markAllAsTouched();
      return;
    }

    this.http.post(`${this.baseUrl}/Department`, this._frmGroup.value).subscribe({
      next: () => {
        this._frmGroup.reset({ departmentnm: '', isActive: true });
        Swal.fire({
          title: 'Department Added Successfully',
          icon: 'success',
          showConfirmButton: false,
          timer: 1000
        });
        this.loadDepartments();
      },
      error: (error) => {
        console.error(error);
        if (error.status === 401) this.auth.logout();
        Swal.fire({ icon: 'error', title: 'Save Failed', text: 'Could not save department.' });
      }
    });
  }

  // 🔹 Save Designation
  saveDesignation() {
    if (this.designationForm.invalid) {
      this.designationForm.markAllAsTouched();
      return;
    }

    const departmentId = Number(this.designationForm.value.departmentId);

    // ✅ API ला फक्त "name" लागतो
    const payload = {
      name: this.designationForm.value.designationnm
    };

    this.http.post(`${this.baseUrl}/Designations/${departmentId}`, payload).subscribe({
      next: () => {
        this.designationForm.reset({ departmentId: '', designationnm: '', isActive: true });
        Swal.fire({
          title: 'Designation Added Successfully',
          icon: 'success',
          showConfirmButton: false,
          timer: 1000
        });
        this.loadDesignations();
      },
      error: (error) => {
        console.error('Save Designation Failed:', error);
        if (error.status === 401) this.auth.logout();
        Swal.fire({ icon: 'error', title: 'Save Failed', text: 'Could not save designation.' });
      }
    });
  }

  // 🔹 Toggle Department Status
  toggleStatus(db: Department) {
    const updatedStatus = { ...db, isActive: !db.isActive };

    this.http.put(`${this.baseUrl}/Department/${db.id}`, updatedStatus).subscribe({
      next: () => (db.isActive = !db.isActive),
      error: (err) => {
        console.error('Failed to update department status', err);
        Swal.fire({ icon: 'error', title: 'Update Failed', text: 'Could not update department status.' });
      }
    });
  }

  // 🔹 Toggle Designation Status
  toggleDesignationStatus(dg: Designation) {
    const updatedStatus = { ...dg, isActive: !dg.isActive };

    this.http.put(`${this.baseUrl}/Designation/${dg.id}`, updatedStatus).subscribe({
      next: () => (dg.isActive = !dg.isActive),
      error: (err) => {
        console.error('Failed to update designation status', err);
        Swal.fire({ icon: 'error', title: 'Update Failed', text: 'Could not update designation status.' });
      }
    });
  }

  // 🔹 Delete Department
  deleteDepartment(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`https://localhost:7165/api/Department/${id}`).subscribe({
          next: () => {
            this.departments = this.departments.filter(d => d.id !== id);
            Swal.fire({ title: 'Deleted!', icon: 'success', showConfirmButton: false, timer: 1000 });
          },
          error: (err) => {
            console.error('Department delete failed:', err);
            if (err.status === 401) this.auth.logout();
            Swal.fire({ icon: 'error', title: 'Delete Failed', text: 'Could not delete department.' });
          }
        });
      }
    });
  }

  // 🔹 Delete Designation
  deleteDesignation(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`https://localhost:7165/api/Designations/${id}`).subscribe({
          next: () => {
            this.designations = this.designations.filter(d => d.id !== id);
            Swal.fire({ title: 'Deleted!', icon: 'success', showConfirmButton: false, timer: 1000 });
          },
          error: (err) => {
            console.error('Delete failed:', err);
            if (err.status === 401) this.auth.logout();
            Swal.fire({ icon: 'error', title: 'Delete Failed', text: 'Could not delete designation.' });
          }
        });
      }
    });
  }

  // 🔹 Getters for form validation in template
  get fDept() { return this._frmGroup.controls; }
  get fDesg() { return this.designationForm.controls; }
}
