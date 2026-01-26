import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

type AnimatedChartProps = {
  data: number[];
  delay?: number;
  width?: number;
  height?: number;
  color?: string;
};

export const AnimatedChart = ({
  data,
  delay = 0,
  width = 500,
  height = 200,
  color = "#9333EA",
}: AnimatedChartProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const maxValue = Math.max(...data);
  const barWidth = (width - (data.length - 1) * 8) / data.length;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 8,
        height,
        width,
        padding: "0 10px",
      }}
    >
      {data.map((value, index) => {
        const barDelay = delay + index * 4;
        const progress = spring({
          frame: frame - barDelay,
          fps,
          config: { damping: 15, stiffness: 80 },
        });

        const barHeight = interpolate(progress, [0, 1], [0, (value / maxValue) * height * 0.9]);

        return (
          <div
            key={index}
            style={{
              width: barWidth,
              height: barHeight,
              background: `linear-gradient(180deg, ${color} 0%, ${color}80 100%)`,
              borderRadius: 6,
              opacity: interpolate(progress, [0, 0.3], [0, 1], {
                extrapolateRight: "clamp",
              }),
            }}
          />
        );
      })}
    </div>
  );
};
