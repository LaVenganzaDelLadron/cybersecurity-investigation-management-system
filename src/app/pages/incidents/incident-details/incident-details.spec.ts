import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { IncidentDetails } from './incident-details';

describe('IncidentDetails', () => {
  let component: IncidentDetails;
  let fixture: ComponentFixture<IncidentDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidentDetails],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(IncidentDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
