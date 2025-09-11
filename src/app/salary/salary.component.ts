import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface Salary {
  employeeId: number;
  employeeName: string;
  departmentName: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  payDate: string;
}

export interface PaymentDto {
  id: number;
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
    private https: HttpClient,
    fb: FormBuilder,
    private datePipe: DatePipe
  ) {
    this._frmGroup = fb.group({
      employeeId: ['', Validators.required],
      employeeName: ['', Validators.required],
      departmentName: [''],   // readonly field
      basicSalary: ['', Validators.required],
      allowances: ['', Validators.required],
      deductions: ['', Validators.required],
      payDate: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadPayments();
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
    if (!empId) return;

    this.https.get<any>(`https://localhost:7165/api/Salary/GetEmployeeInfo/${empId}`)
      .subscribe({
        next: res => {
          if (res) {
            this._frmGroup.patchValue({
  employeeName: res.employeeName,
  basicSalary: res.basicSalary,
  departmentName: res.departmentName   // <-- corrected
});
          } else {
            Swal.fire('No data found', '', 'info');
            this._frmGroup.patchValue({
              employeeName: '',
              basicSalary: '',
              departmentName: ''
            });
          }
        },
        error: () => {
          Swal.fire('Employee Not Found', '', 'error');
          this._frmGroup.patchValue({
            employeeName: '',
            basicSalary: '',
            departmentName: ''
          });
        }
      });
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

    const safeDate = (p.payDate || '').replace(/[\/\\:]/g, '-');
    doc.save(`SalarySlip_${p.employeeName}_${safeDate}.pdf`);
  }
}
