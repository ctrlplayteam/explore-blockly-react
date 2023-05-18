import React from "react";

interface Props {
  left: React.ReactNode;
  right: React.ReactNode;
}
export const Wrapper: React.FC<Props> = ({ left, right }) => {
  return (
    <div className="flex gap-4 w-full items-start">
      {left}
      {right}
    </div>
  );
};
