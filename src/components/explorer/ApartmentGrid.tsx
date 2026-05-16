import { motion } from 'framer-motion';
import { Home, Maximize2, Layers, DoorOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ExplorerApartment } from '@/data/explorer';
import { cn } from '@/lib/utils';

const STATUS: Record<string, { label: string; cls: string }> = {
  available: { label: 'Available', cls: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30' },
  reserved: { label: 'Reserved', cls: 'bg-amber-500/15 text-amber-700 border-amber-500/40' },
  sold: { label: 'Sold', cls: 'bg-red-500/15 text-red-700 border-red-500/30' },
};

const TAG_CLS: Record<string, string> = {
  hot: 'bg-red-500 text-white',
  discount: 'bg-emerald-500 text-white',
  new: 'bg-accent text-accent-foreground',
  premium: 'bg-primary text-primary-foreground',
};

const fmt = (n: number) => new Intl.NumberFormat('en-US').format(n);

interface Props {
  apartments: ExplorerApartment[];
  onSelect: (apt: ExplorerApartment) => void;
}

const ApartmentGrid = ({ apartments, onSelect }: Props) => {
  if (!apartments.length) {
    return (
      <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-soft">
        <p className="font-heading text-2xl text-primary mb-2">No matches</p>
        <p className="text-muted-foreground">Adjust your filters to see more apartments.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {apartments.slice(0, 60).map((apt, i) => {
        const s = STATUS[apt.status];
        return (
          <motion.article
            key={apt.id}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -40px 0px' }}
            transition={{ duration: 0.35, delay: Math.min(i * 0.02, 0.3) }}
            className="group bg-card border border-border rounded-2xl shadow-soft overflow-hidden flex flex-col hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
          >
            <div className="relative h-28 gradient-navy flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--gold))_0%,transparent_50%)]" />
              <div className="relative text-center">
                <p className="text-primary-foreground/60 text-[10px] uppercase tracking-[0.2em] font-semibold mb-0.5">
                  Apt
                </p>
                <p className="font-heading text-gradient-gold text-2xl font-bold leading-none">
                  №{apt.number}
                </p>
              </div>
              <Badge
                variant="outline"
                className={cn('absolute top-3 right-3 border font-semibold', s.cls)}
              >
                {s.label}
              </Badge>
              {apt.tag && (
                <span
                  className={cn(
                    'absolute top-3 left-3 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider',
                    TAG_CLS[apt.tag],
                  )}
                >
                  {apt.tag.toUpperCase()}
                </span>
              )}
            </div>

            <div className="p-4 flex-1 flex flex-col">
              <ul className="space-y-2 mb-4 text-sm">
                <Row icon={<Home className="h-4 w-4" />} label="Rooms" value={apt.rooms} />
                <Row icon={<Layers className="h-4 w-4" />} label="Floor" value={apt.floor} />
                <Row icon={<Maximize2 className="h-4 w-4" />} label="Area" value={`${apt.area} m²`} />
                <Row
                  icon={<DoorOpen className="h-4 w-4" />}
                  label="Location"
                  value={`${apt.block}/${apt.building}/${apt.entrance}`}
                />
              </ul>

              <div className="mt-auto">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-0.5">
                  Price
                </p>
                <div className="flex items-baseline gap-2 mb-3">
                  <p className="font-heading text-xl font-bold text-primary">
                    {fmt(apt.price)}{' '}
                    <span className="text-sm font-body font-medium text-muted-foreground">
                      AMD
                    </span>
                  </p>
                  {apt.originalPrice && (
                    <span className="text-xs text-muted-foreground line-through">
                      {fmt(apt.originalPrice)}
                    </span>
                  )}
                </div>

                <Button
                  disabled={apt.status === 'sold'}
                  onClick={() => onSelect(apt)}
                  className="w-full rounded-xl gradient-gold text-accent-foreground hover:shadow-glow-gold"
                >
                  View details
                </Button>
              </div>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
};

const Row = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) => (
  <li className="flex items-center justify-between text-foreground/80">
    <span className="flex items-center gap-2 text-muted-foreground">
      <span className="text-accent-foreground/60">{icon}</span>
      {label}
    </span>
    <span className="font-semibold text-primary">{value}</span>
  </li>
);

export default ApartmentGrid;
