import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Sequence } from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { MetricCard } from "../components/MetricCard";
import { FloatingCard } from "../components/FloatingCard";
import { AnimatedChart } from "../components/AnimatedChart";

const DashboardHeader = ({ delay }: { delay: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = interpolate(frame - delay, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 24px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        opacity: progress,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: "linear-gradient(135deg, #9333EA, #7C3AED)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            color: "white",
            fontWeight: 700,
          }}
        >
          A
        </div>
        <span
          style={{
            color: "white",
            fontSize: 18,
            fontWeight: 600,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Dashboard
        </span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#22c55e",
          }}
        />
        <span
          style={{
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: 14,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Colégio Exemplo
        </span>
      </div>
    </div>
  );
};

const SidebarNav = ({ delay }: { delay: number }) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame - delay, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const items = [
    { icon: "📊", label: "Dashboard", active: true },
    { icon: "👥", label: "Alunos", active: false },
    { icon: "👨‍🏫", label: "Professores", active: false },
    { icon: "💰", label: "Financeiro", active: false },
    { icon: "🎮", label: "Gamificação", active: false },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: "12px",
        opacity: progress,
      }}
    >
      {items.map((item, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 16px",
            borderRadius: 10,
            background: item.active ? "rgba(147, 51, 234, 0.3)" : "transparent",
            border: item.active ? "1px solid rgba(147, 51, 234, 0.5)" : "1px solid transparent",
          }}
        >
          <span style={{ fontSize: 18 }}>{item.icon}</span>
          <span
            style={{
              color: item.active ? "white" : "rgba(255, 255, 255, 0.6)",
              fontSize: 14,
              fontFamily: "system-ui, sans-serif",
              fontWeight: item.active ? 600 : 400,
            }}
          >
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export const DashboardScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene fade in/out
  const fadeIn = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(frame, [24 * fps, 25 * fps], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Chart data
  const chartData = [65, 78, 85, 72, 90, 88, 95, 82, 98, 92, 105, 110];

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeIn * fadeOut,
      }}
    >
      {/* Title */}
      <div style={{ position: "absolute", top: 60 }}>
        <AnimatedText
          text="Tudo em um só lugar"
          delay={0}
          fontSize={42}
          fontWeight={600}
        />
      </div>

      {/* Main floating dashboard UI */}
      <FloatingCard delay={20} x={200} y={180} width={1520}>
        <DashboardHeader delay={30} />

        <div style={{ display: "flex" }}>
          {/* Sidebar */}
          <div
            style={{
              width: 200,
              borderRight: "1px solid rgba(255, 255, 255, 0.1)",
              minHeight: 500,
            }}
          >
            <SidebarNav delay={40} />
          </div>

          {/* Main content */}
          <div style={{ flex: 1, padding: 32 }}>
            {/* Metrics row */}
            <div
              style={{
                display: "flex",
                gap: 24,
                marginBottom: 32,
              }}
            >
              <MetricCard
                title="Total de Alunos"
                value={1847}
                delay={50}
                icon="👥"
                color="#9333EA"
              />
              <MetricCard
                title="Receita Mensal"
                value={348500}
                prefix="R$ "
                delay={60}
                icon="💰"
                color="#22c55e"
              />
              <MetricCard
                title="Inadimplência"
                value={3}
                suffix="%"
                delay={70}
                icon="📉"
                color="#f59e0b"
              />
              <MetricCard
                title="Matrículas Ativas"
                value={1782}
                delay={80}
                icon="✅"
                color="#3b82f6"
              />
            </div>

            {/* Chart section */}
            <Sequence from={90} layout="none">
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  borderRadius: 16,
                  padding: 24,
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: "white",
                    fontFamily: "system-ui, sans-serif",
                    marginBottom: 24,
                  }}
                >
                  Matrículas por Mês
                </div>
                <AnimatedChart
                  data={chartData}
                  delay={100}
                  width={1000}
                  height={180}
                  color="#9333EA"
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 12,
                    padding: "0 10px",
                  }}
                >
                  {["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"].map(
                    (month) => (
                      <span
                        key={month}
                        style={{
                          fontSize: 12,
                          color: "rgba(255, 255, 255, 0.5)",
                          fontFamily: "system-ui, sans-serif",
                        }}
                      >
                        {month}
                      </span>
                    )
                  )}
                </div>
              </div>
            </Sequence>
          </div>
        </div>
      </FloatingCard>
    </AbsoluteFill>
  );
};
