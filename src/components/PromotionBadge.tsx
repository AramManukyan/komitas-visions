import { Flame, Sparkles, Tag, Landmark, CalendarClock, Clock, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PromotionType } from '@/types/promotion';

interface PromotionBadgeProps {
  type: PromotionType;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const STYLES: Record<PromotionType, { cls: string; Icon: typeof Tag; key: string }> = {
  discount:    { cls: 'bg-gold text-navy',                        Icon: Tag,           key: 'discount' },
  hot:         { cls: 'bg-destructive text-destructive-foreground', Icon: Flame,       key: 'hot' },
  new:         { cls: 'bg-navy text-gold',                        Icon: Sparkles,      key: 'new' },
  mortgage:    { cls: 'bg-navy-light text-gold-light',            Icon: Landmark,      key: 'mortgage' },
  installment: { cls: 'bg-gold-light text-navy',                  Icon: CalendarClock, key: 'installment' },
  limited:     { cls: 'bg-navy text-gold-light',                  Icon: Clock,         key: 'limited' },
  custom:      { cls: 'bg-accent text-accent-foreground',         Icon: Star,          key: 'custom' },
};

const SIZES = {
  sm: 'text-[10px] px-2 py-0.5 gap-1 [&_svg]:size-3',
  md: 'text-xs px-2.5 py-1 gap-1.5 [&_svg]:size-3.5',
  lg: 'text-sm px-3 py-1.5 gap-2 [&_svg]:size-4',
};

export const PromotionBadge = ({
  type,
  label,
  size = 'md',
  className,
}: PromotionBadgeProps) => {
  const { cls, Icon } = STYLES[type];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold uppercase tracking-wide shadow-soft',
        cls,
        SIZES[size],
        className,
      )}
    >
      <Icon />
      {label ?? type}
    </span>
  );
};

export default PromotionBadge;
