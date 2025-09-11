import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './auth.guard';
import { ManagerDashboardComponent } from './managerdashboard/managerdashboard.component';
import { AccDashboardComponent } from './acc-dashboard/acc-dashboard.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
  { path: '', component: LoginComponent },

  // Profile page
{ path: 'profile/:id', component: ProfileComponent },

  // HR Dashboard
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'hr' }
  },

  // Account Dashboard
  {
    path: 'account-dashboard',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./account-dashboard/account-dashboard.component').then(
        m => m.AccountDashboardComponent
      ),
    data: { expectedRole: 'account' }
  },

  // Salary Notification
  {
    path: 'salarynotification',
    loadComponent: () =>
      import('./salary-notification/salary-notification.component').then(
        m => m.SalaryNotificationComponent
      ),
    canActivate: [AuthGuard]
  },

  // Manager Dashboard
  {
    path: 'manager-dashboard',
    component: ManagerDashboardComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'manager' }
  },

  // Unauthorized
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./unauthorized/unauthorized.component').then(
        m => m.UnauthorizedComponent
      ),
  },

  // Payments
  {
    path: 'payment',
    loadComponent: () =>
      import('./payments/payments.component').then(m => m.PaymentsComponent),
    canActivate: [AuthGuard],
    data: { expectedRole: 'account' }
  },

  // fallback
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
