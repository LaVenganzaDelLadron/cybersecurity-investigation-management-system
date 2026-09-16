import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotesForm } from './notes-form';

describe('NotesForm', () => {
  let component: NotesForm;
  let fixture: ComponentFixture<NotesForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotesForm],
    }).compileComponents();

    fixture = TestBed.createComponent(NotesForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
