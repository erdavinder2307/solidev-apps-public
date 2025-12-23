import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolidCareComponent } from './solid-care.component';

describe('SolidCareComponent', () => {
  let component: SolidCareComponent;
  let fixture: ComponentFixture<SolidCareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolidCareComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolidCareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
