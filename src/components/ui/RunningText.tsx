import React, { useEffect, useRef, useState } from 'react';

interface RunningTextProps {
  text: string;
  className?: string;
}

/**
 * Single-line text that auto-scrolls horizontally only when it overflows its container.
 * Keeps table rows and cards at one-line density instead of wrapping.
 */
export const RunningText: React.FC<RunningTextProps> = ({ text, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  const [overflowDistance, setOverflowDistance] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const checkOverflow = () => {
      const distance = content.scrollWidth - container.clientWidth;
      setOverflowDistance(distance > 2 ? distance + 16 : 0);
    };

    checkOverflow();

    // Observe the container too: cell widths change without a window resize.
    const observer = new ResizeObserver(checkOverflow);
    observer.observe(container);
    observer.observe(content);
    return () => observer.disconnect();
  }, [text]);

  const isOverflowing = overflowDistance > 0;
  const duration = Math.max(4, Math.min(14, overflowDistance / 14));

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden whitespace-nowrap min-w-0 max-w-full ${className}`}
      title={text}
    >
      <span
        ref={contentRef}
        style={
          isOverflowing
            ? ({
                '--scroll-offset': `-${overflowDistance}px`,
                animation: `running-ticker ${duration}s ease-in-out infinite alternate`,
              } as React.CSSProperties)
            : undefined
        }
        className={`inline-block whitespace-nowrap ${
          isOverflowing ? 'will-change-transform hover:[animation-play-state:paused]' : ''
        }`}
      >
        {text}
      </span>
    </div>
  );
};
