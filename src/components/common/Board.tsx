import React, { useEffect, useRef, useState } from "react";
import { Character } from "./Character";
import astronaut from "../../assets/sprites/sprit-astronauta.png";
import spaceship from "../../assets/sprites/spaceship-sprite.png";

interface Props {
  background: string;
}

const moviments = {
  "walk();": `if (!isMoving) {
    setStepLimit(left + 300);
    setIsMoving(true);
    setTimer(
      setInterval(() => {
        setLeft((prev) => prev + 8);
      }, 80)
    );
  }`,
  "jump();": `if (!isMoving) {
    setIsMoving(true);

    let count = 0;
    const timer = setInterval(() => {
      console.log(count);

      setLeft((prev) => prev + 8);
      setBottom(Math.sin(count) * 200);
      count++;
    }, 100);
    setTimer(timer);
  }`,
};

export const Board: React.FC<Props> = ({ background }) => {
  const [isMoving, setIsMoving] = useState(false);
  const [timer, setTimer] = useState<number>(NaN);
  const [left, setLeft] = useState(0);
  const [bottom, setBottom] = useState(0);
  const characterRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const [stepLimit, setStepLimit] = useState<number>(NaN);
  const [crahsed, setCrahsed] = useState(false);
  const [code, setCode] = useState<string>("");

  useEffect(() => {
    if (bottom < 0 && isMoving) {
      clearInterval(timer);
      setIsMoving(false);
      setBottom(0);
    }
  }, [bottom, isMoving, timer]);

  useEffect(() => {
    if (left >= stepLimit || crahsed) {
      clearInterval(timer);
      setIsMoving(false);
      setStepLimit(left + 300);
    }
  }, [crahsed, left, stepLimit, timer]);

  useEffect(() => {
    const resetGame = () => {
      setLeft(0);
      setCrahsed(false);
      setIsMoving(false);
      clearInterval(timer);
      setStepLimit(NaN);
    };
    const target = targetRef.current;
    const character = characterRef.current;
    if (target && character) {
      const chacracterPosX = character.getBoundingClientRect().x || 0;
      const targetPosX = target.getBoundingClientRect().x || 0;
      const chacracterSize = character.getBoundingClientRect().width || 0;

      if (chacracterPosX + chacracterSize >= targetPosX) {
        setCrahsed(true);
        alert("Chegou");
        resetGame();
      }
    }
  }, [isMoving, left, timer]);

  const walk = () => {
    setCode((prev) => prev.concat("walk();\n"));
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
  const jump = () => {
    setCode((prev) => prev.concat("jump();\n"));
    if (!isMoving) {
      setIsMoving(true);

      let count = 0;
      const timer = setInterval(() => {
        console.log(count);

        setLeft((prev) => prev + 8);
        setBottom(Math.sin(count) * 200);
        count++;
      }, 100);
      setTimer(timer);
    }
  };

  const walkJumpTest = async () => {
    if (!isMoving) {
      setStepLimit(left + 300);
      setIsMoving(true);
      setTimer(
        setInterval(() => {
          setLeft((prev) => prev + 8);
        }, 80)
      );
    }

    await sleep();
    console.log("sleep");
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

  const sleep = (ms?: number) =>
    new Promise((resolve) => setTimeout(resolve, ms || 1000));

  const run = () => {
    const runableCode = code
      .replace(/walk\(\)/gi, moviments["walk();"])
      .replace(/jump\(\)/gi, moviments["jump();"]);
    console.log(runableCode);
    eval(runableCode);
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
          position={{ left, bottom }}
          steps={6}
        />
        <div
          ref={targetRef}
          className="absolute bottom-0 right-1 border border-red-500"
        >
          <img src={spaceship} alt="" />
        </div>
      </div>
      <div>
        <button onClick={walk}>Andar</button>
        <button onClick={jump}>Pular</button>
        <button onClick={run}>Rodar</button>
        <div className="bg-gray-300">{code}</div>
      </div>
    </div>
  );
};
