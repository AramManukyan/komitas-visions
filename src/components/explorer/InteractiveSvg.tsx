import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
  type PointerEvent as RPointerEvent,
  type ReactNode,
  type WheelEvent as RWheelEvent,
} from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Transform {
  scale: number;
  x: number;
  y: number;
}

const IDENTITY: Transform = { scale: 1, x: 0, y: 0 };
const MIN_SCALE = 1;
const MAX_SCALE = 6;

export interface InteractiveSvgHandle {
  /** Smoothly zoom so the given bbox (in viewBox units) fills the viewport. */
  zoomToBox: (cx: number, cy: number, w: number, h: number, padding?: number) => void;
  reset: () => void;
}

interface Props {
  viewBox: string; // "minX minY width height"
  className?: string;
  /** Background — rendered inside the <svg> before children. Either inline svg
   * snippet (as string) or an <image href={...}> via backgroundSrc. */
  backgroundMarkup?: string;
  backgroundSrc?: string;
  children: ReactNode;
}

/**
 * Generic pan + pinch + wheel zoom SVG container. Works with mouse, touch and
 * trackpad. No external dependencies.
 */
const InteractiveSvg = forwardRef<InteractiveSvgHandle, Props>(
  ({ viewBox, className, backgroundMarkup, backgroundSrc, children }, ref) => {
    const [, , vbW, vbH] = viewBox.split(' ').map(Number);
    const containerRef = useRef<HTMLDivElement>(null);
    const [t, setT] = useState<Transform>(IDENTITY);
    const targetRef = useRef<Transform>(IDENTITY);
    const rafRef = useRef<number | null>(null);

    /* ---- animation tween ---- */
    const animate = useCallback(() => {
      setT((cur) => {
        const dest = targetRef.current;
        const next = {
          scale: cur.scale + (dest.scale - cur.scale) * 0.18,
          x: cur.x + (dest.x - cur.x) * 0.18,
          y: cur.y + (dest.y - cur.y) * 0.18,
        };
        const done =
          Math.abs(next.scale - dest.scale) < 0.001 &&
          Math.abs(next.x - dest.x) < 0.2 &&
          Math.abs(next.y - dest.y) < 0.2;
        if (done) {
          rafRef.current = null;
          return dest;
        }
        rafRef.current = requestAnimationFrame(animate);
        return next;
      });
    }, []);

    const setTarget = useCallback(
      (next: Transform) => {
        const clamped = {
          scale: Math.min(MAX_SCALE, Math.max(MIN_SCALE, next.scale)),
          x: next.x,
          y: next.y,
        };
        targetRef.current = clamped;
        if (rafRef.current == null) {
          rafRef.current = requestAnimationFrame(animate);
        }
      },
      [animate],
    );

    useEffect(() => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    }, []);

    /* ---- imperative API ---- */
    useImperativeHandle(ref, () => ({
      zoomToBox: (cx, cy, w, h, padding = 1.4) => {
        const scale = Math.min(
          MAX_SCALE,
          Math.max(1.1, Math.min(vbW / (w * padding), vbH / (h * padding))),
        );
        // origin of the SVG transform is (0,0). We translate so (cx, cy) becomes
        // the centre of the viewBox: x = vbW/2 - cx*scale.
        setTarget({
          scale,
          x: vbW / 2 - cx * scale,
          y: vbH / 2 - cy * scale,
        });
      },
      reset: () => setTarget(IDENTITY),
    }));

    /* ---- wheel zoom ---- */
    const onWheel = (e: RWheelEvent<HTMLDivElement>) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.0015;
      const nextScale = Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, t.scale * (1 + delta)),
      );
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const px = ((e.clientX - rect.left) / rect.width) * vbW;
      const py = ((e.clientY - rect.top) / rect.height) * vbH;
      // keep the pointed-at SVG point stationary
      const k = nextScale / t.scale;
      targetRef.current = {
        scale: nextScale,
        x: px - (px - t.x) * k,
        y: py - (py - t.y) * k,
      };
      setT(targetRef.current);
    };

    /* ---- pointer pan + pinch ---- */
    const pointers = useRef(new Map<number, { x: number; y: number }>());
    const panStart = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
    const pinchStart = useRef<{ dist: number; scale: number; cx: number; cy: number } | null>(null);

    const onPointerDown = (e: RPointerEvent<HTMLDivElement>) => {
      (e.target as Element).setPointerCapture?.(e.pointerId);
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.current.size === 1) {
        panStart.current = { x: e.clientX, y: e.clientY, tx: t.x, ty: t.y };
      } else if (pointers.current.size === 2) {
        const [a, b] = Array.from(pointers.current.values());
        pinchStart.current = {
          dist: Math.hypot(a.x - b.x, a.y - b.y),
          scale: t.scale,
          cx: (a.x + b.x) / 2,
          cy: (a.y + b.y) / 2,
        };
        panStart.current = null;
      }
    };

    const onPointerMove = (e: RPointerEvent<HTMLDivElement>) => {
      if (!pointers.current.has(e.pointerId)) return;
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      if (pointers.current.size === 2 && pinchStart.current) {
        const [a, b] = Array.from(pointers.current.values());
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        const nextScale = Math.min(
          MAX_SCALE,
          Math.max(MIN_SCALE, pinchStart.current.scale * (d / pinchStart.current.dist)),
        );
        const k = nextScale / t.scale;
        const px = ((pinchStart.current.cx - rect.left) / rect.width) * vbW;
        const py = ((pinchStart.current.cy - rect.top) / rect.height) * vbH;
        const next = {
          scale: nextScale,
          x: px - (px - t.x) * k,
          y: py - (py - t.y) * k,
        };
        targetRef.current = next;
        setT(next);
      } else if (pointers.current.size === 1 && panStart.current) {
        const dx = ((e.clientX - panStart.current.x) / rect.width) * vbW;
        const dy = ((e.clientY - panStart.current.y) / rect.height) * vbH;
        const next = { scale: t.scale, x: panStart.current.tx + dx, y: panStart.current.ty + dy };
        targetRef.current = next;
        setT(next);
      }
    };

    const endPointer = (e: RPointerEvent<HTMLDivElement>) => {
      pointers.current.delete(e.pointerId);
      if (pointers.current.size < 2) pinchStart.current = null;
      if (pointers.current.size === 0) panStart.current = null;
    };

    /* ---- controls ---- */
    const step = (factor: number) =>
      setTarget({
        scale: t.scale * factor,
        x: vbW / 2 - ((vbW / 2 - t.x) / t.scale) * (t.scale * factor),
        y: vbH / 2 - ((vbH / 2 - t.y) / t.scale) * (t.scale * factor),
      });

    return (
      <div
        ref={containerRef}
        className={cn('relative w-full select-none touch-none', className)}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onPointerLeave={endPointer}
      >
        <svg
          viewBox={viewBox}
          className="w-full h-auto block"
          preserveAspectRatio="xMidYMid meet"
        >
          <g transform={`translate(${t.x} ${t.y}) scale(${t.scale})`}>
            {backgroundSrc && (
              <image
                href={backgroundSrc}
                x={0}
                y={0}
                width={vbW}
                height={vbH}
                preserveAspectRatio="xMidYMid slice"
              />
            )}
            {backgroundMarkup && (
              <g dangerouslySetInnerHTML={{ __html: backgroundMarkup }} />
            )}
            {children}
          </g>
        </svg>

        {/* zoom controls */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 rounded-xl bg-background/80 backdrop-blur border border-border shadow-soft p-1">
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => step(1.4)}
            className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted text-primary"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => step(1 / 1.4)}
            className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted text-primary"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Reset view"
            onClick={() => setTarget(IDENTITY)}
            className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted text-primary"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  },
);

InteractiveSvg.displayName = 'InteractiveSvg';

export default InteractiveSvg;
