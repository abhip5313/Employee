import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

interface Rating {
  id: number;
  employeeId: number;
  comments: string;
  score: number;
  ratingDate: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, HttpClientModule, NgbNavModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  employeeId: number | null = null;
  employee: any = null;

  employeeAttendance: any[] = [];
  filteredAttendance: any[] = [];

  payments: any[] = [];
  loadingPayments = false;
  selectedSlip: any = null;
  showModal = false;

  ratings: Rating[] = [];
  ratingError = '';

  baseUrl = 'https://localhost:7165';
  activeTab = 1;

  months = [
    { name: 'January', value: 1 }, { name: 'February', value: 2 },
    { name: 'March', value: 3 }, { name: 'April', value: 4 },
    { name: 'May', value: 5 }, { name: 'June', value: 6 },
    { name: 'July', value: 7 }, { name: 'August', value: 8 },
    { name: 'September', value: 9 }, { name: 'October', value: 10 },
    { name: 'November', value: 11 }, { name: 'December', value: 12 }
  ];
  years: number[] = [];
  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();

  salary: {
    employeeName: string;
    departmentName: string;
    basicSalary: number;
    allowances: number;
    deductions: number;
    payDate?: Date | null;
  } | null = null;

  isPaid: boolean | null = null;

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    // Populate last 5 years
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= currentYear - 5; y--) {
      this.years.push(y);
    }

    // Get employee ID from route
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.employeeId = id;
        this.loadEmployee(id);
        this.loadSalary(); // Load current month/year salary by default
      }
    });
  }

  loadEmployee(id: number) {
    this.http.get(`${this.baseUrl}/api/Employee/${id}`).subscribe({
      next: (res: any) => {
        this.employee = {
          ...res,
          joiningDate: res.joiningDate ? new Date(res.joiningDate).toLocaleDateString() : 'N/A'
        };
      },
      error: err => console.error('Error loading employee:', err)
    });
  }

  getProfilePic(): string {
    return this.employee?.profilePic 
      ? `${this.baseUrl}/${this.employee.profilePic}` 
      : 'assets/default-profile.png';
  }

  // ✅ Load salary based on selected month/year
// ✅ Load salary based on selected month/year
loadSalary() {
  if (!this.employeeId) return;

  const url = `${this.baseUrl}/api/Salary/GetEmployeeDetails/${this.employeeId}?month=${this.selectedMonth}&year=${this.selectedYear}`;

  this.http.get<any>(url).subscribe({
    next: (res) => {
      if (res && Object.keys(res).length > 0) {
        const payDate = res.payDate ? new Date(res.payDate) : null;

        this.salary = {
          employeeName: res.employeeName,
          departmentName: res.departmentName,
          basicSalary: res.basicSalary,
          allowances: res.allowances,
          deductions: res.deductions,
          payDate: payDate
        };

        // Check if salary is paid
        if (this.employeeId !== null) {
          this.checkIsPaid(this.employeeId, this.selectedMonth, this.selectedYear);
        }
      } else {
        // ❌ No data for this duration
        this.salary = null;
        this.isPaid = null;
      }
    },
    error: (err) => {
      console.error('Error fetching salary:', err);
      this.salary = null;
      this.isPaid = null;
    }
  });
}


  // ✅ Updated to include month/year filter for isPaid check
  checkIsPaid(empId: number, month: number, year: number) {
    const isPaidUrl = `${this.baseUrl}/api/SalaryNotification/IsPaid/${empId}?month=${month}&year=${year}`;

    this.http.get<boolean>(isPaidUrl).subscribe({
      next: (res: boolean) => {
        this.isPaid = res;
      },
      error: err => {
        console.error('Error checking paid status:', err);
        this.isPaid = null;
      }
    });
  }

  loadRatings(employeeId: number): void {
    this.http.get<Rating[]>(`${this.baseUrl}/api/Rating/employee/${employeeId}`).subscribe({
      next: res => this.ratings = res,
      error: err => {
        console.error('Failed to load ratings:', err);
        this.ratingError = 'No ratings found.';
      }
    });
  }

  filterEmployeeAttendance() {
    if (!this.employeeId) {
      Swal.fire('Error', 'Employee ID is missing', 'warning');
      return;
    }

    this.http.get<any[]>(`${this.baseUrl}/api/Attendance/GetEmployeeAttendance/${this.employeeId}`).subscribe({
      next: (data) => {
        this.employeeAttendance = data;
        this.filteredAttendance = this.employeeAttendance.filter(att => {
          const attDateStr = att.dt || att.Dt;
          if (!attDateStr) return false;
          const attDate = new Date(attDateStr);
          return (
            attDate.getMonth() + 1 === this.selectedMonth &&
            attDate.getFullYear() === this.selectedYear
          );
        });
      },
      error: () => {}
    });
  }

  

  loadPaymentsByEmployee(empId: number) {
    this.loadingPayments = true;
    this.http.get<any[]>(`${this.baseUrl}/api/SalaryNotification/employee/${empId}?includePaid=true`).subscribe({
      next: (res) => {
        this.payments = (Array.isArray(res) ? res : []).filter(p => p.isPaid);
        this.loadingPayments = false;
      },
      error: (err) => {
        console.error('Failed to load payments:', err);
        this.loadingPayments = false;
        this.payments = [];
      }
    });
  }

  getNet(p: any): number {
    return Number(p.basicSalary) + Number(p.allowances) - Number(p.deductions);
  }

  viewSlip(p: any) {
    this.selectedSlip = p;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedSlip = null;
  }

  onTabChange(event: any) {
    this.activeTab = event.nextId;
    if (this.activeTab === 1) {
      this.loadSalary();
    } else if (this.activeTab === 2) {
      this.filterEmployeeAttendance();
    } else if (this.activeTab === 3 && this.employeeId) {
      this.loadPaymentsByEmployee(this.employeeId);
    } else if (this.activeTab === 4 && this.employeeId) {
      this.loadRatings(this.employeeId);
    }
  }

  // Back to EmployeeComponent with Details tab active
  goToEmployeeTab() {
    this.router.navigate(['/employee'], { queryParams: { tab: 2 } });
  }
}
