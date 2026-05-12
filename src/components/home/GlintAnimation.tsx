"use client";

import { animate, createScope, svg } from 'animejs';
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
                    display: 'flex',
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