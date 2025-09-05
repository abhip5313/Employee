import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';  // ✅ correct import

export interface Salary {
  employeeId: number;
  employeeName: string;
  departmentId: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  payDate: string;
}

export interface PaymentDto {
  id: number;
  departmentId: number;
  departmentName: string;
  employeeId: number;
  employeeName: string;
  basicSalary: number;
  deductions: number;
  allowances: number;
  payDate: string;
  isPaid: boolean;
}

@Component({
  selector: 'app-salary',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbNavModule],
  providers: [DatePipe],
  templateUrl: './salary.component.html',
  styleUrls: ['./salary.component.css']
})
export class SalaryComponent implements OnInit {
  departments: any[] = [];
  payments: PaymentDto[] = [];
  _frmGroup: FormGroup;

  // modal state
  showModal = false;
  selectedSlip: PaymentDto | null = null;

  constructor(
    private modalService: NgbModal,
    private https: HttpClient,
    fb: FormBuilder,
    private datePipe: DatePipe
  ) {
    this._frmGroup = fb.group({
      departmentId: ['', Validators.required],
      employeeId: ['', Validators.required],
      employeeName: ['', Validators.required],
      basicSalary: ['', Validators.required],
      allowances: ['', Validators.required],
      deductions: ['', Validators.required],
      payDate: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadDepartments();
    this.loadPayments();
  }

  loadDepartments() {
    this.https.get<any[]>('https://localhost:7165/api/Department')
      .subscribe({
        next: data => this.departments = data.filter(d => d.isActive),
        error: err => console.error('Failed to load departments:', err)
      });
  }

  loadPayments(): void {
    this.https.get<PaymentDto[]>('https://localhost:7165/api/SalaryNotification?includePaid=true')
      .subscribe({
        next: res => this.payments = (Array.isArray(res) ? res : []).filter(x => x.isPaid),
        error: err => console.error('Failed to load payments:', err)
      });
  }

  onEmployeeIdChange() {
    const empId = this._frmGroup.value.employeeId;
    if (empId) {
      this.https.get<any>(`https://localhost:7165/api/Salary/GetEmployeeDetails/${empId}`)
        .subscribe({
          next: res => {
            const dept = this.departments.find(d => d.departmentnm === res.departmentnm);

            if (dept && dept.isActive === false) {
              Swal.fire('Department is inactive', '', 'warning');
            }

            this._frmGroup.patchValue({
              employeeName: res.employeeName,
              basicSalary: res.basicSalary,
              departmentId: dept ? dept.id : ''
            });
          },
          error: () => {
            Swal.fire('Employee Not Found', '', 'error');
            this._frmGroup.patchValue({
              employeeName: '',
              basicSalary: '',
              departmentId: ''
            });
          }
        });
    }
  }

  save() {
    if (this._frmGroup.invalid) {
      Swal.fire('Please fill all required fields', '', 'warning');
      return;
    }

    const salaryData: Salary = this._frmGroup.value;

    this.https.post('https://localhost:7165/api/Salary', salaryData)
      .subscribe({
        next: () => {
          this.https.post('https://localhost:7165/api/SalaryNotification', salaryData)
            .subscribe({
              next: () => console.log('Notification sent to Accounts Dept'),
              error: (err) => console.error('Failed to send notification:', err)
            });

          Swal.fire('Success', 'Salary saved & Notification sent', 'success');
          this._frmGroup.reset();
          this.loadPayments();
        },
        error: (error) => {
          console.error('Error adding salary:', error);
          Swal.fire('Error', 'Failed to save salary', 'error');
        }
      });
  }

  // Net Salary = Basic + Allowances - Deductions
  getNet(p: PaymentDto): number {
    return Number(p.basicSalary) + Number(p.allowances) - Number(p.deductions);
  }

  // open slip modal
  viewSlip(p: PaymentDto) {
    this.selectedSlip = p;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedSlip = null;
  }

  trackById(index: number, item: PaymentDto): number {
    return item.id;
  }

  // ✅ Download PDF Slip
  downloadSlip(p: PaymentDto) {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Salary Slip', 90, 15);

    autoTable(doc, {
      startY: 30,
      head: [['Field', 'Value']],
      body: [
        ['Employee ID', p.employeeId.toString()],
        ['Employee Name', p.employeeName],
        ['Department', p.departmentName],
        ['Basic Salary', p.basicSalary.toString()],
        ['Allowances', p.allowances.toString()],
        ['Deductions', p.deductions.toString()],
        ['Net Salary', this.getNet(p).toString()],
        ['Pay Date', this.datePipe.transform(p.payDate, 'mediumDate') || '']
      ]
    });

    // replace slashes in date for safe filename
    const safeDate = (p.payDate || '').replace(/[\/\\:]/g, '-');
    doc.save(`SalarySlip_${p.employeeName}_${safeDate}.pdf`);
  }
}
