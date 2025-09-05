import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-acc-dashboard',
  templateUrl: './acc-dashboard.component.html',
  styleUrls: ['./acc-dashboard.component.css']
})
export class AccDashboardComponent implements OnInit {
  totalPayments: number = 0;
  pendingPayments: number = 0;

  private apiUrl = 'https://localhost:7165/api/SalaryNotification/count';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchPaymentCounts();
  }

  fetchPaymentCounts() {
    this.http.get<any>(this.apiUrl).subscribe({
      next: (data) => {
        this.totalPayments = data.total;
        this.pendingPayments = data.unpaid;  // API response मधून unpaid count
      },
      error: (err) => {
        console.error('Error fetching payment counts', err);
      }
    });
  }
}
