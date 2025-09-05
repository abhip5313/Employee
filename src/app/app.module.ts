import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptor } from './services/auth.interceptor';
import { RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { EmployeeProfileComponent } from './employee-profile/employee-profile.component';
import { FormsModule } from '@angular/forms';

// जर हे standalone components नसतील तर declare करावे लागतील:
import { AccountDashboardComponent } from './account-dashboard/account-dashboard.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { SalaryNotificationComponent } from './salary-notification/salary-notification.component';
import { PaymentsComponent } from './payments/payments.component';
import { ManagerEmployeesComponent } from './manager-employees/manager-employees.component';
import { AccDashboardComponent } from './acc-dashboard/acc-dashboard.component';

@NgModule({
  declarations: [
  //   AppComponent,
  //   LoginComponent,
  //   EmployeeProfileComponent,
  //   AccountDashboardComponent,
  //   ManagerDashboardComponent,
  //   UnauthorizedComponent,
  //   SalaryNotificationComponent
  
    // PaymentsComponent
  
    // ManagerDashboardComponent
  
  //   ManagerdashboardComponent,
  // ManagerEmployeesComponent,
  // ManagerEmployeeAccessComponent
  
    // AccDashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    HttpClientModule,
    RouterModule,
    FormsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: []   // ✅ इथे AppComponent हवा
})
export class AppModule {}
