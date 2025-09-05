import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryNotificationComponent } from './salary-notification.component';

describe('SalaryNotificationComponent', () => {
  let component: SalaryNotificationComponent;
  let fixture: ComponentFixture<SalaryNotificationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SalaryNotificationComponent]
    });
    fixture = TestBed.createComponent(SalaryNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
