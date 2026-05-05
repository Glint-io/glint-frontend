"use client";
import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { GoArrowUpRight } from "react-icons/go";
import GlintAnimation from "./GlintAnimation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearAuth } from "@/lib/auth";
import { openAuthModal } from "@/components/AuthModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

type CardNavLink = { label: string; href: string; ariaLabel: string };
export type CardNavItem = {
  label: string;
  bgColor?: string;
  textColor?: string;
  links: CardNavLink[];
};

export interface CardNavProps {
  logo?: string;
  logoAlt?: string;
  items: CardNavItem[];
  className?: string;
  ease?: string;
  baseColor?: string;
  menuColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
}

const CardNav: React.FC<CardNavProps> = ({
  items,
  className = "",
  ease = "power3.out",
  menuColor,
  buttonBgColor,
  buttonTextColor,
}) => {
  const router = useRouter();
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const navRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // Prevent hydration issues by only rendering interactive content after mount
  useEffect(() => {
    // When mounted on client, now we can show the UI
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const closeMenu = (onClosed?: () => void) => {
    const tl = tlRef.current;
    if (!isExpanded || !tl) {
      setIsHamburgerOpen(false);
      setIsExpanded(false);
      onClosed?.();
      return;
    }
    setIsHamburgerOpen(false);
    tl.eventCallback("onReverseComplete", () => {
      setIsExpanded(false);
      onClosed?.();
    });
    tl.reverse();
  };

  const handleNavLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (href === "/auth/login" || href === "/auth/register") {
      e.preventDefault();
      const mode = href.endsWith("register") ? "register" : "login";
      closeMenu(() => openAuthModal(mode));
      return;
    }

    if (href !== "/auth/logout") {
      closeMenu(() => router.push(href));
      return;
    }

    e.preventDefault();
    closeMenu(() => setLogoutConfirmOpen(true));
  };

  const handleCtaClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    closeMenu(() => router.push("/analysis"));
  };

  const calculateHeight = () => {
    const navEl = navRef.current;
    if (!navEl) return 260;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile) {
      const contentEl = navEl.querySelector(".card-nav-content") as HTMLElement;
      if (contentEl) {
        const prev = {
          visibility: contentEl.style.visibility,
          pointerEvents: contentEl.style.pointerEvents,
          position: contentEl.style.position,
          height: contentEl.style.height,
        };
        Object.assign(contentEl.style, {
          visibility: "visible",
          pointerEvents: "auto",
          position: "static",
          height: "auto",
        });
        void contentEl.offsetHeight;
        const h = 60 + contentEl.scrollHeight + 16;
        Object.assign(contentEl.style, prev);
        return h;
      }
    }
    return 260;
  };

  const createTimeline = () => {
    const navEl = navRef.current;
    if (!navEl) return null;
    gsap.set(navEl, { height: 60, overflow: "hidden" });
    gsap.set(cardsRef.current, { y: 50, opacity: 0 });
    const tl = gsap.timeline({ paused: true });
    tl.to(navEl, { height: calculateHeight, duration: 0.4, ease });
    tl.to(
      cardsRef.current,
      { y: 0, opacity: 1, duration: 0.4, ease, stagger: 0.08 },
      "-=0.1",
    );
    return tl;
  };

  useLayoutEffect(() => {
    if (!isMounted) return;
    const tl = createTimeline();
    tlRef.current = tl;
    return () => {
      tl?.kill();
      tlRef.current = null;
    };
  }, [ease, items, isMounted]);

  useLayoutEffect(() => {
    if (!isMounted) return;

    const handleResize = () => {
      if (!tlRef.current) return;
      if (isExpanded) {
        gsap.set(navRef.current, { height: calculateHeight() });
        tlRef.current.kill();
        const tl = createTimeline();
        if (tl) {
          tl.progress(1);
          tlRef.current = tl;
        }
      } else {
        tlRef.current.kill();
        const tl = createTimeline();
        if (tl) tlRef.current = tl;
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isExpanded, isMounted]);

  const toggleMenu = () => {
    if (!isMounted) return;
    const tl = tlRef.current;
    if (!tl) return;
    if (!isExpanded) {
      setIsHamburgerOpen(true);
      setIsExpanded(true);
      tl.play(0);
    } else closeMenu();
  };

  const setCardRef = (i: number) => (el: HTMLDivElement | null) => {
    if (el) cardsRef.current[i] = el;
  };

  return (
    <div
      className={`card-nav-container absolute left-1/2 -translate-x-1/2 w-[90%] max-w-[800px] z-[99] top-[.2em] md:top-[.5em] ${className}`}
    >
      <nav
        ref={navRef}
        className={`card-nav ${isExpanded ? "open" : ""}
          bg-background border border-border
          block h-[60px] p-0 rounded-xl
          shadow-[0_4px_24px_-4px_rgba(28,25,23,0.10)]
          relative overflow-hidden will-change-[height]`}
      >
        {/*  Top bar  */}
        <div className="card-nav-top absolute inset-x-0 top-0 h-[60px] flex items-center justify-between py-2 px-4 z-[2]">
          {/* Hamburger */}
          <div
            className={`hamburger-menu ${isHamburgerOpen ? "open" : ""} group h-full flex flex-col items-center justify-center cursor-pointer gap-[6px] order-2 md:order-none`}
            onClick={toggleMenu}
            role="button"
            aria-label={isExpanded ? "Close menu" : "Open menu"}
            tabIndex={0}
            style={{ color: menuColor ?? "var(--foreground)" }}
          >
            <div
              className={`hamburger-line w-[30px] h-[2px] bg-foreground transition-[transform,opacity,margin] duration-300 ease-linear [transform-origin:50%_50%] ${isHamburgerOpen ? "translate-y-[4px] rotate-45" : ""} group-hover:opacity-50`}
            />
            <div
              className={`hamburger-line w-[30px] h-[2px] bg-foreground transition-[transform,opacity,margin] duration-300 ease-linear [transform-origin:50%_50%] ${isHamburgerOpen ? "-translate-y-[4px] -rotate-45" : ""} group-hover:opacity-50`}
            />
          </div>

          {/* Logo */}
          <Link
            href="/"
            className="logo-container absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center"
          >
            <GlintAnimation className="h-7" />
          </Link>

          {/* CTA */}
          <Link
            href="/analysis"
            className="card-nav-cta-button hidden md:inline-flex border-0 rounded-[var(--radius-md)] px-4 items-center h-[calc(100%-10px)] font-medium cursor-pointer transition-opacity duration-200 hover:opacity-85"
            style={{
              backgroundColor: buttonBgColor ?? "var(--primary)",
              color: buttonTextColor ?? "var(--primary-fg)",
            }}
            onClick={handleCtaClick}
          >
            Get Started
          </Link>
        </div>

        {/*  Cards  */}
        <div
          className={`card-nav-content absolute left-0 right-0 top-[60px] bottom-0 p-2 flex flex-col items-stretch gap-2 justify-start z-[1]
            ${isExpanded ? "visible pointer-events-auto" : "invisible pointer-events-none"}
            md:flex-row md:items-end md:gap-[8px]`}
          aria-hidden={!isExpanded}
        >
          {isMounted &&
            (items ?? []).slice(0, 3).map((item, idx) => (
              <div
                key={`${item.label}-${idx}`}
                ref={setCardRef(idx)}
                className="nav-card select-none relative flex flex-col gap-2 p-[12px_16px] rounded-[var(--radius-md)] min-w-0 flex-[1_1_auto] h-auto min-h-[60px] md:h-full md:min-h-0 md:flex-[1_1_0%]"
                style={{
                  backgroundColor: item.bgColor ?? "var(--background-subtle)",
                  color: item.textColor ?? "var(--foreground)",
                }}
              >
                <div className="nav-card-label font-normal tracking-[-0.5px] text-[18px] md:text-[22px]">
                  {item.label}
                </div>
                <div className="nav-card-links mt-auto flex flex-col gap-[2px]">
                  {item.links?.map((lnk, i) => (
                    <Link
                      key={`${lnk.href}-${i}`}
                      href={lnk.href}
                      aria-label={lnk.ariaLabel}
                      className="nav-card-link inline-flex items-center gap-[6px] no-underline cursor-pointer transition-opacity duration-200 hover:opacity-60 text-[15px] md:text-[16px]"
                      onClick={(e) => handleNavLinkClick(e, lnk.href)}
                    >
                      <GoArrowUpRight
                        className="nav-card-link-icon shrink-0"
                        aria-hidden="true"
                      />
                      {lnk.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </nav>

      {logoutConfirmOpen && (
        <ConfirmModal
          title="Sign out"
          ariaLabel="Sign out confirmation"
          message="Are you sure you want to sign out?"
          confirmType="simple"
          confirmButtonLabel="Sign out"
          cancelButtonLabel="Cancel"
          onClose={() => setLogoutConfirmOpen(false)}
          onConfirm={() => {
            clearAuth();
            setLogoutConfirmOpen(false);
            router.push("/auth/login");
          }}
        />
      )}
    </div>
  );
};

export default CardNav;
