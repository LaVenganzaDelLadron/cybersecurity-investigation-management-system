import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnalystLayout } from './analyst-layout';

describe('AnalystLayout', () => {
  let component: AnalystLayout;
  let fixture: ComponentFixture<AnalystLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalystLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(AnalystLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
