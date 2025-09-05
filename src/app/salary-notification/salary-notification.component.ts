import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

export interface SalaryNotificationDto {
  id: number;
  departmentId: number;
  departmentName: string;
  employeeId: number;
  employeeName: string;
  basicSalary: number;
  deductions: number;
  allowances: number;
  payDate: string; 
  isPaid?: boolean;   // ✅ नवीन field
  isPaying?: boolean; // ✅ UI loader साठी
}

@Component({
  selector: 'app-salary-notification',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  providers: [DatePipe],
  templateUrl: './salary-notification.component.html',
  styleUrls: ['./salary-notification.component.css']
})
export class SalaryNotificationComponent implements OnInit {
  notifications: SalaryNotificationDto[] = [];
  loading = false;
  errorMsg = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    this.errorMsg = '';

    this.http.get<SalaryNotificationDto[]>('https://localhost:7165/api/SalaryNotification')
      .subscribe({
        next: res => {
          this.notifications = Array.isArray(res) ? res : [];
          this.loading = false;
        },
        error: err => {
          console.error('Failed to load notifications:', err);
          this.errorMsg = 'Failed to load salary notifications. Please try again.';
          this.loading = false;
        }
      });
  }

  getNet(n: SalaryNotificationDto): number {
    return Number(n.basicSalary) + Number(n.allowances) - Number(n.deductions);
  }

  trackById(_idx: number, item: SalaryNotificationDto) {
    return item.id;
  }

  refresh(): void {
    this.loadNotifications();
  }

  // ✅ Pay click logic
  payNotification(n: SalaryNotificationDto): void {
    n.isPaying = true;

    // 3 सेकंद loader दाखव
    setTimeout(() => {
      this.http.patch(`https://localhost:7165/api/SalaryNotification/${n.id}/pay`, {})
        .subscribe({
          next: () => {
            n.isPaying = false;
            n.isPaid = true;
            // UI मधून remove करा
            this.notifications = this.notifications.filter(x => x.id !== n.id);
          },
          error: err => {
            console.error('Payment update failed:', err);
            n.isPaying = false;
            alert('Failed to mark as paid.');
          }
        });
    }, 3000);
  }
}
