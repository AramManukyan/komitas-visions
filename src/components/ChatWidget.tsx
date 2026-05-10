import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
};

const WELCOME: Message = {
  id: 'welcome',
  text: 'Hello! How can we help you?',
  sender: 'bot',
};

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { id: `${Date.now()}-u`, text, sender: 'user' };
    setMessages((m) => [...m, userMsg]);
    setInput('');

    // TODO: Connect to a real API here.
    // Example:
    // const res = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ message: text }) });
    // const data = await res.json();
    // setMessages((m) => [...m, { id: `${Date.now()}-b`, text: data.reply, sender: 'bot' }]);

    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: `${Date.now()}-b`,
          text: 'Thanks for your message! We will get back to you shortly.',
          sender: 'bot',
        },
      ]);
    }, 600);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div
          role="dialog"
          aria-label="Chat with us"
          className={cn(
            'glass-dark animate-fade-up flex flex-col overflow-hidden rounded-2xl shadow-elevated border border-white/10',
            'w-[calc(100vw-2rem)] sm:w-[380px] h-[70vh] sm:h-[520px] max-h-[calc(100vh-7rem)]'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-navy text-primary-foreground border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full gradient-gold">
                <MessageCircle className="h-4 w-4 text-navy" />
              </span>
              <div>
                <h3 className="font-heading text-lg leading-none">Chat with us</h3>
                <p className="text-xs text-primary-foreground/70 mt-1">We typically reply quickly</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="rounded-full p-1.5 text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-warm-bg">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn('flex', m.sender === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-soft',
                    m.sender === 'user'
                      ? 'bg-navy text-primary-foreground rounded-br-sm'
                      : 'bg-card text-card-foreground border border-border rounded-bl-sm'
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border bg-background p-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              autoComplete="off"
            />
            <Button type="submit" size="icon" disabled={!input.trim()} aria-label="Send message">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close chat' : 'Open chat'}
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
