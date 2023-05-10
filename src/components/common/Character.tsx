import { forwardRef } from "react";

interface Props {
  size: {
    width: number;
    height: number;
  };
  isMoving?: boolean;
  src: string;
  steps: number;
  position: {
    left: number;
    bottom: number;
  };
}

export const Character = forwardRef<HTMLDivElement, Props>(
  ({ size, src, steps, isMoving, position }, ref) => {
    const { height, width } = size;
    const { left, bottom } = position;

    return (
      <div
        ref={ref}
        className={`right-1 border border-red-500 ${
          isMoving ? "animate-[walk_1s_infinite_steps(6)]" : ""
        }  absolute`}
        style={{
          backgroundImage: `url(${src})`,
          height,
          width: width / (steps + 1),
          left,
          bottom,
        }}
      />
    );
  }
);
