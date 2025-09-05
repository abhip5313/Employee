import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { LoginComponent } from "./login/login.component";
import Swal from 'sweetalert2';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, CommonModule, LoginComponent, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'emp_project';
  sidebarOpen = false;
  collapsed: any;

  unpaidCount: number = 0; // 🔴 Notification count

  constructor(
    public Auth: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // page load झाल्यावर API call
    this.getUnpaidCount();
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    if (window.innerWidth <= 768) {
      this.sidebarOpen = false;
    }
  }

  logout() {
    this.Auth.logout();
    Swal.fire({
      position: "center",
      icon: "success",
      title: "Logout Successful",
      showConfirmButton: false,
      timer: 1500
    }).then(() => {
      this.router.navigate(['/']); // Redirect to login
    });
  }

  // Getter to check login state
  get isLoggedIn() {
    return this.Auth.isLoggedIn();
  }

  // Getter for user role
  get role() {
    return this.Auth.getUserRole();
  }

  // 🔴 Backend API call for unpaid salary count
  getUnpaidCount() {
    this.http.get<{ total: number; paid: number; unpaid: number }>(
      'https://localhost:7165/api/SalaryNotification/count'
    )
    .subscribe({
      next: (res) => {
        this.unpaidCount = res.unpaid;  // फक्त unpaid घेणार
      },
      error: (err) => {
        console.error("Error fetching unpaid salary count", err);
      }
    });
  }
}
