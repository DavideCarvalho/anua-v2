import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { Logo } from "../components/Logo";

export const TransitionScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene fade in/out
  const fadeIn = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(frame, [4 * fps, 5 * fps], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Text animation
  const textProgress = spring({
    frame: frame - 15,
    fps,
    config: { damping: 200 },
  });

  const textOpacity = textProgress;
  const textY = interpolate(textProgress, [0, 1], [30, 0]);

  // Glow pulse
  const glowIntensity = 0.3 + Math.sin(frame * 0.15) * 0.1;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeIn * fadeOut,
      }}
    >
      {/* Radial glow behind logo */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          background: `radial-gradient(circle, rgba(147, 51, 234, ${glowIntensity}) 0%, transparent 70%)`,
          borderRadius: "50%",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 50,
        }}
      >
        <Logo size={180} delay={0} showText={false} />

        <div
          style={{
            fontSize: 52,
            fontWeight: 600,
            color: "white",
            fontFamily: "system-ui, sans-serif",
            opacity: textOpacity,
            transform: `translateY(${textY}px)`,
          }}
        >
          Conheça o <span style={{ color: "#a855f7" }}>Anuá</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
