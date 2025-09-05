import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccDashboardComponent } from './acc-dashboard.component';

describe('AccDashboardComponent', () => {
  let component: AccDashboardComponent;
  let fixture: ComponentFixture<AccDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AccDashboardComponent]
    });
    fixture = TestBed.createComponent(AccDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
