import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Sidebar } from './sidebar';

describe('Sidebar', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sidebar],
    }).compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows only administrator navigation to administrators', () => {
    const labels = component.visibleItems('admin').map((item) => item.label);

    expect(labels).toContain('Categories');
    expect(labels).toContain('Users and roles');
    expect(labels).toContain('Audit logs');
    expect(labels).toContain('Investigation notes');
  });

  it('limits analysts to investigation workflows', () => {
    const labels = component.visibleItems('analyst').map((item) => item.label);

    expect(labels).toContain('Investigation notes');
    expect(labels).toContain('Attachments');
    expect(labels).not.toContain('Categories');
    expect(labels).not.toContain('Users and roles');
    expect(labels).not.toContain('Audit logs');
  });

  it('limits users to self-service navigation', () => {
    const labels = component.visibleItems('user').map((item) => item.label);

    expect(labels).toContain('Report incident');
    expect(labels).toContain('AI assistant');
    expect(labels).not.toContain('Investigation notes');
    expect(labels).not.toContain('Categories');
    expect(labels).not.toContain('Users and roles');
  });
});
