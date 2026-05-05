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
            const letterDrawable = svg.createDrawable('.glint-letter');
            animate(letterDrawable, {
                draw: ['0 0', '0 1'],
                ease: 'easeOutQuad',
                duration: 2500,
                loop: false,
            });

            animate('.glint-letter', {
                fillOpacity: [0, 1],
                strokeOpacity: [1, 0],
                strokeWidth: [1.25, 0],
                duration: 700,
                delay: 800,
                ease: 'easeOutQuad',
            });

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
                width="180"
                height="55"
                viewBox="18 0 220 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                    // Block removes the inline baseline descender gap that can
                    // cause a sub-pixel shift when animations change paint layers.
                    display: 'flex',
                    // Allow star glow to render beyond bounds
                    overflow: 'visible',
                }}
            >
                <g clipPath="url(#clip0_1_18)">
                    <path
                        className="glint-letter"
                        fill="currentColor"
                        fillOpacity="0"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M60.9721 37.84H77.3601V63H72.7361L72.1921 56.472C71.0588 59.1467 69.4494 61.1187 67.3641 62.388C65.3241 63.612 62.9668 64.224 60.2921 64.224C56.4841 64.224 53.1974 63.2493 50.4321 61.3C47.6668 59.3507 45.5134 56.54 43.9721 52.868C42.4761 49.196 41.7281 44.7533 41.7281 39.54C41.7281 34.1453 42.5214 29.5893 44.1081 25.872C45.7401 22.1093 47.9841 19.2533 50.8401 17.304C53.7414 15.3547 57.1188 14.38 60.9721 14.38C65.1428 14.38 68.6788 15.4907 71.5801 17.712C74.5268 19.9333 76.4988 23.56 77.4961 28.592H71.0361C70.4014 25.328 69.1774 23.084 67.3641 21.86C65.5961 20.5907 63.4654 19.956 60.9721 19.956C56.8014 19.956 53.6508 21.7013 51.5201 25.192C49.3894 28.6373 48.3241 33.3067 48.3241 39.2C48.3241 45.8187 49.4348 50.7147 51.6561 53.888C53.8774 57.0613 56.8014 58.648 60.4281 58.648C63.0574 58.648 65.2108 58.036 66.8881 56.812C68.5654 55.588 69.7894 53.9333 70.5601 51.848C71.3761 49.7173 71.7841 47.36 71.7841 44.776V43.416H60.9721V37.84ZM99.1993 13.428V58.376H110.147V63H81.3833V58.376H93.6913V18.052H81.3833V13.428H99.1993ZM126.206 22.268V15.468H133.006V22.268H126.206ZM132.394 27.368V58.376H143.342V63H114.578V58.376H126.818V31.992H114.578V27.368H132.394ZM149.406 63V27.368H154.642V33.284C156.047 31.108 157.656 29.408 159.47 28.184C161.328 26.96 163.663 26.348 166.474 26.348C168.559 26.348 170.44 26.7107 172.118 27.436C173.84 28.116 175.2 29.1813 176.198 30.632C177.24 32.0373 177.762 33.8507 177.762 36.072V63H172.118V38.316C172.118 35.9133 171.392 34.1453 169.942 33.012C168.491 31.8787 166.768 31.312 164.774 31.312C162.643 31.312 160.852 31.856 159.402 32.944C157.951 34.032 156.863 35.46 156.138 37.228C155.412 38.996 155.05 40.9 155.05 42.94V63H149.406ZM198.377 27.368H212.385V31.992H198.377V51.848C198.377 54.4773 199.057 56.3133 200.417 57.356C201.777 58.3533 203.749 58.852 206.333 58.852C207.511 58.852 208.599 58.8067 209.597 58.716C210.594 58.58 211.523 58.3987 212.385 58.172V63.136C211.251 63.4533 210.141 63.6573 209.053 63.748C207.965 63.884 206.945 63.952 205.993 63.952C201.686 63.952 198.399 63.068 196.133 61.3C193.866 59.532 192.733 56.7213 192.733 52.868V31.992H182.465V27.368H192.733V17.576H198.377V27.368Z"
                    />
                </g>

                {/* Star outside clipped group to show glow */}
                <g transform="translate(42, -12)">
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
                <defs>
                    <clipPath id="clip0_1_18">
                        <rect width="240" height="100" fill="white" />
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