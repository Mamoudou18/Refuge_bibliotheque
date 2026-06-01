import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Emprunts } from './emprunts';

describe('Emprunts', () => {
  let component: Emprunts;
  let fixture: ComponentFixture<Emprunts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Emprunts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Emprunts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
