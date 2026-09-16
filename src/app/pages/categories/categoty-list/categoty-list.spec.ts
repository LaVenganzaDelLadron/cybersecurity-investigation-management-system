import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { CategotyList } from './categoty-list';

describe('CategotyList', () => {
  let component: CategotyList;
  let fixture: ComponentFixture<CategotyList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategotyList],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(CategotyList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
