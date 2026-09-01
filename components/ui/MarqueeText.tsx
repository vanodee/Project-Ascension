'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './MarqueeText.module.scss';

interface MarqueeTextProps {
  text: string;
  className?: string;
}

// Pixels-per-second the text drifts at once it starts scrolling — kept
// constant so a barely-overflowing line and a wildly-overflowing one both
// feel like the same "speed", just for different durations.
const PIXELS_PER_SECOND = 40;
const MIN_DURATION_S = 4;

/**
 * Spotify-style marquee: renders `text` statically until it no longer fits
 * its box, then drifts it sideways and back on a loop (pause → scroll →
 * pause → reset) so the full string stays readable without growing the row.
 */
export default function MarqueeText({ text, className }: MarqueeTextProps): React.JSX.Element {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState<{ distance: number; duration: number } | null>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const measure = (): void => {
      const distance = inner.scrollWidth - outer.clientWidth;
      if (distance > 1) {
        const duration = Math.max(MIN_DURATION_S, distance / PIXELS_PER_SECOND);
        setOverflow({ distance, duration });
      } else {
        setOverflow(null);
      }
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(outer);
    return () => observer.disconnect();
  }, [text]);

  return (
    <div
      ref={outerRef}
      className={`${styles.marquee} ${overflow ? styles['marquee--overflowing'] : ''} ${className ?? ''}`}
      style={
        overflow
          ? ({
              '--marquee-distance': `-${overflow.distance}px`,
              '--marquee-duration': `${overflow.duration}s`,
            } as React.CSSProperties)
          : undefined
      }
    >
      <span ref={innerRef} className={styles.marquee__track}>
        {text}
      </span>
    </div>
  );
}
