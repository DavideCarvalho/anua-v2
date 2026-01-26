import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { Logo } from "../components/Logo";
import { AnimatedText } from "../components/AnimatedText";

export const HookScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene fade out at the end
  const sceneOpacity = interpolate(frame, [4 * fps, 5 * fps], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: sceneOpacity,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 60,
        }}
      >
        <Logo size={150} delay={0} />
        <AnimatedText
          text="Gestão escolar nunca foi tão simples"
          delay={20}
          fontSize={56}
          fontWeight={600}
          style={{ maxWidth: 900 }}
        />
      </div>
    </AbsoluteFill>
  );
};
