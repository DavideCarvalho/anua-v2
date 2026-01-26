import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

type MetricCardProps = {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  delay?: number;
  color?: string;
  icon?: string;
};

export const MetricCard = ({
  title,
  value,
  suffix = "",
  prefix = "",
  delay = 0,
  color = "#9333EA",
  icon,
}: MetricCardProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Card entrance animation
  const entranceProgress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const scale = interpolate(entranceProgress, [0, 1], [0.8, 1]);
  const opacity = interpolate(entranceProgress, [0, 1], [0, 1]);
  const translateY = interpolate(entranceProgress, [0, 1], [50, 0]);

  // Number counting animation (starts after card appears)
  const countDelay = delay + 10;
  const countProgress = interpolate(frame - countDelay, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const displayValue = Math.round(value * countProgress);

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(10px)",
        borderRadius: 20,
        padding: 32,
        minWidth: 280,
        border: "1px solid rgba(255, 255, 255, 0.1)",
        transform: `scale(${scale}) translateY(${translateY}px)`,
        opacity,
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
        }}
      >
        {icon && (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: `${color}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
            }}
          >
            {icon}
          </div>
        )}
        <span
          style={{
            fontSize: 16,
            color: "rgba(255, 255, 255, 0.7)",
            fontFamily: "system-ui, sans-serif",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {title}
        </span>
      </div>
      <div
        style={{
          fontSize: 48,
          fontWeight: 700,
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {prefix}
        {displayValue.toLocaleString("pt-BR")}
        {suffix}
      </div>
    </div>
  );
};
