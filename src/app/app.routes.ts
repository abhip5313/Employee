import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { EmployeeComponent } from './employee/employee.component';
import { RatingComponent } from './rating/rating.component';
import { DepartmentComponent } from './department/department.component';
import { SalaryComponent } from './salary/salary.component';
import { AttendanceComponent } from './attendance/attendance.component';
import { SettingComponent } from './setting/setting.component';
import { EmployeeProfileComponent } from './employee-profile/employee-profile.component';
import { SalaryNotificationComponent } from './salary-notification/salary-notification.component';
import { PaymentsComponent } from './payments/payments.component';
import { ManagerDashboardComponent } from './managerdashboard/managerdashboard.component'; // <-- import manager dashboard
import { ManagerEmployeesComponent } from './manager-employees/manager-employees.component';
import { ManagerEmployeeAccessComponent } from './manager-employee-access/manager-employee-access.component';
import { LoginComponent } from './login/login.component';
import { AccDashboardComponent } from './acc-dashboard/acc-dashboard.component';
import { ProfileComponent } from './profile/profile.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'employee', component: EmployeeComponent },
  { path: 'employee-profile/:id', component: EmployeeProfileComponent },
  { path: 'department', component: DepartmentComponent },
  { path: 'attendance', component: AttendanceComponent },
  { path: 'salary', component: SalaryComponent },
  { path: 'rating', component: RatingComponent },
  { path: 'settings', component: SettingComponent },
  { path: 'payments', component: PaymentsComponent },
    { path: 'login', component: LoginComponent },
      { path: 'account/dashboard', component: AccDashboardComponent },




  // Manager dashboard route
  { path: 'manager-dashboard', component: ManagerDashboardComponent }, 
    { path: '', redirectTo: 'login', pathMatch: 'full' },  // 👈 प्रोजेक्ट run होताच login
      { path: 'profile/:id', component: ProfileComponent },

 

  { path: 'salarynotification', component: SalaryNotificationComponent },
    { path: 'manager-employees', component: ManagerEmployeesComponent },

  { path: 'manager-employee-access', component: ManagerEmployeeAccessComponent }, // ✅ Add this

  // Redirect unknown paths to home
  { path: '**', redirectTo: '' }
];
