import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

export const Background = () => {
  const frame = useCurrentFrame();

  // Subtle gradient animation
  const gradientShift = interpolate(frame, [0, 2250], [0, 20], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${135 + gradientShift}deg, #0f0520 0%, #1a0a2e 30%, #2d1b4e 70%, #1a0a2e 100%)`,
      }}
    />
  );
};
