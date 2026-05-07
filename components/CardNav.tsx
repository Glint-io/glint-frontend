"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { GoArrowUpRight } from "react-icons/go";
import GlintAnimation from "./GlintAnimation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearAuth } from "@/lib/auth";
import { openAuthModal } from "@/components/AuthModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { ThemeToggle } from "@/components/ThemeToggle";

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
  secondaryAction?: {
    href: string;
    ariaLabel: string;
    Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  };
}

const CardNav: React.FC<CardNavProps> = ({
  items,
  className = "",
  ease = "power3.out",
  menuColor,
  buttonBgColor,
  buttonTextColor,
  secondaryAction,
}) => {
  const router = useRouter();

  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const navRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const bodyOverflowRef = useRef<string | null>(null);

  useEffect(() => {
    let raf = 0;
    raf = window.requestAnimationFrame(() => setIsMounted(true));

    return () => void window.cancelAnimationFrame(raf);
  }, []);

  const closeMenu = useCallback(
    (onClosed?: () => void) => {
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
    },
    [isExpanded],
  );

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    if (isExpanded && isMobile) {
      if (bodyOverflowRef.current === null) {
        bodyOverflowRef.current = document.body.style.overflow;
      }

      document.body.style.overflow = "hidden";
      return;
    }

    if (bodyOverflowRef.current !== null) {
      document.body.style.overflow = bodyOverflowRef.current;
      bodyOverflowRef.current = null;
    }

    return () => {
      if (bodyOverflowRef.current !== null) {
        document.body.style.overflow = bodyOverflowRef.current;
        bodyOverflowRef.current = null;
      }
    };
  }, [isExpanded]);

  useEffect(() => {
    if (!isExpanded) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (window.matchMedia("(max-width: 768px)").matches) return;

      const navEl = navRef.current;
      const target = event.target as Node | null;

      if (!navEl || !target || navEl.contains(target)) return;

      event.preventDefault();
      closeMenu();
    };

    document.addEventListener("pointerdown", handlePointerDown, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, [closeMenu, isExpanded]);

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

        const h = 60 + contentEl.scrollHeight;

        Object.assign(contentEl.style, prev);

        return h;
      }
    }

    return 260;
  };

  const createTimeline = useCallback(() => {
    const navEl = navRef.current;

    if (!navEl) return null;

    gsap.set(navEl, {
      height: 60,
      overflow: "hidden",
    });

    gsap.set(cardsRef.current, {
      y: 24,
      opacity: 0,
    });

    const tl = gsap.timeline({ paused: true });

    tl.to(navEl, {
      height: calculateHeight,
      duration: 0.4,
      ease,
    });

    tl.to(
      cardsRef.current,
      {
        y: 0,
        opacity: 1,
        duration: 0.35,
        ease,
        stagger: 0.06,
      },
      "-=0.15",
    );

    return tl;
  }, [ease]);

  useLayoutEffect(() => {
    if (!isMounted) return;

    const tl = createTimeline();

    tlRef.current = tl;

    return () => {
      tl?.kill();
      tlRef.current = null;
    };
  }, [createTimeline, isMounted]);

  useLayoutEffect(() => {
    if (!isMounted) return;

    const handleResize = () => {
      if (!tlRef.current) return;

      if (isExpanded) {
        gsap.set(navRef.current, {
          height: calculateHeight(),
        });

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
  }, [createTimeline, isExpanded, isMounted]);

  const toggleMenu = () => {
    if (!isMounted) return;

    const tl = tlRef.current;

    if (!tl) return;

    if (!isExpanded) {
      setIsHamburgerOpen(true);
      setIsExpanded(true);

      tl.play(0);
    } else {
      closeMenu();
    }
  };

  const setCardRef = (i: number) => (el: HTMLDivElement | null) => {
    if (el) cardsRef.current[i] = el;
  };

  const desktopCardClassName = `
    nav-card
    select-none
    relative
    flex flex-col
    rounded-xl
    border border-border/60
    bg-background-subtle
    p-4

    md:h-full
    md:min-h-0
    md:rounded-[var(--radius-md)]
    md:border-none
    md:p-[12px_16px]
  `;

  const desktopLinkClassName = `
    group
    flex items-center justify-between
    w-full
    py-3
    border-b border-border/50
    last:border-none
    text-[15px]
    text-foreground
    transition-opacity duration-200
    hover:opacity-60

    md:inline-flex
    md:w-auto
    md:justify-start
    md:gap-1.5
    md:py-0
    md:border-none
    md:text-[16px]
  `;

  return (
    <>
      {isExpanded && isMounted
        ? createPortal(
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => closeMenu()}
              className="
                fixed inset-0 z-40 md:hidden
                bg-black/45
              "
            />,
            document.body,
          )
        : null}

      <div
        className={`
        card-nav-container
        absolute left-1/2 -translate-x-1/2
        w-[94%] md:w-[90%]
        max-w-105 md:max-w-200
        z-99
        top-[.35em] md:top-[.5em]
        ${className}
      `}
      >
        <nav
          ref={navRef}
          className={`
          card-nav
          ${isExpanded ? "open" : ""}
          bg-background
          border border-border
          flex flex-col
          h-15
          rounded-2xl
          shadow-[0_4px_24px_-4px_rgba(28,25,23,0.10)]
          relative z-100 overflow-hidden
          will-change-auto
        `}
        >
          {/* TOP BAR */}
          <div
            className="
            card-nav-top
            absolute inset-x-0 top-0
            h-15
            flex items-center justify-between
            px-4
            z-2
            border-b border-transparent md:border-none
          "
          >
            {/* Hamburger */}
            <div
              className={`
              hamburger-menu
              ${isHamburgerOpen ? "open" : ""}
              group
              h-full
              flex flex-col items-center justify-center
              cursor-pointer
              gap-1.5
              order-2 md:order-0
            `}
              onClick={toggleMenu}
              role="button"
              aria-label={isExpanded ? "Close menu" : "Open menu"}
              tabIndex={0}
              style={{ color: menuColor ?? "var(--foreground)" }}
            >
              <div
                className={`
                hamburger-line
                w-7 h-0.5
                bg-foreground
                transition-[transform,opacity]
                duration-300
                ease-linear
                origin-[50%_50%]
                ${isHamburgerOpen ? "translate-y-1 rotate-45" : ""}
                group-hover:opacity-50
              `}
              />

              <div
                className={`
                hamburger-line
                w-7 h-0.5
                bg-foreground
                transition-[transform,opacity]
                duration-300
                ease-linear
                origin-[50%_50%]
                ${isHamburgerOpen ? "-translate-y-1 -rotate-45" : ""}
                group-hover:opacity-50
              `}
              />
            </div>

            {/* Logo */}
            <Link
              href="/"
              className="
              logo-container
              absolute left-1/2 top-1/2
              -translate-x-1/2 -translate-y-1/2
              flex items-center
            "
            >
              <GlintAnimation className="h-6 md:h-7" />
            </Link>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/analysis"
                className="
                card-nav-cta-button
                inline-flex
                border-0
                rounded-(--radius-md)
                px-4
                items-center
                h-[calc(100%-10px)]
                min-h-9.5
                font-medium
                cursor-pointer
                transition-opacity duration-200
                hover:opacity-85
              "
                style={{
                  backgroundColor: buttonBgColor ?? "var(--primary)",
                  color: buttonTextColor ?? "var(--primary-fg)",
                }}
                onClick={handleCtaClick}
              >
                Analyze
              </Link>

              {secondaryAction && (
                <Link
                  href={secondaryAction.href}
                  aria-label={secondaryAction.ariaLabel}
                  className="
                  inline-flex items-center justify-center
                  w-9.5 h-9.5
                  rounded-(--radius-md)
                  border border-border
                  text-foreground
                  hover:opacity-60
                  transition-opacity duration-200
                  shrink-0
                "
                  onClick={(e) => handleNavLinkClick(e, secondaryAction.href)}
                >
                  <secondaryAction.Icon size={18} strokeWidth={1.75} />
                </Link>
              )}
            </div>
          </div>

          {/* CONTENT */}
          <div
            className={`
          card-nav-content
          absolute left-0 right-0 top-15
          md:bottom-0
          p-3
          flex flex-col
          gap-3
          z-1

          ${
            isExpanded
              ? "visible pointer-events-auto"
              : "invisible pointer-events-none"
          }

          md:grid
          md:grid-cols-3
          md:h-[calc(100%-60px)]
          md:items-stretch
          md:gap-2
          md:p-2
        `}
            aria-hidden={!isExpanded}
          >
            {isMounted &&
              (items ?? []).slice(0, 3).map((item, idx) => (
                <div
                  key={`${item.label}-${idx}`}
                  ref={setCardRef(idx)}
                  className={desktopCardClassName}
                  style={{
                    backgroundColor: item.bgColor ?? "var(--background-subtle)",
                    color: item.textColor ?? "var(--foreground)",
                  }}
                >
                  <div className="nav-card-label text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground-muted md:text-[22px] md:font-normal md:normal-case md:tracking-[-0.5px] md:text-foreground">
                    {item.label}
                  </div>

                  <div className="mt-3 flex flex-col md:mt-auto md:flex-1 md:justify-end md:gap-0.5">
                    {item.links?.map((lnk, i) => (
                      <Link
                        key={`${lnk.href}-${i}`}
                        href={lnk.href}
                        aria-label={lnk.ariaLabel}
                        onClick={(e) => handleNavLinkClick(e, lnk.href)}
                        className={desktopLinkClassName}
                      >
                        <div className="flex items-center gap-2">
                          <GoArrowUpRight
                            className="shrink-0 opacity-70 md:opacity-100"
                            aria-hidden="true"
                          />

                          <span>{lnk.label}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}

            {/* MOBILE ACTIONS */}
            <div
              ref={setCardRef(3)}
              className="
              md:hidden
              flex flex-col gap-3
            "
            >
              {/* Run analysis */}
              <Link
                href="/analysis"
                onClick={handleCtaClick}
                className="
                flex items-center justify-center
                w-full h-12
                rounded-xl
                font-medium
                text-sm
                transition-all duration-200
                hover:opacity-90
              "
                style={{
                  backgroundColor: buttonBgColor ?? "var(--primary)",
                  color: buttonTextColor ?? "var(--primary-fg)",
                }}
              >
                Run Analysis
              </Link>

              {/* Profile */}
              {secondaryAction && (
                <Link
                  href={secondaryAction.href}
                  aria-label={secondaryAction.ariaLabel}
                  onClick={(e) => handleNavLinkClick(e, secondaryAction.href)}
                  className="
                  flex items-center justify-center gap-2
                  w-full h-12
                  rounded-xl
                  border border-border
                  bg-background-subtle
                  text-foreground
                  text-sm
                  transition-opacity duration-200
                  hover:opacity-70
                "
                >
                  <secondaryAction.Icon size={18} strokeWidth={1.75} />

                  <span>Profile</span>
                </Link>
              )}

              <div className="w-full">
                <ThemeToggle className="w-full justify-center" />
              </div>
            </div>
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
    </>
  );
};

export default CardNav;
