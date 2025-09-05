import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgbNavModule],
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class AttendanceComponent implements OnInit {
  _frmGroup: FormGroup;
  attendances: any[] = [];
  filterDate: string = new Date().toISOString().split('T')[0]; 

  // ✅ Extra for Employee Attendance tab
  employeeIdFilter: string = '';
  monthFilter: string = '';
  employeeAttendance: any[] = [];

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this._frmGroup = this.fb.group({
      Id: [''],
      employeeName: [''],
      date: [new Date().toISOString().split('T')[0]],
      timeIn: [''],
      timeOut: [''],
      status: ['0'], 
    });
  }

  ngOnInit() {
    this.loadAttendances();
  }

  onEmployeeIdChange() {
    const Id = this._frmGroup.value.Id;
    if (Id) {
      this.http.get<any>(`https://localhost:7165/api/Attendance/GetEmployeeName/${Id}`)
        .subscribe({
          next: (res: any) => {
            this._frmGroup.patchValue({ employeeName: res.nm });
          },
          error: () => {
            Swal.fire('Not Found', 'Employee not found', 'error');
            this._frmGroup.patchValue({ employeeName: '' });
          }
        });
    }
  }

  calculateTotalTime(inTime: string, outTime: string): string {
    const [inHours, inMinutes] = inTime.split(':').map(Number);
    const [outHours, outMinutes] = outTime.split(':').map(Number);

    const inDate = new Date();
    const outDate = new Date();

    inDate.setHours(inHours, inMinutes, 0);
    outDate.setHours(outHours, outMinutes, 0);

    const diffMs = outDate.getTime() - inDate.getTime();
    if (diffMs < 0) return 'Invalid time';

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours}h ${diffMinutes}m`;
  }

  save() {
    const formData = this._frmGroup.value;
    if (!formData.timeIn || !formData.timeOut) {
      Swal.fire('Error', 'Please enter both InTime and OutTime', 'warning');
      return;
    }
    const totalTime = this.calculateTotalTime(formData.timeIn, formData.timeOut);

    const attendanceData = {
      Dt: formData.date,
      InTime: formData.timeIn,
      OutTime: formData.timeOut,
      TotalTime: totalTime,
      Uid: formData.Id,
      Unm: formData.employeeName,
      Status: formData.status
    };

    this.http.post('https://localhost:7165/api/Attendance', attendanceData)
      .subscribe({
        next: () => {
          Swal.fire('Success', 'Attendance Submitted', 'success');
          this._frmGroup.reset({
            status: '0',
            date: new Date().toISOString().split('T')[0]
          });
          this.loadAttendances();
        },
        error: () => {
          Swal.fire('Error', 'Failed to submit attendance', 'error');
        }
      });
  }

  loadAttendances() {
    this.http.get<any[]>('https://localhost:7165/api/Attendance/GetAllAttendance')
      .subscribe({
        next: (data) => this.attendances = data,
        error: () => Swal.fire('Error', 'Could not load attendance data', 'error')
      });
  }

  get filteredAttendances() {
    if (!this.filterDate) return this.attendances;
    return this.attendances.filter(att => {
      const attDate = att.dt || att.Dt;
      if (!attDate) return false;
      return attDate.split('T')[0] === this.filterDate;
    });
  }

  // ✅ Employee-wise Attendance filter
  filterEmployeeAttendance() {
    if (!this.employeeIdFilter || !this.monthFilter) {
      Swal.fire('Error', 'Please enter Employee ID and Month', 'warning');
      return;
    }

    this.http.get<any[]>(`https://localhost:7165/api/Attendance/GetEmployeeAttendance/${this.employeeIdFilter}`)
      .subscribe({
        next: (data) => {
          this.employeeAttendance = data.filter(att => {
            const attDate = att.dt || att.Dt;
            if (!attDate) return false;
            return attDate.startsWith(this.monthFilter); 
          });
        },
        error: () => {
          Swal.fire('Error', 'Could not load employee attendance', 'error');
        }
      });
  }
}
