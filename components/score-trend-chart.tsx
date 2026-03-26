type ScoreTrendChartProps = {
    points: number[];
};

export function ScoreTrendChart({ points }: ScoreTrendChartProps) {
    if (points.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-border bg-background p-6 text-sm text-foreground-muted">
                No data available yet.
            </div>
        );
    }

    const width = 600;
    const height = 220;
    const padding = 24;
    const innerWidth = width - padding * 2;
    const innerHeight = height - padding * 2;

    const max = Math.max(...points, 100);
    const min = Math.min(...points, 0);
    const range = Math.max(max - min, 1);

    const toX = (index: number) =>
        padding + (index * innerWidth) / Math.max(points.length - 1, 1);
    const toY = (value: number) =>
        padding + ((max - value) / range) * innerHeight;

    const path = points.map((point, index) => `${toX(index)},${toY(point)}`).join(" ");

    return (
        <div className="rounded-xl border border-border bg-background-subtle p-4">
            <p className="mb-3 text-sm font-medium text-foreground-muted">Score trend</p>
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="h-52 w-full overflow-visible"
                role="img"
                aria-label="User score trend"
            >
                <rect x="0" y="0" width={width} height={height} fill="var(--background)" />
                <line
                    x1={padding}
                    y1={height - padding}
                    x2={width - padding}
                    y2={height - padding}
                    stroke="var(--border)"
                />
                <line
                    x1={padding}
                    y1={padding}
                    x2={padding}
                    y2={height - padding}
                    stroke="var(--border)"
                />

                <polyline
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={path}
                />

                {points.map((point, index) => (
                    <g key={`${index}-${point}`}>
                        <circle cx={toX(index)} cy={toY(point)} r="4" fill="var(--primary)" />
                        <text
                            x={toX(index)}
                            y={toY(point) - 10}
                            textAnchor="middle"
                            fontSize="11"
                            fill="var(--foreground-muted)"
                        >
                            {point}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    );
}