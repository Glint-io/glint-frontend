"use client";

import { animate, createScope, svg, stagger } from 'animejs';
import { useEffect, useRef } from 'react';
import type { Scope } from 'animejs';

type GlintAnimationProps = {
    className?: string;
};

export default function GlintAnimation({ className = '' }: GlintAnimationProps) {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const scopeRef = useRef<Scope | null>(null);

    useEffect(() => {
        scopeRef.current = createScope({ root: rootRef }).add(() => {

            // --- Text: draw stroke, then quickly crossfade into solid fill ---
            const letterDrawables = svg.createDrawable('.glint-letter');
            animate(letterDrawables, {
                draw: ['0 0', '0 1'],
                ease: 'linear',
                duration: 3500,
                delay: stagger(200),
                loop: false,
            });

            animate('.glint-letter', {
                fillOpacity: [0, 1],
                strokeOpacity: [1, 0],
                duration: localStorage.getItem('theme') === 'dark' ? 1350 : 500,
                delay: localStorage.getItem('theme') === 'dark' ? 0 : 1350,
                ease: 'easeOutQuad',
            });

            // --- Star: quick draw then a soft repeating glow-pulse ---
            const starDrawable = svg.createDrawable('.glint-star-draw');
            animate(starDrawable, {
                draw: ['0 0', '0 1'],
                ease: 'easeOutQuart',
                duration: 700,
                // slight head-start so the star appears alongside the first letter
                delay: 150,
                loop: false,
                onComplete: () => {
                    animate('.glint-star-draw', {
                        opacity: [0.95, 0.6],
                        duration: 1300,
                        ease: 'easeInOutSine',
                        loopDelay: 80,
                        loop: true,
                        alternate: true,
                    });
                },
            });
        });

        return () => scopeRef.current?.revert();
    }, []);

    return (
        <div
            ref={rootRef}
            className={className}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            <svg
                width="220"
                height="60"
                viewBox="0 0 220 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <g clipPath="url(#clip0_1_18)">
                    {/*
                     * FIX 1 — was fill="none" stroke="#1A1A1A"
                     *   • fill="currentColor" inherits the themed foreground colour
                     *     (light: #2A1E0F  |  dark: #FAEFD9) — no more hard-coded black
                     *   • fillOpacity="0" hides the fill at start; anime crossfades it in
                     *     once the stroke draw finishes (onComplete above)
                     *   • stroke="currentColor" keeps the draw stroke on-theme too
                     */}
                    <path
                        className="glint-letter"
                        d="M54.92 66H51.316C50.7267 66 50.432 65.728 50.432 65.184L50.5 60.492C46.5107 64.4813 41.184 66.476 34.52 66.476C27.9013 66.476 22.3707 64.164 17.928 59.54C13.4853 54.916 11.264 48.8413 11.264 41.316C11.264 36.284 12.3747 31.864 14.596 28.056C16.8627 24.248 19.7187 21.4147 23.164 19.556C26.6547 17.6973 30.4173 16.768 34.452 16.768C41.388 16.768 46.3747 18.9213 49.412 23.228L49.344 17.992C49.2533 17.448 49.5253 17.176 50.16 17.176H53.968C54.5573 17.176 54.852 17.448 54.852 17.992V32C54.852 32.544 54.5573 32.816 53.968 32.816H49.684C49.14 32.816 48.868 32.544 48.868 32V31.184C48.868 29.1893 47.4853 27.2173 44.72 25.268C42 23.3187 38.5093 22.344 34.248 22.344C29.9867 22.344 26.1333 24.112 22.688 27.648C19.288 31.1387 17.588 35.8307 17.588 41.724C17.588 47.572 19.3107 52.2187 22.756 55.664C26.2013 59.064 30.0547 60.764 34.316 60.764C38.5773 60.764 41.932 60.084 44.38 58.724C46.8733 57.364 48.732 55.7547 49.956 53.896V48.592H37.308C36.764 48.592 36.492 48.2973 36.492 47.708V44.58C36.492 44.036 36.764 43.764 37.308 43.764H54.92C55.464 43.764 55.736 44.036 55.736 44.58V65.184C55.736 65.728 55.464 66 54.92 66ZM78.856 66H65.868C65.2787 66 64.984 65.728 64.984 65.184V62.26C64.984 61.716 65.2787 61.444 65.868 61.444H69.608V21.732H65.868C65.2787 21.732 64.984 21.46 64.984 20.916V17.992C64.984 17.448 65.2787 17.176 65.868 17.176H73.416C74.64 17.176 75.252 17.7427 75.252 18.876V61.444H78.856C79.4453 61.444 79.74 61.716 79.74 62.26V65.184C79.74 65.728 79.4453 66 78.856 66ZM102.178 66H89.1899C88.6005 66 88.3059 65.728 88.3059 65.184V62.26C88.3059 61.716 88.6005 61.444 89.1899 61.444H92.9299V37.1H89.1899C88.6005 37.1 88.3059 36.828 88.3059 36.284V33.36C88.3059 32.816 88.6005 32.544 89.1899 32.544H97.7579C98.3019 32.544 98.5739 32.816 98.5739 33.36V61.444H102.178C102.767 61.444 103.062 61.716 103.062 62.26V65.184C103.062 65.728 102.767 66 102.178 66ZM98.3019 22.48C99.0725 23.2507 99.4579 24.1573 99.4579 25.2C99.4579 26.2427 99.0725 27.1267 98.3019 27.852C97.5765 28.5773 96.6925 28.94 95.6499 28.94C94.6072 28.94 93.7005 28.5773 92.9299 27.852C92.2045 27.1267 91.8419 26.2427 91.8419 25.2C91.8419 24.1573 92.2045 23.2507 92.9299 22.48C93.7005 21.7093 94.6072 21.324 95.6499 21.324C96.6925 21.324 97.5765 21.7093 98.3019 22.48ZM147.804 66H141.344C139.394 66 138.42 65.048 138.42 63.144V45.26C138.42 42.6307 137.785 40.5907 136.516 39.14C135.246 37.6893 133.388 36.964 130.94 36.964C127.449 36.964 124.729 38.392 122.78 41.248C122.553 41.52 122.258 42.0187 121.896 42.744V61.444H125.5C126.089 61.444 126.384 61.716 126.384 62.26V65.184C126.384 65.728 126.089 66 125.5 66H112.512C111.922 66 111.628 65.728 111.628 65.184V62.26C111.628 61.716 111.922 61.444 112.512 61.444H116.252V37.1H112.512C111.922 37.1 111.628 36.828 111.628 36.284V33.36C111.628 32.816 111.922 32.544 112.512 32.544H120.468C121.057 32.544 121.352 32.816 121.352 33.36L121.216 37.984H121.42C123.777 34.04 127.426 32.068 132.368 32.068C135.994 32.068 138.828 33.1333 140.868 35.264C142.908 37.3947 143.95 40.2733 143.996 43.9V61.444H147.804C148.393 61.444 148.688 61.716 148.688 62.26V65.184C148.688 65.728 148.393 66 147.804 66ZM176.787 62.532C176.968 62.7133 177.059 62.9173 177.059 63.144C177.059 63.3253 176.923 63.552 176.651 63.824C174.656 65.592 172.14 66.476 169.103 66.476C166.111 66.476 163.64 65.5013 161.691 63.552C159.787 61.5573 158.835 58.6787 158.835 54.916V37.1H155.027C154.392 37.1 154.075 36.8053 154.075 36.216V33.428C154.075 32.8387 154.392 32.544 155.027 32.544H158.835V25.676C158.835 25.0413 159.152 24.724 159.787 24.724H163.595C164.184 24.724 164.479 25.0413 164.479 25.676V32.544H173.115C173.749 32.544 174.067 32.8387 174.067 33.428V36.216C174.067 36.8053 173.749 37.1 173.115 37.1H164.479V54.78C164.479 57.0467 164.977 58.7693 165.975 59.948C167.017 61.0813 168.377 61.648 170.055 61.648C171.777 61.648 173.069 61.2173 173.931 60.356C174.384 59.948 174.792 59.9707 175.155 60.424L176.787 62.532Z"
                        fill="currentColor"
                        fillOpacity="0"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    {/*
                     * FIX 2 — star had two problems:
                     *   a) VISIBILITY: colour #FAEA35 nearly matches the #FAEFD9 cream bg.
                     *      Using the themed --primary amber (#E8A736) instead gives contrast
                     *      in both light and dark modes. fill added so the body is opaque.
                     *   b) GLOW: the .glint-star CSS class (drop-shadow filter) already
                     *      existed in globals.css but was never applied to the element.
                     *      Now both classes are present: .glint-star (CSS glow) and
                     *      .glint-star-draw (JS animation target — kept separate so the
                     *      text onComplete doesn't accidentally target this element).
                     * FIX 3 — transform-origin: the .glint-star-draw CSS below sets
                     *      transform-box: fill-box so scale() pivots around the star's own
                     *      centre rather than the SVG's 0,0 origin.
                     */}
                    <path
                        className="glint-star glint-star-draw"
                        d="M171.811 20.0728L171.094 27.8748L177.89 31.6618L170.161 30.6051L165.989 37.1052L166.748 29.4385L159.911 25.5162L167.681 26.7082L171.811 20.0728Z"
                        transform="translate(12 0)"
                        fill="var(--primary)"
                        fillOpacity="0.9"
                        stroke="var(--primary)"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </g>
                <defs>
                    <clipPath id="clip0_1_18">
                        {/* fill on a clipPath rect has no visual effect — it only defines the clip region */}
                        <rect width="220" height="80" fill="white" />
                    </clipPath>
                </defs>
            </svg>
        </div>
    );
}