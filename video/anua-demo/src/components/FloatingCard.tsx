import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

type FloatingCardProps = {
  children: React.ReactNode;
  delay?: number;
  x?: number;
  y?: number;
  width?: number;
  floatAmplitude?: number;
};

export const FloatingCard = ({
  children,
  delay = 0,
  x = 0,
  y = 0,
  width = 400,
  floatAmplitude = 8,
}: FloatingCardProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance animation
  const entranceProgress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  const scale = interpolate(entranceProgress, [0, 1], [0.9, 1]);
  const opacity = interpolate(entranceProgress, [0, 1], [0, 1]);
  const slideY = interpolate(entranceProgress, [0, 1], [40, 0]);

  // Subtle floating animation
  const floatOffset = Math.sin((frame + delay * 3) / 40) * floatAmplitude;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        background: "rgba(255, 255, 255, 0.06)",
        backdropFilter: "blur(20px)",
        borderRadius: 24,
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
        transform: `scale(${scale}) translateY(${slideY + floatOffset}px)`,
        opacity,
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
};
