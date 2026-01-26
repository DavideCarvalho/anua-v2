import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { HookScene } from "./scenes/HookScene";
import { ProblemScene } from "./scenes/ProblemScene";
import { TransitionScene } from "./scenes/TransitionScene";
import { DashboardScene } from "./scenes/DashboardScene";
import { AIInsightsScene } from "./scenes/AIInsightsScene";
import { CTAScene } from "./scenes/CTAScene";
import { Background } from "./components/Background";

export const AnuaDemo = () => {
  const { fps } = useVideoConfig();

  // Timeline (in seconds, converted to frames)
  const HOOK_START = 0;
  const HOOK_DURATION = 5 * fps;

  const PROBLEM_START = 5 * fps;
  const PROBLEM_DURATION = 15 * fps;

  const TRANSITION_START = 20 * fps;
  const TRANSITION_DURATION = 5 * fps;

  const DASHBOARD_START = 25 * fps;
  const DASHBOARD_DURATION = 25 * fps;

  const AI_START = 50 * fps;
  const AI_DURATION = 15 * fps;

  const CTA_START = 65 * fps;
  const CTA_DURATION = 10 * fps;

  return (
    <AbsoluteFill>
      <Background />

      <Sequence from={HOOK_START} durationInFrames={HOOK_DURATION} premountFor={fps}>
        <HookScene />
      </Sequence>

      <Sequence from={PROBLEM_START} durationInFrames={PROBLEM_DURATION} premountFor={fps}>
        <ProblemScene />
      </Sequence>

      <Sequence from={TRANSITION_START} durationInFrames={TRANSITION_DURATION} premountFor={fps}>
        <TransitionScene />
      </Sequence>

      <Sequence from={DASHBOARD_START} durationInFrames={DASHBOARD_DURATION} premountFor={fps}>
        <DashboardScene />
      </Sequence>

      <Sequence from={AI_START} durationInFrames={AI_DURATION} premountFor={fps}>
        <AIInsightsScene />
      </Sequence>

      <Sequence from={CTA_START} durationInFrames={CTA_DURATION} premountFor={fps}>
        <CTAScene />
      </Sequence>
    </AbsoluteFill>
  );
};
