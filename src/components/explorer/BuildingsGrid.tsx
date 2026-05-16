import { motion } from 'framer-motion';
import { Building2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BUILDINGS, EXPLORER_APARTMENTS, type BuildingInfo } from '@/data/explorer';

interface Props {
  selectedId?: string | null;
  onSelect: (b: BuildingInfo) => void;
}

const STATUS_MAP: Record<BuildingInfo['status'], { label: string; cls: string }> = {
  ready: { label: 'Ready', cls: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30' },
  construction: {
    label: 'Construction',
    cls: 'bg-amber-500/15 text-amber-700 border-amber-500/40',
  },
  planning: { label: 'Planning', cls: 'bg-slate-500/15 text-slate-700 border-slate-500/30' },
};

const BuildingsGrid = ({ selectedId, onSelect }: Props) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {BUILDINGS.map((b, i) => {
      const avail = EXPLORER_APARTMENTS.filter(
        (a) => `${a.block}-${a.building}` === b.id && a.status === 'available',
      ).length;
      const s = STATUS_MAP[b.status];
      const isActive = selectedId === b.id;
      return (
        <motion.button
          key={b.id}
          type="button"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.04 }}
          onClick={() => onSelect(b)}
          className={`group text-left bg-card border rounded-2xl overflow-hidden shadow-soft transition-all hover:-translate-y-1 hover:shadow-card-hover ${
            isActive ? 'border-accent ring-2 ring-accent/40' : 'border-border'
          }`}
        >
          <div className="relative h-28 gradient-navy flex items-center justify-center">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_30%,hsl(var(--gold))_0%,transparent_55%)]" />
            <Building2 className="h-10 w-10 text-accent/70 relative" />
            <Badge
              variant="outline"
              className={`absolute top-3 right-3 border font-semibold ${s.cls}`}
            >
              {s.label}
            </Badge>
          </div>
          <div className="p-4">
            <div className="flex items-baseline justify-between mb-1">
              <p className="font-heading text-xl text-primary font-semibold">{b.name}</p>
              <span className="text-xs text-muted-foreground">{b.floors} floors</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {b.entrances.length} entrances · {avail} available
            </p>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
              <div
                className="h-full gradient-gold"
                style={{ width: `${b.progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {b.progress}% complete
              </span>
              <span className="text-xs font-semibold text-primary inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Explore <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </motion.button>
      );
    })}
  </div>
);

export default BuildingsGrid;
