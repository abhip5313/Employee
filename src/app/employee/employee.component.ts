import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalDismissReasons, NgbDatepickerModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

export interface Employee {
  id: number;
  nm: string;
  email: string;
  designationnm: string;
  departmentnm: string;
  mobile: string;
  pwd: string;
  BasicSalary: number;
  pf: number;
  JoiningDate?: string;
  ProfilePic?: string;
}

interface Department {
  id: number;
  departmentnm?: string;
  name?: string;
  isActive: boolean;
}

interface Designation {
  id: number;
  name: string;
}

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [
    CommonModule,
    NgbDatepickerModule,
    NgbNavModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent {
  isVerifyingEmail = false;
  isEmailVerified = false;
  otpSent = false;
  otpInput = '';
  generatedOtpId = '';

  departments: Department[] = [];
  designationsForSelectedDept: Designation[] = [];

  searchId = 0;
  employee: Employee[] = [];

  _frmGroup: FormGroup;
  active = 1;
  closeResult = '';
  currentEditingEmployeeId: number | null = null;

  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  private readonly baseUrl = 'https://localhost:7165/api';

  @ViewChild('Update', { static: false }) updateTpl!: TemplateRef<any>;
  searchName = '';
  showPassword = false;

  constructor(private modalService: NgbModal, private http: HttpClient, fb: FormBuilder) {
    this._frmGroup = fb.group({
      Nm: ['', [Validators.required]],
      Email: ['', [Validators.required, Validators.email]],
      Mobile: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(10), Validators.maxLength(10)]],
      Pwd: ['', [Validators.required, Validators.minLength(6)]],
      Departmentnm: ['', [Validators.required]],
      Designationnm: ['', [Validators.required]],
      BasicSalary: ['', [Validators.required]],
      Pf: ['', [Validators.required]],
      JoiningDate: ['', [Validators.required]],
      otp: ['']
    });
  }

  ngOnInit(): void {
    this.loadDepartments();
    this._frmGroup.get('Departmentnm')?.valueChanges.subscribe((depId: number) => {
      if (depId) this.loadDesignationsByDepartment(depId);
      else this.designationsForSelectedDept = [];
      this._frmGroup.get('Designationnm')?.reset('');
    });
  }

  loadDepartments() {
    this.http.get<Department[]>(`${this.baseUrl}/Department`).subscribe({
      next: data => this.departments = (data ?? []).filter(d => d.isActive),
      error: err => console.error('Failed to load departments:', err)
    });
  }

  loadDesignationsByDepartment(depId: number) {
    this.http.get<Designation[]>(`${this.baseUrl}/Department/${depId}/designations`).subscribe({
      next: list => this.designationsForSelectedDept = list ?? [],
      error: err => {
        console.error(`Failed to load designations for department ${depId}:`, err);
        this.designationsForSelectedDept = [];
      }
    });
  }

  onTabChange(event: any) {
    if (event.nextId === 2) this.loadEmployees();
    if (event.nextId === 1) this.resetForm();
  }

  loadEmployees() {
    this.http.get<Employee[]>(`${this.baseUrl}/Employee`).subscribe({
      next: res => this.employee = res ?? [],
      error: err => console.error('Error loading employees:', err)
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => this.previewUrl = reader.result;
      reader.readAsDataURL(this.selectedFile);
    }
  }

  save() {
    if (this._frmGroup.invalid) {
      this._frmGroup.markAllAsTouched();
      return;
    }

    const depId = this._frmGroup.value.Departmentnm;
    const dep = this.departments.find(d => d.id === +depId);
    const deptName = dep?.departmentnm ?? dep?.name ?? '';

    const desigId = this._frmGroup.value.Designationnm;
    const desig = this.designationsForSelectedDept.find(d => d.id === +desigId);
    const desigName = desig?.name ?? '';

    let formattedDate = '';
    const jd = this._frmGroup.value.JoiningDate;
    if (jd?.year) {
      const jsDate = new Date(jd.year, jd.month - 1, jd.day);
      formattedDate = jsDate.toISOString();
    } else if (jd) {
      formattedDate = new Date(jd).toISOString();
    }

    const formData = new FormData();
    formData.append('Nm', this._frmGroup.value.Nm);
    formData.append('Email', this._frmGroup.value.Email);
    formData.append('Mobile', this._frmGroup.value.Mobile);
    formData.append('Pwd', this._frmGroup.value.Pwd);
    formData.append('Departmentnm', deptName);
    formData.append('Designationnm', desigName);
    formData.append('BasicSalary', String(this._frmGroup.value.BasicSalary));
    formData.append('Pf', String(this._frmGroup.value.Pf));
    formData.append('JoiningDate', formattedDate);

    if (this.selectedFile) formData.append('ProfilePic', this.selectedFile);

    if (this.currentEditingEmployeeId) {
      this.http.put(`${this.baseUrl}/Employee/${this.currentEditingEmployeeId}`, formData).subscribe({
        next: () => {
          this.showToast('Employee Updated Successfully ✅', 'success');
          this.resetForm();
          this.loadEmployees();
          this.active = 2;
        },
        error: err => {
          console.error('Error updating employee:', err);
          this.showToast('Update Failed ❌', 'error');
        }
      });
    } else {
      this.http.post<Employee>(`${this.baseUrl}/Employee`, formData).subscribe({
        next: (res) => {
          this.showToast('Employee Added Successfully 🎉', 'success');
          this.resetForm();
          this.loadEmployees();
          this.active = 2;
          this.sendOfferLetter(res);
        },
        error: err => {
          console.error('Error adding employee:', err);
          this.showToast('Add Failed ❌', 'error');
        }
      });
    }
  }

  sendOfferLetter(emp: Employee) {
    const totalSalary = Number(emp.BasicSalary) + Number(emp.pf);

    const payload = {
      id: emp.id,
      nm: emp.nm,
      email: emp.email,
      pwd: emp.pwd,
      mobile: emp.mobile,
      profilePic: '',
      designationnm: emp.designationnm,
      companyName: 'Abhishek IT Soln Pvt. Ltd.',
      joiningDate: emp.JoiningDate,
      salary: totalSalary.toString()
    };

    this.http.post(`${this.baseUrl}/Email/SendOfferLetter`, payload).subscribe({
      next: () => this.showToast('Offer Letter sent successfully 📩', 'success'),
      error: err => {
        console.error('Failed to send offer letter:', err);
        this.showToast('Failed to send Offer Letter ❌', 'error');
      }
    });
  }

  private showToast(title: string, icon: 'success' | 'error' | 'warning' | 'info' | 'question') {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon,
      title,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true
    });
  }

  open(content: any, employeeToEdit?: Employee) {
    this.resetForm();
    if (employeeToEdit) {
      this.currentEditingEmployeeId = employeeToEdit.id;
      const dep = this.departments.find(d => (d.departmentnm ?? d.name) === employeeToEdit.departmentnm);
      if (dep) {
        let ngbDate: any = null;
        if (employeeToEdit.JoiningDate) {
          const dt = new Date(employeeToEdit.JoiningDate);
          ngbDate = { year: dt.getFullYear(), month: dt.getMonth() + 1, day: dt.getDate() };
        }

        this._frmGroup.patchValue({
          Nm: employeeToEdit.nm,
          Email: employeeToEdit.email,
          Mobile: employeeToEdit.mobile,
          Pwd: employeeToEdit.pwd,
          Departmentnm: dep.id,
          BasicSalary: employeeToEdit.BasicSalary,
          Pf: employeeToEdit.pf,
          JoiningDate: ngbDate
        });

        this.loadDesignationsByDepartment(dep.id);
        setTimeout(() => {
          const desig = this.designationsForSelectedDept.find(d => d.name === employeeToEdit.designationnm);
          this._frmGroup.patchValue({ Designationnm: desig?.id || '' });
        }, 300);

        this.previewUrl = employeeToEdit.ProfilePic ? `${this.baseUrl}/${employeeToEdit.ProfilePic}` : null;
      }
    } else this.currentEditingEmployeeId = null;

    this.modalService.open(content, { size: 'lg' }).result.then(
      result => this.closeResult = `Closed with: ${result}`,
      reason => this.closeResult = `Dismissed ${this.getDismissReason(reason)}`
    );
  }

  private resetForm() {
    this._frmGroup.reset();
    this.previewUrl = null;
    this.selectedFile = null;
    this.currentEditingEmployeeId = null;
    this.designationsForSelectedDept = [];
  }

  getEmployeeById(id: number): Employee | undefined {
    return this.employee.find(emp => emp.id === id);
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) return 'by pressing ESC';
    else if (reason === ModalDismissReasons.BACKDROP_CLICK) return 'by clicking on a backdrop';
    else return ` with: ${reason}`;
  }

  edit() { this.save(); }

  loadEmployeeById(id: number) {
    const emp = this.employee.find(e => e.id === id);
    if (emp) this.open(this.updateTpl, emp);
    else this.showToast(`No employee found with ID ${id} ❌`, 'error');
  }

  deleteEmployee(id: number) {
    Swal.fire({
      title: 'Are you sure?', text: "You won't be able to revert this!", icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6', confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${this.baseUrl}/Employee/${id}`).subscribe({
          next: () => { this.showToast('Employee Deleted Successfully 🗑️', 'success'); this.loadEmployees(); }
        });
      }
    });
  }

  get filteredEmployees(): Employee[] {
    if (!this.searchName.trim()) return this.employee;
    const searchVal = this.searchName.toLowerCase();
    const matched = this.employee.filter(e => (e.nm || '').toLowerCase().includes(searchVal));
    const others = this.employee.filter(e => !(e.nm || '').toLowerCase().includes(searchVal));
    return [...matched, ...others];
  }

  sendOtp() {
    const email = this._frmGroup.get('Email')?.value;
    if (!email || !this._frmGroup.get('Email')?.valid) { this.showToast('Please enter a valid email ❌', 'error'); return; }
    this.isVerifyingEmail = true;
    this.http.post<any>(`${this.baseUrl}/Email/SendOtp`, { email }).subscribe({
      next: (res) => {
        this.isVerifyingEmail = false;
        if (res.alreadyVerified) { this.isEmailVerified = true; this.showToast('Email already verified ℹ️', 'info'); return; }
        this.otpSent = true;
        this.generatedOtpId = res.otpId;
        this.showToast('OTP Sent to Email 📩', 'success');
      },
      error: () => { this.isVerifyingEmail = false; this.showToast('Failed to send OTP ❌', 'error'); }
    });
  }

  verifyOtp() {
    const email = this._frmGroup.get('Email')?.value;
    const otpValue = this._frmGroup.get('otp')?.value || this.otpInput;
    if (!otpValue) { this.showToast('Enter OTP ⚠️', 'warning'); return; }
    if (!this.generatedOtpId) { this.showToast('Request OTP first ❌', 'error'); return; }
    this.isVerifyingEmail = true;
    this.http.post<any>(`${this.baseUrl}/Email/VerifyOtp`, { email, otp: otpValue, otpId: this.generatedOtpId }).subscribe({
      next: (res) => {
        this.isVerifyingEmail = false;
        if (res?.isValid) { this.isEmailVerified = true; this.showToast('Email Verified ✅', 'success'); }
        else { this.isEmailVerified = false; this.showToast('Invalid OTP ❌', 'error'); }
      },
      error: () => { this.isVerifyingEmail = false; this.showToast('Server Error ❌', 'error'); }
    });
  }
}
