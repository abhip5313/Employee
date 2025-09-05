import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Employee } from '../employee/employee.component';

@Component({
  selector: 'app-rating',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.css']
})
export class RatingComponent {
   employee: Employee[] = [];
 
    _frmGroup: FormGroup;
       constructor(private modalService: NgbModal, private http: HttpClient, fb: FormBuilder) {
         this._frmGroup = fb.group({
           comments: [''],
           employeeId: [''],
         score:['']
         });
     
       }

   ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees() {
   this.http.get<Employee[]>('https://localhost:7165/api/Employee/dropdown')
  .subscribe({
    next: data => {
      this.employee = data;
      console.log('Employee:', data); // DEBUG: बघा कन्सोलमध्ये डेटा येतोय का
    },
    error: err => {
      console.error('Failed to load employees:', err); // DEBUG
    }
  });


  }
  save(){
  if (this._frmGroup.invalid) {
    Swal.fire('Please fill all fields', '', 'warning');
    return;
  }

  this.http.post('https://localhost:7165/api/Rating', this._frmGroup.value)
    .subscribe({
      next: () => {
        Swal.fire('Success', 'Rating saved successfully', 'success');
        this._frmGroup.reset();
      },
      error: (error) => {
        Swal.fire('Error', 'Failed to save rating', 'error');
        console.error(error);
      }
    });
}
}

