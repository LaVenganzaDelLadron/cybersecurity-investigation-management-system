import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ChatAi } from './chat-ai';

describe('ChatAi', () => {
  let component: ChatAi;
  let fixture: ComponentFixture<ChatAi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatAi],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatAi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders assistant Markdown as structured HTML', () => {
    const html = component.renderAssistantMessage(
      '## Findings\n\n| Risk | Status |\n| --- | --- |\n| **High** | Open |\n\n```ts\nconst safe = true;\n```',
    );

    expect(html).toContain('<h2>Findings</h2>');
    expect(html).toContain('<table>');
    expect(html).toContain('<strong>High</strong>');
    expect(html).toContain('<pre>');
    expect(html).toContain('const safe = true;');
  });

  it('returns a safe empty state for missing assistant responses', () => {
    expect(component.renderAssistantMessage(undefined)).toContain('No response yet.');
  });

  it('sanitizes executable markup from assistant responses', () => {
    const html = component.renderAssistantMessage('<img src=x onerror="alert(1)">');

    expect(html).not.toContain('onerror');
    expect(html).not.toContain('<script');
  });
});
