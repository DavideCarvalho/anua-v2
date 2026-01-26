import { Composition } from "remotion";
import { AnuaDemo } from "./AnuaDemo";

// 75 seconds at 30fps = 2250 frames
const FPS = 30;
const DURATION_SECONDS = 75;

export const RemotionRoot = () => {
  return (
    <Composition
      id="AnuaDemo"
      component={AnuaDemo}
      durationInFrames={DURATION_SECONDS * FPS}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};
