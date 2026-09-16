import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '../../../core/services/category.service';
import { CategotyForm } from './categoty-form';

describe('CategotyForm', () => {
  let component: CategotyForm;
  let fixture: ComponentFixture<CategotyForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategotyForm],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        { provide: CategoryService, useValue: {} },
        { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CategotyForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
