import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

export interface PaymentDto {
  id: number;
  departmentId: number;
  departmentName: string;
  employeeId: number;
  employeeName: string;
  basicSalary: number;
  deductions: number;
  allowances: number;
  payDate: string; // ISO string
  isPaid: boolean;

  // Optional fields (if available in API or can be derived)
  designation?: string;
  bankName?: string;
  chequeNo?: string;
}

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  providers: [DatePipe],
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css']
})
export class PaymentsComponent implements OnInit {
  payments: PaymentDto[] = [];
  loading = false;
  errorMsg = '';

  // Modal state
  showModal = false;
  selectedSlip: PaymentDto | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  // Load only paid salary notifications
  loadPayments(): void {
    this.loading = true;
    this.errorMsg = '';

    this.http
      .get<PaymentDto[]>('https://localhost:7165/api/SalaryNotification?includePaid=true')
      .subscribe({
        next: (res) => {
          this.payments = (Array.isArray(res) ? res : []).filter((x) => x.isPaid);
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load payments:', err);
          this.errorMsg = 'Failed to load payments. Please try again.';
          this.loading = false;
        }
      });
  }

  // Calculate net salary: Basic + Allowances - Deductions
  getNet(p: PaymentDto): number {
    return Number(p.basicSalary) + Number(p.allowances) - Number(p.deductions);
  }

  // Show the selected slip in modal
  viewSlip(p: PaymentDto): void {
    this.selectedSlip = p;
    this.showModal = true;
  }

  // Close modal and reset selected slip
  closeModal(): void {
    this.showModal = false;
    this.selectedSlip = null;
  }

  // For ngFor trackBy optimization
  trackById(_idx: number, item: PaymentDto): number {
    return item.id;
  }
}
