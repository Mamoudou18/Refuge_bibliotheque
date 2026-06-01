import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Deconnexion } from './deconnexion';

describe('Deconnexion', () => {
  let component: Deconnexion;
  let fixture: ComponentFixture<Deconnexion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Deconnexion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Deconnexion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
