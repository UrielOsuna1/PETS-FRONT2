import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAuditsComponent } from './admin-audits.component';

describe('AdminAuditsComponent', () => {
  let component: AdminAuditsComponent;
  let fixture: ComponentFixture<AdminAuditsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAuditsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminAuditsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
