import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { EditIncident } from './edit-incident';

describe('EditIncident', () => {
  let component: EditIncident;
  let fixture: ComponentFixture<EditIncident>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditIncident],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(EditIncident);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
