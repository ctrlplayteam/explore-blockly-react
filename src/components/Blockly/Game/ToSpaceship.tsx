import { useEffect, useRef, useState } from "react";
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
import { delay } from "../../../utils/delay";
import { Wrapper } from "../../game/Wrapper";
import useBlockly from "../hooks/useBlckly";
import { replaceMoves } from "../../../utils/replaceMoves";

type body = PosComp | BodyComp | AreaComp;
type player = GameObj<body | SpriteComp | StateComp>;

export const ToSpaceship = () => {
  const [player, setPlayer] = useState<player>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stepsCountRef = useRef<number>(1);
  const [code, setCode] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const { BlocklyComponent, generate } = useBlockly({
    initialBlock: {
      kind: "move",
      x: 10,
      y: 10,
    },
    toolbox: {
      kind: "categoryToolbox",
      contents: [
        {
          kind: "category",
          name: "Control",
          contents: [
            {
              kind: "block",
              type: "move",
            },
            {
              kind: "block",
              type: "controls_if",
            },
            {
              kind: "block",
              type: "controls_repeat_ext",
            },
          ],
        },
        {
          kind: "category",
          name: "Matemática",
          contents: [
            {
              kind: "block",
              type: "math_number",
            },
          ],
        },
        {
          kind: "category",
          name: "Logic",
          contents: [
            {
              kind: "block",
              type: "logic_compare",
            },
            {
              kind: "block",
              type: "logic_operation",
            },
            {
              kind: "block",
              type: "logic_boolean",
            },
          ],
        },
      ],
    },
  });

  const resetGame = () => {
    stepsCountRef.current = 1;
  };

  const evaluateAsyncCode = (code: string) => {
    return new Promise(() => {
      const asyncFunction = new Function(
        "player",
        "delay",
        `(async ()=> {
        ${code}
      })()`
      );

      asyncFunction(player, delay);
    });
  };

  useEffect(() => {
    if (canvasRef.current) {
      const k = kaboom({
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
      const level1 = [
        "A                    ",
        "                    ^",
        "=====================",
      ];
      const level2 = [
        "A                    ",
        "                    ^",
        "====           ======",
      ];
      const levels = [level1, level2];
      scene("game", ({ level } = { level: 1 }) => {
        gravity(2400);
        const map = levels[level];
        addLevel(map, {
          height: 64,
          width: 64,
          pos: vec2(0, height() - 64 * map.length),
          "=": () => [rect(64, 64), outline(4), area(), solid()],
          A: () => [
            k.origin("botleft"),
            body(),
            area(),
            sprite("astronaut"),
            state("idle", ["idle", "move", "jump"]),
            "player",
          ],
          "^": () => [
            sprite("spaceship"),
            k.origin("botright"),
            body(),
            area(),
            "spaceship",
          ],
        });
        const player = get("player")[0];
        setPlayer(player as player);
      });
      scene("success", () => {
        add([text("You win"), pos(12)]);
      });
      go("game");
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
        const target = stepsCountRef.current * width() * 0.25;
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
        setShowModal(true);
        go("success");
        resetGame();
      });
    }
  }, [player]);

  const generateCode = () => {
    const code = generate();
    const runnableCode = replaceMoves(code);
    evaluateAsyncCode(runnableCode);
    setCode(code);
  };

  return (
    <>
      <Wrapper
        left={<canvas ref={canvasRef} className="w-[25vw] h-[15vw]" />}
        right={<BlocklyComponent />}
      />
      <button onClick={generateCode}>Run</button>
      {showModal ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-[999] outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto max-w-3xl">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                {/*header*/}
                <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
                  <h3 className="text-3xl font-semibold">Tu é o xempion</h3>
                  <button
                    className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                    onClick={() => setShowModal(false)}
                  >
                    <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                      ×
                    </span>
                  </button>
                </div>
                {/*body*/}
                <div className="relative p-6 flex-auto">
                  <p className="my-4 text-slate-500 text-lg leading-relaxed">
                    <pre>{code}</pre>
                  </p>
                </div>
                {/*footer*/}
                <div className="flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b">
                  <button
                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                  <button
                    className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => {
                      go("game", { level: 1 });
                      setShowModal(false);
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}
    </>
  );
};
