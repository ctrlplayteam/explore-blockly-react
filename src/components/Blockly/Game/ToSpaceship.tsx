import React, { useCallback, useEffect, useRef, useState } from "react";
import astronaut from "../../../assets/sprites/sprit-astronauta.png";
import spaceshipSprite from "../../../assets/sprites/spaceship-sprite.png";
import {
  GameObj,
  PosComp,
  BodyComp,
  AreaComp,
  SpriteComp,
  StateComp,
} from "../../../../node_modules/kaboom/";
import kaboom from "../../../kaboom";

type body = PosComp | BodyComp | AreaComp;
type player = GameObj<body | SpriteComp | StateComp>;
type spaceship = GameObj<body>;

const moveset = {
  "move();": `player?.enterState("move");
    await wait(1.5);`,
  "jump();": `player?.enterState("jump");
    await wait(1);`,
};

export const ToSpaceship = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [player, setPlayer] = useState<player>();
  const [spaceShip, setSpaceShip] = useState<spaceship>();
  const stepsCountRef = useRef<number>(1);
  const [actions, setActions] = useState<string>("");

  const resetGame = useCallback(() => {
    player?.moveTo(0, 40);
    player?.enterState("idle");
    stepsCountRef.current = 1;
  }, [player]);

  function replaceMoves(code: string) {
    for (const move in moveset) {
      const regex = new RegExp(move.replace(/\(\)/g, "\\(\\)"), "g");

      code = code.replace(regex, moveset[move as keyof typeof moveset]);
    }
    return code;
  }
  useEffect(() => {
    if (canvasRef.current) {
      kaboom({
        canvas: canvasRef.current,
        background: [100, 100, 100],
      });
      loadSprite("spaceship", spaceshipSprite);
      loadSpriteAtlas(astronaut, {
        astronaut: {
          height: 299,
          width: 1365,
          x: 0,
          y: 0,
          sliceX: 6,
          anims: {
            move: {
              from: 0,
              to: 5,
              loop: true,
            },
            idle: 0,
            jump: 4,
          },
        },
      });

      add([
        rect(width(), 48),
        outline(4),
        area(),
        pos(0, height() - 48),
        solid(),
        color(0, 0, 0),
      ]);
      const spaceship = add([
        sprite("spaceship"),
        pos(width() - 164, height() - 241),
        body(),
        area(),
        "spaceship",
      ]);
      setSpaceShip(spaceship);
      const player = add([
        pos(0, 500 - 299),
        body(),
        area(),
        sprite("astronaut"),
        state("idle", ["idle", "move", "jump"]),
      ]);
      setPlayer(player);
    }
  }, []);

  useEffect(() => {
    if (player) {
      player.onStateEnter("move", async () => {
        player.play("move");
      });
      player.onStateEnter("idle", async () => {
        player.play("idle");
      });
      player.onStateEnter("jump", () => {
        player.play("jump");
        player.jump();
      });
      player.onStateUpdate("jump", () => {
        if (player.isGrounded()) {
          return player.enterState("idle");
        }
        player.move(125, 0);
      });
      player.onStateUpdate("move", async () => {
        if (!player.exists()) return;
        const target = stepsCountRef.current * 250;
        if (player.pos.x >= target) {
          stepsCountRef.current += 1;
          return player.enterState("idle");
        }

        const dir = add([pos(target, player.pos.y)])
          .pos.sub(player.pos)
          .unit();
        player.move(dir.scale(200));
      });
      player.onCollide("spaceship", () => {
        resetGame();
      });
    }

    // return () => {
    //   setPlayer(undefined);
    // };
  }, [player, resetGame]);

  return (
    <>
      <canvas ref={canvasRef} className="h-[500px]" />
      <div className="flex gap-4 my-4">
        <button
          disabled={player?.state !== "idle"}
          className="bg-green-500"
          onClick={async () => {
            setActions((prev) => prev.concat("move();"));
          }}
        >
          Andar
        </button>
        <button
          disabled={player?.state !== "idle"}
          className="bg-red-500"
          onClick={() => {
            setActions((prev) => prev.concat("jump();"));
          }}
        >
          Pular
        </button>
        <button
          disabled={player?.state !== "idle"}
          className="bg-red-500"
          onClick={() => {
            const runnableCode = replaceMoves(actions);

            eval(`(async () => {
                ${runnableCode}
              })()`);
          }}
        >
          Rodar
        </button>
      </div>
      <div>
        <p>{actions}</p>
      </div>
    </>
  );
};
