import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ChatbotConfig, ChatMessage, ChatApiRequest } from '../../../models/ai/chatbot.model';
import { AiChatService } from '../../../services/ai/ai-chat.service';

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-chat.component.html',
  styleUrl: './ai-chat.component.css',
})
export class AiChatComponent implements OnInit, OnDestroy, AfterViewChecked {

  @Input() config!: ChatbotConfig;
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  isOpen           = false;
  isTyping         = false;
  inputMessage     = '';
  messages: ChatMessage[] = [];
  quickActionsVisible = true;

  /** Id del mensaje que se está leyendo en voz alta */
  speakingMsgId: string | null = null;

  /** true mientras el micrófono está escuchando */
  isListening = false;

  private destroy$            = new Subject<void>();
  private shouldScrollToBottom = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private recognition: any = null;

  private chatService = inject(AiChatService);
  private cdr         = inject(ChangeDetectorRef);

  // ─────────────────────────────────────────────
  //  Lifecycle
  // ─────────────────────────────────────────────

  ngOnInit(): void {
    this.messages.push({
      id: this.generateId(),
      role: 'ai',
      text: this.config.welcomeMessage
        ?? `¡Hola! Soy el asistente del SGTE. ¿En qué te ayudo con tus trámites?`,
      timestamp: new Date(),
    });
  }

  ngOnDestroy(): void {
    this.stopSpeech();
    this.stopListening();
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  // ─────────────────────────────────────────────
  //  Acciones de chat
  // ─────────────────────────────────────────────

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) this.shouldScrollToBottom = true;
  }

  sendMessage(): void {
    const text = this.inputMessage.trim();
    if (!text || this.isTyping) return;
    this.submit(text);
  }

  useQuickAction(prompt: string): void {
    this.quickActionsVisible = false;
    this.submit(prompt);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
  }

  // ─────────────────────────────────────────────
  //  Text to Speech (TTS)
  // ─────────────────────────────────────────────

  speak(msg: ChatMessage): void {
    if (!window.speechSynthesis) return;

    if (this.speakingMsgId === msg.id) {
      this.stopSpeech();
      return;
    }
    this.stopSpeech();

    const utterance = new SpeechSynthesisUtterance(this.stripMarkdown(msg.text));
    utterance.lang  = 'es-EC';
    utterance.rate  = 0.95;
    utterance.pitch = 1.1;

    const fire = () => {
      utterance.voice   = this.pickSpanishVoice();
      utterance.onend   = () => { this.speakingMsgId = null; this.cdr.detectChanges(); };
      utterance.onerror = () => { this.speakingMsgId = null; this.cdr.detectChanges(); };
      this.speakingMsgId = msg.id;
      window.speechSynthesis.speak(utterance);
      this.cdr.detectChanges();
    };

    if (window.speechSynthesis.getVoices().length > 0) {
      fire();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        fire();
      };
    }
  }

  stopSpeech(): void {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    this.speakingMsgId = null;
  }

  private pickSpanishVoice(): SpeechSynthesisVoice {
    const voices = window.speechSynthesis.getVoices();
    const es     = voices.filter(v => v.lang.startsWith('es'));
    const priority = [
      (v: SpeechSynthesisVoice) => v.name === 'Google español de Estados Unidos',
      (v: SpeechSynthesisVoice) => v.name === 'Google español',
      (v: SpeechSynthesisVoice) => /google/i.test(v.name) && v.lang.startsWith('es'),
      (v: SpeechSynthesisVoice) => v.lang.startsWith('es'),
    ];
    for (const test of priority) {
      const found = es.find(test);
      if (found) return found;
    }
    return voices[0];
  }

  // ─────────────────────────────────────────────
  //  Speech to Text (STT)
  // ─────────────────────────────────────────────

  toggleListening(): void {
    if (this.isListening) this.stopListening();
    else this.startListening();
  }

  get hasSpeechRecognition(): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    return !!(w['SpeechRecognition'] || w['webkitSpeechRecognition']);
  }

  private startListening(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    this.recognition = new SR();
    this.recognition.lang           = 'es-EC';
    this.recognition.continuous     = false;
    this.recognition.interimResults = false;

    this.recognition.onstart = () => { this.isListening = true; this.cdr.detectChanges(); };

    this.recognition.onresult = (event: any) => {
      const transcript: string = event.results[0][0].transcript;
      this.isListening  = false;
      this.inputMessage = transcript;
      this.cdr.detectChanges();
      setTimeout(() => this.sendMessage(), 100);
    };

    this.recognition.onerror = () => { this.isListening = false; this.cdr.detectChanges(); };
    this.recognition.onend   = () => { this.isListening = false; this.cdr.detectChanges(); };
    this.recognition.start();
  }

  private stopListening(): void {
    this.recognition?.stop();
    this.isListening = false;
  }

  // ─────────────────────────────────────────────
  //  Submit / request handlers
  // ─────────────────────────────────────────────

  private submit(text: string): void {
    this.stopSpeech();
    this.stopListening();
    this.inputMessage        = '';
    this.quickActionsVisible = false;
    this.messages.push({ id: this.generateId(), role: 'user', text, timestamp: new Date() });
    this.shouldScrollToBottom = true;
    this.isTyping = true;

    const request: ChatApiRequest = {
      module: this.config.module,
      message: text,
      ...(this.config.userId    && { userId:    this.config.userId }),
      ...(this.config.idCarrera && { idCarrera: this.config.idCarrera }),
      ...(this.config.idFacultad && { idFacultad: this.config.idFacultad }),
    };
    this.chatService.sendMessage(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.isTyping = false;
          this.messages.push({
            id: this.generateId(),
            role: 'ai',
            text: res.success ? res.response : (res.error ?? 'No pude procesar tu consulta.'),
            timestamp: new Date(),
          });
          this.quickActionsVisible  = true;
          this.shouldScrollToBottom = true;
          this.cdr.detectChanges();
        },
        error: () => {
          this.isTyping = false;
          this.messages.push({
            id: this.generateId(),
            role: 'ai',
            text: 'Ocurrió un error al conectar con el asistente. Intenta nuevamente.',
            timestamp: new Date(),
          });
          this.quickActionsVisible  = true;
          this.shouldScrollToBottom = true;
          this.cdr.detectChanges();
        },
      });
  }

  // ─────────────────────────────────────────────
  //  Helpers
  // ─────────────────────────────────────────────

  private scrollToBottom(): void {
    try {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch { /* noop */ }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  private stripMarkdown(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      .replace(/`{1,3}[^`]*`{1,3}/g, '')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/^[-*+]\s+/gm, '')
      .replace(/^\d+\.\s+/gm, '');
  }
}