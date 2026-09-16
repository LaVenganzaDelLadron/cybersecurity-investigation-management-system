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
});
