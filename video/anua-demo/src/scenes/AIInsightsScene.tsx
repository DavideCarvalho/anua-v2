import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { FloatingCard } from "../components/FloatingCard";

const Sparkle = ({ x, y, delay, size = 20 }: { x: number; y: number; delay: number; size?: number }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    (frame + delay) % 60,
    [0, 15, 30, 45, 60],
    [0, 1, 0.5, 1, 0],
    { extrapolateRight: "clamp" }
  );

  const scale = interpolate((frame + delay) % 60, [0, 30, 60], [0.5, 1.2, 0.5]);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"
          fill="#d4a855"
        />
      </svg>
    </div>
  );
};

const AIBadge = ({ delay }: { delay: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15 },
  });

  const glowPulse = 0.3 + Math.sin(frame * 0.1) * 0.15;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 16px",
        background: `rgba(212, 168, 85, ${glowPulse})`,
        borderRadius: 20,
        border: "1px solid rgba(212, 168, 85, 0.5)",
        transform: `scale(${progress})`,
        opacity: progress,
      }}
    >
      <span style={{ fontSize: 14 }}>✨</span>
      <span
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Powered by AI
      </span>
    </div>
  );
};

const InsightCard = ({
  type,
  title,
  description,
  value,
  trend,
  delay,
}: {
  type: "alert" | "prediction" | "insight";
  title: string;
  description: string;
  value?: string;
  trend?: "up" | "down" | "neutral";
  delay: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  const colors = {
    alert: { bg: "rgba(239, 68, 68, 0.15)", border: "rgba(239, 68, 68, 0.4)", icon: "⚠️" },
    prediction: { bg: "rgba(59, 130, 246, 0.15)", border: "rgba(59, 130, 246, 0.4)", icon: "🔮" },
    insight: { bg: "rgba(34, 197, 94, 0.15)", border: "rgba(34, 197, 94, 0.4)", icon: "💡" },
  };

  const style = colors[type];

  return (
    <div
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: 16,
        padding: 20,
        transform: `scale(${interpolate(progress, [0, 1], [0.9, 1])}) translateX(${interpolate(progress, [0, 1], [30, 0])}px)`,
        opacity: progress,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span style={{ fontSize: 24 }}>{style.icon}</span>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "white",
              fontFamily: "system-ui, sans-serif",
              marginBottom: 6,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 14,
              color: "rgba(255, 255, 255, 0.7)",
              fontFamily: "system-ui, sans-serif",
              lineHeight: 1.4,
            }}
          >
            {description}
          </div>
          {value && (
            <div
              style={{
                marginTop: 12,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "white",
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                {value}
              </span>
              {trend && (
                <span style={{ fontSize: 18 }}>
                  {trend === "up" ? "📈" : trend === "down" ? "📉" : "➡️"}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const AIInsightsScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene fade in/out
  const fadeIn = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(frame, [14 * fps, 15 * fps], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeIn * fadeOut,
      }}
    >
      {/* Sparkles background */}
      <Sparkle x={150} y={200} delay={0} size={24} />
      <Sparkle x={1700} y={150} delay={20} size={18} />
      <Sparkle x={300} y={700} delay={40} size={20} />
      <Sparkle x={1600} y={800} delay={15} size={22} />
      <Sparkle x={960} y={100} delay={35} size={16} />

      {/* Title */}
      <div style={{ position: "absolute", top: 60, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <AIBadge delay={0} />
        <AnimatedText
          text="IA que trabalha por você"
          delay={15}
          fontSize={42}
          fontWeight={600}
        />
      </div>

      {/* Insights Panel */}
      <FloatingCard delay={30} x={300} y={220} width={1320}>
        <div style={{ padding: 32 }}>
          <div
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: "white",
              fontFamily: "system-ui, sans-serif",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span>🧠</span>
            <span>Insights Inteligentes</span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
            }}
          >
            <InsightCard
              type="alert"
              title="Alunos em Risco"
              description="12 alunos identificados com baixo desempenho nas últimas 4 semanas"
              value="12"
              trend="up"
              delay={50}
            />
            <InsightCard
              type="prediction"
              title="Previsão de Inadimplência"
              description="Taxa estimada para o próximo mês baseada em padrões históricos"
              value="4.2%"
              trend="down"
              delay={70}
            />
            <InsightCard
              type="insight"
              title="Oportunidade de Matrícula"
              description="Período ideal para campanhas baseado em dados de anos anteriores"
              value="Jan-Fev"
              delay={90}
            />
            <InsightCard
              type="prediction"
              title="Receita Projetada"
              description="Projeção de receita para o próximo trimestre"
              value="R$ 1.2M"
              trend="up"
              delay={110}
            />
          </div>
        </div>
      </FloatingCard>

      {/* Bottom text */}
      <Sequence from={130} layout="none">
        <div style={{ position: "absolute", bottom: 80 }}>
          <AnimatedText
            text="Identifique riscos antes que aconteçam"
            delay={0}
            fontSize={28}
            fontWeight={500}
            color="rgba(255, 255, 255, 0.8)"
          />
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
