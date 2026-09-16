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
});
