import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  viewportClassName?: string;
  topOffset?: string;
  bottomOffset?: string;
  trackWidth?: string;
  thumbClassName?: string;
  preventLenis?: boolean;
  autoHide?: boolean;
}

export interface ScrollAreaRef {
  viewport: HTMLDivElement | null;
  scrollTo: (options: ScrollToOptions) => void;
  scrollTop: number;
}

export const ScrollArea = forwardRef<ScrollAreaRef, ScrollAreaProps>(({
  children,
  className = '',
  viewportClassName = '',
  topOffset = 'top-4',
  bottomOffset = 'bottom-4',
  trackWidth = 'w-1.5',
  thumbClassName = 'bg-slate-300 hover:bg-slate-400 active:bg-slate-500',
  preventLenis = true,
  autoHide = true,
  ...props
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [thumbHeight, setThumbHeight] = useState(0);
  const [thumbTop, setThumbTop] = useState(0);
  const [isScrollable, setIsScrollable] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const scrollTimeoutRef = useRef<number | null>(null);
  const dragStartYRef = useRef(0);
  const dragStartScrollTopRef = useRef(0);

  // Expose viewport and scroll helpers via ref
  useImperativeHandle(ref, () => ({
    viewport: viewportRef.current,
    scrollTo: (options: ScrollToOptions) => {
      viewportRef.current?.scrollTo(options);
    },
    get scrollTop() {
      return viewportRef.current?.scrollTop || 0;
    },
    set scrollTop(val: number) {
      if (viewportRef.current) {
        viewportRef.current.scrollTop = val;
      }
    }
  }));

  const updateThumb = useCallback(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const { scrollTop, scrollHeight, clientHeight } = viewport;
    const trackHeight = track.clientHeight;

    if (scrollHeight <= clientHeight || clientHeight === 0 || trackHeight === 0) {
      setIsScrollable(false);
      return;
    }

    setIsScrollable(true);
    const minHeight = 24;
    const calculatedHeight = Math.max(minHeight, (clientHeight / scrollHeight) * trackHeight);
    setThumbHeight(calculatedHeight);

    const maxScroll = scrollHeight - clientHeight;
    const maxTravel = trackHeight - calculatedHeight;
    const currentTop = maxScroll > 0 ? (scrollTop / maxScroll) * maxTravel : 0;
    setThumbTop(Math.max(0, Math.min(maxTravel, currentTop)));
  }, []);

  // Handle scrolling of viewport
  const handleScroll = useCallback(() => {
    updateThumb();

    if (autoHide) {
      setIsScrolling(true);
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = window.setTimeout(() => {
        setIsScrolling(false);
      }, 1000);
    }
  }, [updateThumb, autoHide]);

  // Thumb dragging logic
  const handleThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    dragStartYRef.current = e.clientY;
    dragStartScrollTopRef.current = viewportRef.current?.scrollTop || 0;
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const viewport = viewportRef.current;
      const track = trackRef.current;
      if (!viewport || !track) return;

      const { scrollHeight, clientHeight } = viewport;
      const trackHeight = track.clientHeight;
      const maxScroll = scrollHeight - clientHeight;
      const maxTravel = trackHeight - thumbHeight;

      if (maxTravel <= 0 || maxScroll <= 0) return;

      const deltaY = e.clientY - dragStartYRef.current;
      const scrollDelta = (deltaY / maxTravel) * maxScroll;
      viewport.scrollTop = dragStartScrollTopRef.current + scrollDelta;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, thumbHeight]);

  // Handle clicking on track
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== trackRef.current) return;
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) return;

    const rect = track.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const trackHeight = track.clientHeight;
    const { scrollHeight, clientHeight } = viewport;
    const maxScroll = scrollHeight - clientHeight;

    const targetScroll = (clickY / trackHeight) * maxScroll;
    viewport.scrollTo({ top: targetScroll, behavior: 'smooth' });
  };

  // ResizeObserver for dynamic content / window changes
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    updateThumb();

    const resizeObserver = new ResizeObserver(() => {
      updateThumb();
    });

    resizeObserver.observe(viewport);
    if (viewport.firstElementChild) {
      resizeObserver.observe(viewport.firstElementChild);
    }

    window.addEventListener('resize', updateThumb);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateThumb);
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [updateThumb]);

  const isThumbVisible = isScrollable && (!autoHide || isHovered || isScrolling || isDragging);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative flex flex-col min-h-0 min-w-0 ${className}`}
      {...props}
    >
      {/* Scrollable Viewport (Native scrollbar hidden to avoid layout shift) */}
      <div
        ref={viewportRef}
        onScroll={handleScroll}
        {...(preventLenis ? { 'data-lenis-prevent': true } : {})}
        className={`flex-1 overflow-y-auto overflow-x-hidden no-scrollbar ${viewportClassName}`}
      >
        {children}
      </div>

      {/* Overlay Scrollbar Track */}
      {isScrollable && (
        <div
          ref={trackRef}
          onClick={handleTrackClick}
          className={`absolute ${topOffset} ${bottomOffset} right-1 ${trackWidth} z-20 bg-transparent transition-opacity duration-200 pointer-events-auto select-none ${
            isThumbVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div
            onMouseDown={handleThumbMouseDown}
            style={{
              height: `${thumbHeight}px`,
              transform: `translateY(${thumbTop}px)`,
            }}
            className={`w-full rounded-full transition-colors cursor-pointer select-none ${thumbClassName}`}
          />
        </div>
      )}
    </div>
  );
});

ScrollArea.displayName = 'ScrollArea';
