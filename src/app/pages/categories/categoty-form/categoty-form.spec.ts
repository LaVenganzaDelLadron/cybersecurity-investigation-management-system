import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategotyForm } from './categoty-form';

describe('CategotyForm', () => {
  let component: CategotyForm;
  let fixture: ComponentFixture<CategotyForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategotyForm],
    }).compileComponents();

    fixture = TestBed.createComponent(CategotyForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
