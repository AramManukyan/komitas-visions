import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { chatStore, useChatStore } from '@/hooks/useChatAttachments';
import type { ExplorerApartment } from '@/data/explorer';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  apartments?: ExplorerApartment[];
};

type LeadInfo = {
  name: string;
  phone: string;
  message: string;
};

const ChatWidget = () => {
  const { t } = useTranslation();
  const { open, attachments } = useChatStore();
  const setOpen = (o: boolean) => chatStore.setOpen(o);
  const [lead, setLead] = useState<LeadInfo | null>(null);
  const [form, setForm] = useState<LeadInfo>({ name: '', phone: '', message: '' });
  const [errors, setErrors] = useState<Partial<LeadInfo>>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open, isTyping]);

  const simulateBotReply = (userText: string) => {
    setIsTyping(true);
    // TODO: Replace with real API call
    // const res = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ message: userText, lead }) });
    // const data = await res.json();
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: `${Date.now()}-b`,
          text: t('chat.botReply'),
          sender: 'bot',
        },
      ]);
      setIsTyping(false);
    }, 1200);
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Partial<LeadInfo> = {};
    if (!form.name.trim()) newErrors.name = t('common.required');
    if (!form.phone.trim()) newErrors.phone = t('common.required');
    if (!form.message.trim()) newErrors.message = t('common.required');
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    setLead(form);
    const initial: Message[] = [
      {
        id: 'welcome',
        text: t('chat.welcome', { name: form.name }),
        sender: 'bot',
      },
      { id: 'user-initial', text: form.message, sender: 'user' },
    ];
    setMessages(initial);
    simulateBotReply(form.message);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text && attachments.length === 0) return;
    const apts = attachments;
    const summary = apts.length
      ? apts.map((a) => `№${a.number} (${a.rooms} BR · ${a.area} m² · $${a.price.toLocaleString()})`).join(', ')
      : '';
    const fullText = text || (apts.length ? `I'm interested in: ${summary}` : '');
    setMessages((m) => [
      ...m,
      { id: `${Date.now()}-u`, text: fullText, sender: 'user', apartments: apts },
    ]);
    setInput('');
    chatStore.clearAttachments();
    simulateBotReply(fullText);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div
          role="dialog"
          aria-label={t('chat.aria.dialog')}
          className={cn(
            'glass-dark animate-fade-up flex flex-col overflow-hidden rounded-2xl shadow-elevated border border-white/10',
            'w-[calc(100vw-2rem)] sm:w-[380px] h-[70vh] sm:h-[560px] max-h-[calc(100vh-7rem)]'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-navy text-primary-foreground border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full gradient-gold">
                <MessageCircle className="h-4 w-4 text-navy" />
              </span>
              <div>
                <h3 className="font-heading text-lg leading-none">{t('chat.title')}</h3>
                <p className="text-xs text-primary-foreground/70 mt-1">
                  {lead ? t('chat.support') : t('chat.intro')}
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label={t('chat.aria.close')}
              className="rounded-full p-1.5 text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {!lead ? (
            /* Pre-chat form */
            <form onSubmit={handleStart} className="flex-1 overflow-y-auto bg-warm-bg p-4 space-y-4">
              <p className="text-sm text-foreground/80">
                {t('chat.preFormHint')}
              </p>
              <div className="space-y-2">
                <Label htmlFor="cw-name">{t('contact.name')}</Label>
                <Input
                  id="cw-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={t('chat.placeholders.name')}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cw-phone">{t('contact.phone')}</Label>
                <Input
                  id="cw-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder={t('chat.placeholders.phone')}
                />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cw-message">{t('contact.message')}</Label>
                <Textarea
                  id="cw-message"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder={t('chat.placeholders.message')}
                  rows={3}
                />
                {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
              </div>
              <Button type="submit" className="w-full">{t('chat.start')}</Button>
            </form>
          ) : (
            <>
              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-warm-bg">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn('flex', m.sender === 'user' ? 'justify-end' : 'justify-start')}
                  >
                    <div
                      className={cn(
                        'max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-soft space-y-2',
                        m.sender === 'user'
                          ? 'bg-navy text-primary-foreground rounded-br-sm'
                          : 'bg-card text-card-foreground border border-border rounded-bl-sm'
                      )}
                    >
                      {m.text && <div className="whitespace-pre-wrap">{m.text}</div>}
                      {m.apartments && m.apartments.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          {m.apartments.map((a) => (
                            <div
                              key={a.id}
                              className={cn(
                                'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs',
                                m.sender === 'user'
                                  ? 'bg-white/10 border border-white/15'
                                  : 'bg-muted/60 border border-border'
                              )}
                            >
                              <Home className="h-3.5 w-3.5 shrink-0 opacity-70" />
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold truncate">
                                  Apt №{a.number} · {a.rooms} BR
                                </div>
                                <div className="opacity-70 truncate">
                                  {a.area} m² · floor {a.floor} · ${a.price.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-card text-card-foreground border border-border rounded-2xl rounded-bl-sm px-4 py-2 shadow-soft flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{t('chat.typing')}</span>
                      <span className="flex gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-gold animate-bounce [animation-delay:-0.3s]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-gold animate-bounce [animation-delay:-0.15s]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-gold animate-bounce" />
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Attachment chips */}
              {attachments.length > 0 && (
                <div className="border-t border-border bg-muted/40 px-3 py-2 flex flex-wrap gap-1.5">
                  {attachments.map((a) => (
                    <span
                      key={a.id}
                      className="inline-flex items-center gap-1.5 rounded-full bg-background border border-border pl-2 pr-1 py-0.5 text-[11px] font-medium text-foreground"
                    >
                      <Home className="h-3 w-3 text-accent-foreground/70" />
                      №{a.number} · {a.rooms}BR · {a.area}m²
                      <button
                        type="button"
                        onClick={() => chatStore.removeApartment(a.id)}
                        className="h-4 w-4 rounded-full grid place-items-center text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label="Remove attachment"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Input */}
              <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border bg-background p-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    attachments.length > 0
                      ? `Add a note for ${attachments.length} apartment${attachments.length > 1 ? 's' : ''}...`
                      : t('chat.placeholders.input')
                  }
                  className="flex-1"
                  autoComplete="off"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={(!input.trim() && attachments.length === 0) || isTyping}
                  aria-label={t('chat.aria.send')}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? t('chat.aria.close') : t('chat.aria.open')}
        className={cn(
          'group relative flex h-14 w-14 items-center justify-center rounded-full gradient-gold text-navy',
          'shadow-glow-gold transition-transform hover:scale-105 active:scale-95'
        )}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
};

export default ChatWidget;
