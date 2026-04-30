"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export default function ScrollHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const diff = currentY - lastScrollY.current;
        if (Math.abs(diff) > 8) {
          setVisible(diff < 0 || currentY < 60);
          lastScrollY.current = currentY;
        }
        ticking.current = false;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="sticky top-0 z-50">
      <header
        className={cn(
          "relative h-12.5 md:h-19",
          "transition-transform duration-300 ease-in-out",
          visible ? "translate-y-0" : "-translate-y-full",
          className
        )}
      >
        {children}
      </header>
    </div>
  );
}