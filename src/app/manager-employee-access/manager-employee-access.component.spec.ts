import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerEmployeeAccessComponent } from './manager-employee-access.component';

describe('ManagerEmployeeAccessComponent', () => {
  let component: ManagerEmployeeAccessComponent;
  let fixture: ComponentFixture<ManagerEmployeeAccessComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManagerEmployeeAccessComponent]
    });
    fixture = TestBed.createComponent(ManagerEmployeeAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
