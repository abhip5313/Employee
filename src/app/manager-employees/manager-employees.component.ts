import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

interface ManagerEmployee {
  id: number;
  name: string;
  email: string;
  password: string;
  phone: string;
  designationName: string;
  profilePic?: string; // base64 or URL
}

interface Designation {
  id: number;
  designationNm: string;
}

@Component({
  selector: 'app-manager-employees',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbNavModule],
  templateUrl: './manager-employees.component.html',
  styleUrls: ['./manager-employees.component.css']
})
export class ManagerEmployeesComponent implements OnInit {
  employeeForm: FormGroup;
  employees: ManagerEmployee[] = [];
  designations: Designation[] = [];
  activeTab: number = 1;
  selectedFile: File | null = null;
  emailExists: boolean | null = null;

  // 🔹 Backend API URLs
  private employeeApiUrl = 'https://localhost:7165/api/ManagerEmployees';
  private designationApiUrl = 'https://localhost:7165/api/ManagerEmployeeDesignations';
  private emailApiUrl = 'https://localhost:7165/api/VerifiedEmail/check';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.employeeForm = this.fb.group({
      name: ['', Validators.required],
email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      phone: ['', Validators.required],
      designationId: ['', Validators.required],
      profilePic: [null]
    });
  }

  ngOnInit(): void {
    this.loadEmployees();
    this.loadDesignations();
  }

  // Load employees
  loadEmployees() {
    this.http.get<ManagerEmployee[]>(`${this.employeeApiUrl}/GetAll`).subscribe({
      next: (res) => this.employees = res.map(e => ({
        ...e,
        designationName: e.designationName || ''
      })),
      error: () => Swal.fire('Error', 'Failed to load employees', 'error')
    });
  }

  // Load designations
  loadDesignations() {
    this.http.get<Designation[]>(`${this.designationApiUrl}/GetAll`).subscribe({
      next: (res) => this.designations = res,
      error: () => Swal.fire('Error', 'Failed to load designations', 'error')
    });
  }

  // Handle file selection
  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  // ✅ Check if email already exists in VerifiedEmails table
 checkEmail() {
  const email = this.employeeForm.get('email')?.value;
  if (!email) return;

  this.http.post<boolean>(
    "https://localhost:7165/api/VerifiedEmail/check",
    { email: email }   // body मध्ये email DTO property शी match
  ).subscribe({
    next: (res) => {
      this.emailExists = res;
      
      console.log("API response:", res);
    },
    error: (err) => {
      console.error("Error while checking email:", err);
    }
  });
}



  // Add employee
  addEmployee() {
    if (this.employeeForm.invalid || this.emailExists) {
      Swal.fire('Error', this.emailExists ? 'Email already exists!' : 'Please fill all required fields', 'error');
      return;
    }

    const formValue = { ...this.employeeForm.value, profilePic: '' };

    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        formValue.profilePic = reader.result as string;
        this.saveEmployee(formValue);
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.saveEmployee(formValue);
    }
  }

  // Save employee via API
  saveEmployee(employeeData: any) {
    this.http.post(`${this.employeeApiUrl}/AddEmployee`, employeeData).subscribe({
      next: () => {
        Swal.fire('Success', 'Employee added successfully!', 'success');
        this.employeeForm.reset();
        this.selectedFile = null;
        this.activeTab = 2;
        this.loadEmployees();
      },
      error: (err) => {
        let message = 'Failed to add employee';
        if (err.error?.innerMessage) message += `: ${err.error.innerMessage}`;
        Swal.fire('Error', message, 'error');
      }
    });
  }

  // Delete employee
  deleteEmployee(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this record!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${this.employeeApiUrl}/Delete/${id}`).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Employee record has been deleted.', 'success');
            this.loadEmployees();
          },
          error: () => Swal.fire('Error', 'Failed to delete employee', 'error')
        });
      }
    });
  }
}
