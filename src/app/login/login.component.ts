import { Component, OnDestroy } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnDestroy {
  _frmGroup: FormGroup;
  autherror = '';

  // Forgot password workflow
  forgot = { open: false, step: 1 };
  forgotForm: FormGroup;
  otpForm: FormGroup;
  resetForm: FormGroup;

  sendingOtp = false;
  verifyingOtp = false;
  resetting = false;
  resendCooldown = 0;
  timerSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this._frmGroup = this.fb.group({
      Id: ['', [Validators.required]],
      Pwd: ['', [Validators.required]],
      UserType: ['', [Validators.required]], // hr | account | manager
    });

    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      userType: ['']
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });

    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8), this.alphaNumValidator]],
      confirm: ['', [Validators.required]]
    }, { validators: this.matchPasswords });
  }

  // Login logic
  Login() {
    if (this._frmGroup.invalid) {
      this._frmGroup.markAllAsTouched();
      return;
    }

    const payload = {
      ...this._frmGroup.value,
      Id: Number(this._frmGroup.value.Id),
    };

    this.autherror = '';

    this.http.post('https://localhost:7165/api/Login', payload).subscribe(
      (res: any) => {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('role', this._frmGroup.value.UserType);

        Swal.fire({
          icon: 'success',
          title: 'Login Successful',
          text: `Welcome, ${this._frmGroup.value.UserType}!`,
          confirmButtonColor: '#3085d6',
        });

        // Role-based redirect
        const role = this._frmGroup.value.UserType;
        if (role === 'manager') this.router.navigate(['/manager-dashboard']);
        else if (role === 'account') this.router.navigate(['/account-dashboard']);
        else this.router.navigate(['/home']);
      },
      (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: err?.error?.message || 'Invalid credentials',
        });
      }
    );
  }

  // Forgot Password
  openForgot() {
    const role = this._frmGroup.value.UserType;

    if (role === 'manager') {
      Swal.fire('Not Allowed', 'Forgot password is only available for HR and Accountant.', 'warning');
      return;
    }

    this.forgot.open = true;
    this.forgot.step = 1;
    this.forgotForm.patchValue({
      email: this._frmGroup.value.Id || '',
      userType: role
    });
  }

  closeForgot() {
    this.forgot.open = false;
    this.sendingOtp = this.verifyingOtp = this.resetting = false;
    this.resendCooldown = 0;
    this.timerSub?.unsubscribe();
    this.forgotForm.reset();
    this.otpForm.reset();
    this.resetForm.reset();
  }

  sendOtp() {
    if (this.forgotForm.invalid) return;
    this.sendingOtp = true;
    this.http.post('https://localhost:7165/api/Auth/forgot-password', {
      email: this.forgotForm.value.email,
      userType: this.forgotForm.value.userType
    }).subscribe({
      next: () => {
        this.sendingOtp = false;
        this.forgot.step = 2;
        this.startCooldown(60);
        Swal.fire('OTP sent', 'Check your email for the code.', 'success');
      },
      error: (e) => {
        this.sendingOtp = false;
        Swal.fire('Error', e?.error?.message || 'Failed to send OTP', 'error');
      }
    });
  }

  resendOtp() {
    if (this.resendCooldown > 0) return;
    this.sendOtp();
  }

  verifyOtp() {
    if (this.otpForm.invalid) return;
    this.verifyingOtp = true;
    this.http.post('https://localhost:7165/api/Auth/verify-otp', {
      email: this.forgotForm.value.email,
      userType: this.forgotForm.value.userType,
      otp: this.otpForm.value.otp
    }).subscribe({
      next: () => {
        this.verifyingOtp = false;
        this.forgot.step = 3;
        Swal.fire('Verified', 'OTP verified. Set your new password.', 'success');
      },
      error: (e) => {
        this.verifyingOtp = false;
        Swal.fire('Invalid OTP', e?.error?.message || 'Please try again.', 'error');
      }
    });
  }

  resetPassword() {
    if (this.resetForm.invalid) return;
    this.resetting = true;
    this.http.post('https://localhost:7165/api/Auth/reset-password', {
      email: this.forgotForm.value.email,
      userType: this.forgotForm.value.userType,
      otp: this.otpForm.value.otp,
      newPassword: this.resetForm.value.newPassword
    }).subscribe({
      next: () => {
        this.resetting = false;
        Swal.fire('Success', 'Password updated. Please login.', 'success');
        this.closeForgot();
      },
      error: (e) => {
        this.resetting = false;
        Swal.fire('Error', e?.error?.message || 'Failed to reset password', 'error');
      }
    });
  }

  // Validators
  private matchPasswords(group: AbstractControl): ValidationErrors | null {
    const p = group.get('newPassword')?.value;
    const c = group.get('confirm')?.value;
    return p && c && p !== c ? { mismatch: true } : null;
  }

  private alphaNumValidator(control: AbstractControl): ValidationErrors | null {
    const v = control.value as string;
    if (!v) return null;
    const hasNum = /\d/.test(v);
    const hasAlpha = /[A-Za-z]/.test(v);
    return hasNum && hasAlpha ? null : { weak: true };
  }

  private startCooldown(seconds: number) {
    this.resendCooldown = seconds;
    this.timerSub?.unsubscribe();
    this.timerSub = interval(1000).subscribe(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) this.timerSub?.unsubscribe();
    });
  }

  ngOnDestroy(): void {
    this.timerSub?.unsubscribe();
  }
}
