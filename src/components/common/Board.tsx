import React, { useEffect, useRef, useState } from "react";
import { Character } from "./Character";
import astronaut from "../../assets/sprites/sprit-astronauta.png";
import spaceship from "../../assets/sprites/spaceship-sprite.png";

interface Props {
  background: string;
}

export const Board: React.FC<Props> = ({ background }) => {
  const [isMoving, setIsMoving] = useState(false);
  const [timer, setTimer] = useState<number>(NaN);
  const [left, setLeft] = useState(0);
  const characterRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const [stepLimit, setStepLimit] = useState<number>(NaN);
  const [crahsed, setCrahsed] = useState(false);

  const resetGame = () => {
    setLeft(0);
    setCrahsed(false);
    setStepLimit(NaN);
  };

  useEffect(() => {
    if (left >= stepLimit || crahsed) {
      clearInterval(timer);
      setIsMoving(false);
    }
  }, [crahsed, left, stepLimit, timer]);

  useEffect(() => {
    const target = targetRef.current;
    const character = characterRef.current;
    if (target && character) {
      const chacracterPosX = character.getBoundingClientRect().x || 0;
      const targetPosX = target.getBoundingClientRect().x || 0;
      const chacracterSize = character.getBoundingClientRect().width || 0;

      if (chacracterPosX + chacracterSize >= targetPosX) {
        setCrahsed(true);
        resetGame();
      }
    }
  }, [isMoving, left]);

  const walk = () => {
    if (!isMoving) {
      setStepLimit(left + 300);
      setIsMoving(true);
      setTimer(
        setInterval(() => {
          setLeft((prev) => prev + 8);
        }, 80)
      );
    }
  };

  return (
    <div className="flex gap-2 items-start">
      <div
        className="relative border border-black w-[970px] h-[500px] overflow-hidden"
        style={{
          backgroundImage: `url(${background})`,
          backgroundSize: "cover",
        }}
      >
        <Character
          ref={characterRef}
          isMoving={isMoving}
          src={astronaut}
          size={{
            height: 299,
            width: 1365,
          }}
          position={{ left }}
          steps={6}
        />
        <div
          ref={targetRef}
          className="absolute bottom-0 right-1 border border-red-500"
        >
          <img src={spaceship} alt="" />
        </div>
      </div>
      <button onClick={walk}>Andar</button>
    </div>
  );
};
