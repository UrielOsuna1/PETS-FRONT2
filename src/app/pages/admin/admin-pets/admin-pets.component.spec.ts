import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPetsComponent } from './admin-pets.component';

describe('AdminPetsComponent', () => {
  let component: AdminPetsComponent;
  let fixture: ComponentFixture<AdminPetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPetsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminPetsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
