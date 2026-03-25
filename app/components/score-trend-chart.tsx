type ScoreTrendChartProps = {
    points: number[];
};

export function ScoreTrendChart({ points }: ScoreTrendChartProps) {
    if (points.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
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
        <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="mb-3 text-sm font-medium text-slate-700">Score trend</p>
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="h-52 w-full overflow-visible"
                role="img"
                aria-label="User score trend"
            >
                <rect x="0" y="0" width={width} height={height} fill="#ffffff" />
                <line
                    x1={padding}
                    y1={height - padding}
                    x2={width - padding}
                    y2={height - padding}
                    stroke="#cbd5e1"
                />
                <line
                    x1={padding}
                    y1={padding}
                    x2={padding}
                    y2={height - padding}
                    stroke="#cbd5e1"
                />

                <polyline
                    fill="none"
                    stroke="#0f172a"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={path}
                />

                {points.map((point, index) => (
                    <g key={`${index}-${point}`}>
                        <circle cx={toX(index)} cy={toY(point)} r="4" fill="#0f172a" />
                        <text
                            x={toX(index)}
                            y={toY(point) - 10}
                            textAnchor="middle"
                            fontSize="11"
                            fill="#334155"
                        >
                            {point}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    );
}