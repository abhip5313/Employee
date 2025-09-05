import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmployeeProfileService } from '../employee-profile.service';

@Component({
  selector: 'app-employee-profile',
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.css']
})
export class EmployeeProfileComponent implements OnInit {
  employee: any;

  constructor(
    private route: ActivatedRoute,
    private profileService: EmployeeProfileService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id')); // get employee id from route
    this.profileService.getEmployeeProfile(id).subscribe({
      next: (res) => this.employee = res,
      error: (err) => console.error('Error loading profile', err)
    });
  }
}
