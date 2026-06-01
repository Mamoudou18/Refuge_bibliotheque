import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonCompte } from './mon-compte';

describe('MonCompte', () => {
  let component: MonCompte;
  let fixture: ComponentFixture<MonCompte>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonCompte]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonCompte);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
