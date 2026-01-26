import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

type AnimatedTextProps = {
  text: string;
  delay?: number;
  fontSize?: number;
  color?: string;
  fontWeight?: number;
  style?: React.CSSProperties;
};

export const AnimatedText = ({
  text,
  delay = 0,
  fontSize = 64,
  color = "white",
  fontWeight = 700,
  style = {},
}: AnimatedTextProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const translateY = interpolate(progress, [0, 1], [30, 0]);

  return (
    <div
      style={{
        fontSize,
        fontWeight,
        color,
        fontFamily: "system-ui, -apple-system, sans-serif",
        opacity,
        transform: `translateY(${translateY}px)`,
        textAlign: "center",
        lineHeight: 1.2,
        ...style,
      }}
    >
      {text}
    </div>
  );
};
