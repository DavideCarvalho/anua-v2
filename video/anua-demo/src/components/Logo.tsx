import { Img, staticFile, spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";

type LogoProps = {
  size?: number;
  delay?: number;
  showText?: boolean;
};

export const Logo = ({ size = 120, delay = 0, showText = true }: LogoProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scaleProgress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const textOpacity = interpolate(frame - delay, [15, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scale = interpolate(scaleProgress, [0, 1], [0.5, 1]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        transform: `scale(${scale})`,
        opacity: scaleProgress,
      }}
    >
      <Img src={staticFile("logo.svg")} style={{ width: size, height: size }} />
      {showText && (
        <span
          style={{
            fontSize: size * 0.4,
            fontWeight: 700,
            color: "white",
            fontFamily: "system-ui, -apple-system, sans-serif",
            opacity: textOpacity,
            letterSpacing: 2,
          }}
        >
          Anuá
        </span>
      )}
    </div>
  );
};
