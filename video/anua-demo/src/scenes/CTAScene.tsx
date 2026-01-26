import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { Logo } from "../components/Logo";
import { AnimatedText } from "../components/AnimatedText";

export const CTAScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene fade in
  const fadeIn = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Button animation
  const buttonProgress = spring({
    frame: frame - 40,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const buttonScale = interpolate(buttonProgress, [0, 1], [0.8, 1]);
  const buttonOpacity = buttonProgress;

  // Pulse effect on button
  const pulse = 1 + Math.sin(frame * 0.15) * 0.03;

  // Website URL animation
  const urlProgress = spring({
    frame: frame - 70,
    fps,
    config: { damping: 200 },
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeIn,
      }}
    >
      {/* Radial glow */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          background: "radial-gradient(circle, rgba(147, 51, 234, 0.25) 0%, transparent 60%)",
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
        <Logo size={140} delay={0} />

        <AnimatedText
          text="Transforme a gestão da sua escola"
          delay={20}
          fontSize={38}
          fontWeight={500}
          color="rgba(255, 255, 255, 0.9)"
        />

        {/* CTA Button */}
        <div
          style={{
            background: "linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)",
            padding: "24px 64px",
            borderRadius: 16,
            transform: `scale(${buttonScale * pulse})`,
            opacity: buttonOpacity,
            boxShadow: "0 8px 40px rgba(147, 51, 234, 0.5)",
            cursor: "pointer",
          }}
        >
          <span
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "white",
              fontFamily: "system-ui, sans-serif",
              letterSpacing: 0.5,
            }}
          >
            Agende uma demonstração
          </span>
        </div>

        {/* Website URL */}
        <div
          style={{
            opacity: urlProgress,
            transform: `translateY(${interpolate(urlProgress, [0, 1], [20, 0])}px)`,
          }}
        >
          <span
            style={{
              fontSize: 24,
              color: "rgba(255, 255, 255, 0.6)",
              fontFamily: "system-ui, sans-serif",
              fontWeight: 500,
              letterSpacing: 1,
            }}
          >
            anuaapp.com.br
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
