import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Sequence } from "remotion";
import { AnimatedText } from "../components/AnimatedText";

const ProblemItem = ({
  icon,
  text,
  delay,
}: {
  icon: string;
  text: string;
  delay: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = interpolate(frame - delay, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacity = progress;
  const scale = interpolate(progress, [0, 1], [0.8, 1]);
  const translateY = interpolate(progress, [0, 1], [20, 0]);

  // Shake animation for chaos effect
  const shakeX = Math.sin(frame * 0.3 + delay) * 2;
  const shakeRotate = Math.sin(frame * 0.2 + delay) * 1;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
        opacity,
        transform: `scale(${scale}) translateY(${translateY}px) translateX(${shakeX}px) rotate(${shakeRotate}deg)`,
      }}
    >
      <div
        style={{
          fontSize: 80,
          filter: "grayscale(50%)",
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontSize: 24,
          color: "rgba(255, 255, 255, 0.7)",
          fontFamily: "system-ui, sans-serif",
          fontWeight: 500,
        }}
      >
        {text}
      </div>
    </div>
  );
};

export const ProblemScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene fade in/out
  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(frame, [14 * fps, 15 * fps], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Desaturated overlay for "problem" mood
  const overlayOpacity = interpolate(frame, [0, 30], [0, 0.3], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        opacity: fadeIn * fadeOut,
      }}
    >
      {/* Dark overlay for problem mood */}
      <AbsoluteFill
        style={{
          background: "rgba(0, 0, 0, 0.4)",
          opacity: overlayOpacity,
        }}
      />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 60,
        }}
      >
        <AnimatedText
          text="Horas perdidas em tarefas manuais"
          delay={10}
          fontSize={42}
          fontWeight={500}
          color="rgba(255, 255, 255, 0.9)"
        />

        <div
          style={{
            display: "flex",
            gap: 80,
            marginTop: 40,
          }}
        >
          <ProblemItem icon="📊" text="Planilhas" delay={30} />
          <ProblemItem icon="📄" text="Papéis" delay={50} />
          <ProblemItem icon="🔄" text="Retrabalho" delay={70} />
        </div>

        <Sequence from={100} layout="none">
          <AnimatedText
            text="Existe uma forma melhor..."
            delay={0}
            fontSize={36}
            fontWeight={400}
            color="rgba(255, 255, 255, 0.6)"
            style={{ marginTop: 60 }}
          />
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
