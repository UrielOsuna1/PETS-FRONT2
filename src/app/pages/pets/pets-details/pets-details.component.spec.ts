import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PetsDetailsComponent } from './pets-details.component';

describe('PetsDetailsComponent', () => {
  let component: PetsDetailsComponent;
  let fixture: ComponentFixture<PetsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PetsDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PetsDetailsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
