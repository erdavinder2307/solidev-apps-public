import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecideMateProComponent } from './decide-mate-pro.component';

describe('DecideMateProComponent', () => {
  let component: DecideMateProComponent;
  let fixture: ComponentFixture<DecideMateProComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DecideMateProComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DecideMateProComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
