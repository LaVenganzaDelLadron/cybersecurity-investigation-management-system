import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { AttachmentList } from './attachment-list';

describe('AttachmentList', () => {
  let component: AttachmentList;
  let fixture: ComponentFixture<AttachmentList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttachmentList],
      providers: [
        provideHttpClient(),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({}) } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AttachmentList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('selects a file and uses its metadata for a new upload', () => {
    const file = new File(['evidence'], 'evidence.txt', { type: 'text/plain' });
    component.selectFile({ target: { files: [file] } } as unknown as Event);

    expect(component.selectedFile).toBe(file);
    expect(component.form.controls.filename.value).toBe('evidence.txt');
    expect(component.form.controls.filetype.value).toBe('text/plain');
  });
});
