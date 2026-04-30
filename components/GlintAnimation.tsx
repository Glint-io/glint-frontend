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

            // --- Text: draw stroke, then crossfade into solid fill ---
            const letterDrawables = svg.createDrawable('.glint-letter');
            if (localStorage.getItem('theme') === 'dark') {
                animate(letterDrawables, {
                    fillOpacity: [0, 1],
                    strokeOpacity: [1, 0],
                    strokeWidth: [1.25, 0],
                    draw: ['0 0', '0 1'],
                    ease: 'easeOutQuad',
                    duration: 950,
                    delay: stagger(200),
                    loop: false,
                });
            } else {
                animate(letterDrawables, {
                    draw: ['0 0', '0 1'],
                    ease: 'easeOutQuad',
                    duration: 2500,
                    delay: stagger(200),
                    loop: false,
                });

                animate('.glint-letter', {
                    fillOpacity: [0, 1],
                    strokeOpacity: [1, 0],
                    strokeWidth: [1.25, 0],
                    duration: 700,
                    // Stagger mirrors the draw stagger so each letter crossfades
                    // ~200ms before its own stroke finishes drawing.
                    // Letter draw ends at: 3500 + (index * 200)
                    // Fill crossfade starts at: 3300 + (index * 200)
                    delay: stagger(200, { start: 2300 }),
                    ease: 'easeOutQuad',
                });
            }

            // --- Star: quick draw → continuous spin + glow pulse ---
            const starDrawable = svg.createDrawable('.glint-star-draw');
            animate(starDrawable, {
                fillOpacity: [0, 0.9],
                draw: ['0 0', '0 1'],
                ease: 'easeOutQuart',
                duration: 700,
                delay: 150,
                loop: false,
                onComplete: () => {
                    animate('.glint-star-draw', {
                        rotate: '1turn',
                        duration: 10000,
                        ease: 'linear',
                        loop: true,
                    });
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
                width="160"
                height="50"
                viewBox="0 0 155 72"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                    // Block removes the inline baseline descender gap that can
                    // cause a sub-pixel shift when animations change paint layers.
                    display: 'block',
                    // Prevent the rotating star from nudging the SVG's overflow
                    // boundary and causing a reflow.
                    overflow: 'hidden',
                }}
            >
                <g clipPath="url(#clip0_1_18)">
                    {/* g */}
                    <path
                        className="glint-letter"
                        d="M10.7213 63.416V57.092H22.2133C24.1173 57.092 25.5226 56.6387 26.4293 55.732C27.3813 54.8254 27.8573 53.488 27.8573 51.72V47.98L27.9933 41.044H26.4293L27.9253 39.684C27.9253 42.54 27.0186 44.784 25.2053 46.416C23.4373 48.048 21.0346 48.864 17.9973 48.864C14.1439 48.864 11.1066 47.5947 8.88528 45.056C6.66395 42.5174 5.55328 39.0947 5.55328 34.788V27.172C5.55328 22.8654 6.66395 19.4427 8.88528 16.904C11.1066 14.3654 14.1439 13.096 17.9973 13.096C21.0346 13.096 23.4373 13.9347 25.2053 15.612C27.0186 17.244 27.9253 19.488 27.9253 22.344L26.4293 20.916H27.9253L27.8573 13.776H35.1333V51.856C35.1333 55.4374 34 58.248 31.7333 60.288C29.4666 62.3734 26.3159 63.416 22.2813 63.416H10.7213ZM20.3773 42.54C22.6893 42.54 24.5026 41.8374 25.8173 40.432C27.1773 38.9814 27.8573 36.9867 27.8573 34.448V27.58C27.8573 25.0414 27.1773 23.0694 25.8173 21.664C24.5026 20.2134 22.6893 19.488 20.3773 19.488C17.9746 19.488 16.1159 20.1907 14.8013 21.596C13.5319 22.956 12.8973 24.9507 12.8973 27.58V34.448C12.8973 37.032 13.5319 39.0267 14.8013 40.432C16.1159 41.8374 17.9746 42.54 20.3773 42.54Z"
                        fill="currentColor"
                        fillOpacity="0"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    {/* l */}
                    <path
                        className="glint-letter"
                        d="M51.8853 53.176C49.5733 53.176 47.5559 52.7227 45.8333 51.816C44.1106 50.864 42.7506 49.5267 41.7533 47.804C40.8013 46.0814 40.3253 44.0867 40.3253 41.82V10.2H28.0853V3.53602H47.6693V41.82C47.6693 43.2707 48.0773 44.4267 48.8933 45.288C49.7093 46.104 50.8199 46.512 52.2253 46.512H63.7853V53.176H51.8853Z"
                        fill="currentColor"
                        fillOpacity="0"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    {/* i */}
                    <path
                        className="glint-letter"
                        d="M50.6213 53.176V46.512H63.7453V22.44H52.3213V15.776H70.8853V46.512H82.9213V53.176H50.6213ZM66.6013 9.31602C65.0146 9.31602 63.7453 8.90802 62.7933 8.09202C61.8413 7.23069 61.3653 6.09736 61.3653 4.69202C61.3653 3.24135 61.8413 2.10802 62.7933 1.29202C63.7453 0.430689 65.0146 2.09808e-05 66.6013 2.09808e-05C68.1879 2.09808e-05 69.4573 0.430689 70.4093 1.29202C71.3613 2.10802 71.8373 3.24135 71.8373 4.69202C71.8373 6.09736 71.3613 7.23069 70.4093 8.09202C69.4573 8.90802 68.1879 9.31602 66.6013 9.31602Z"
                        fill="currentColor"
                        fillOpacity="0"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    {/* n */}
                    <path
                        className="glint-letter"
                        d="M77.8253 53.176V15.776H85.1013V22.916H86.8693L85.1013 24.616C85.1013 21.624 85.9853 19.2894 87.7533 17.612C89.5213 15.9347 91.9693 15.096 95.0973 15.096C98.8146 15.096 101.784 16.2974 104.005 18.7C106.227 21.0574 107.337 24.2534 107.337 28.288V53.176H99.9933V29.104C99.9933 26.656 99.3359 24.7747 98.0213 23.46C96.7066 22.1454 94.9159 21.488 92.6493 21.488C90.3373 21.488 88.5013 22.1907 87.1413 23.596C85.8266 24.956 85.1693 26.9507 85.1693 29.58V53.176H77.8253Z"
                        fill="currentColor"
                        fillOpacity="0"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    {/* t */}
                    <path
                        className="glint-letter"
                        d="M126.093 63.176C122.693 63.176 120.041 62.2467 118.137 60.388C116.233 58.5294 115.281 55.9454 115.281 52.636V32.44H104.945V25.776H115.281V15.236H122.625V25.776H137.245V32.44H122.625V52.636C122.625 55.22 123.872 56.512 126.365 56.512H136.565V63.176H126.093Z"
                        fill="currentColor"
                        fillOpacity="0"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    {/* Star repositioned above the "t" */}
                    <g transform="translate(-36 -12)">
                        <path
                            className="glint-star glint-star-draw"
                            d="M171.811 20.0728L171.094 27.8748L177.89 31.6618L170.161 30.6051L165.989 37.1052L166.748 29.4385L159.911 25.5162L167.681 26.7082L171.811 20.0728Z"
                            fill="var(--primary)"
                            fillOpacity="0.9"
                            stroke="var(--primary)"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                                transformBox: 'fill-box',
                                transformOrigin: 'center',
                                // Promote to its own compositor layer so the continuous
                                // rotation never triggers a repaint of the text paths.
                                willChange: 'transform',
                            }}
                        />
                    </g>
                </g>
                <defs>
                    <clipPath id="clip0_1_18">
                        <rect width="155" height="72" fill="white" />
                    </clipPath>
                </defs>
            </svg>
        </div>
    );
}

/* "use client";

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

            // --- Text: draw stroke, then crossfade into solid fill ---
            const letterDrawables = svg.createDrawable('.glint-letter');
            if (localStorage.getItem('theme') === 'dark') {
                animate(letterDrawables, {
                    fillOpacity: [0, 1],
                    strokeOpacity: [1, 0],
                    strokeWidth: [1.25, 0],
                    draw: ['0 0', '0 1'],
                    ease: 'easeOutQuad',
                    duration: 1350,
                    delay: stagger(200),
                    loop: false,
                });
            } else {
                animate(letterDrawables, {
                    draw: ['0 0', '0 1'],
                    ease: 'easeOutQuad',
                    duration: 3500,
                    delay: stagger(200),
                    loop: false,
                });

                animate('.glint-letter', {
                    fillOpacity: [0, 1],
                    strokeOpacity: [1, 0],
                    strokeWidth: [1.25, 0],
                    duration: 700,
                    delay: 1250,
                    ease: 'easeOutQuad',
                });
            }

            // --- Star: quick draw → continuous spin + glow pulse ---
            const starDrawable = svg.createDrawable('.glint-star-draw');
            animate(starDrawable, {
                fillOpacity: [0, 0.9],
                draw: ['0 0', '0 1'],
                ease: 'easeOutQuart',
                duration: 700,
                delay: 150,
                loop: false,
                onComplete: () => {
                    animate('.glint-star-draw', {
                        rotate: '1turn',
                        duration: 10000,
                        ease: 'linear',
                        loop: true,
                    });
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
                style={{
                    // Block removes the inline baseline descender gap that can
                    // cause a sub-pixel shift when animations change paint layers.
                    display: 'block',
                    // Prevent the rotating star from nudging the SVG's overflow
                    // boundary and causing a reflow.
                    overflow: 'hidden',
                }}
            >
                <g clipPath="url(#clip0_1_18)">
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
                    <g transform="translate(12 0)">
                        <path
                            className="glint-star glint-star-draw"
                            d="M171.811 20.0728L171.094 27.8748L177.89 31.6618L170.161 30.6051L165.989 37.1052L166.748 29.4385L159.911 25.5162L167.681 26.7082L171.811 20.0728Z"
                            fill="var(--primary)"
                            fillOpacity="0.9"
                            stroke="var(--primary)"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                                transformBox: 'fill-box',
                                transformOrigin: 'center',
                                // Promote to its own compositor layer so the continuous
                                // rotation never triggers a repaint of the text paths.
                                willChange: 'transform',
                            }}
                        />
                    </g>
                </g>
                <defs>
                    <clipPath id="clip0_1_18">
                        <rect width="220" height="80" fill="white" />
                    </clipPath>
                </defs>
            </svg>
        </div>
    );
} */