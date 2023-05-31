import { useCallback, useEffect, useRef, useState } from "react";
import astronaut from "../../../assets/sprites/blockly-game-character.png";
import spaceshipSprite from "../../../assets/sprites/spaceship-sprite.png";
import {
  GameObj,
  PosComp,
  BodyComp,
  AreaComp,
  SpriteComp,
  StateComp,
  OriginComp,
  ScaleComp,
  SolidComp,
} from "../../../../node_modules/kaboom/";
import kaboom from "../../../kaboom";
import { delay } from "../../../utils/delay";
import { replaceMoves } from "../../../utils/replaceMoves";
import { BlocklyWorkspace } from "react-blockly";
import { Wrapper } from "../../game/Wrapper";
import { javascriptGenerator } from "blockly/javascript";

type body = PosComp | AreaComp;

type player = GameObj<
  | body
  | SpriteComp
  | StateComp
  | {
      id: string;
      require: string[];
      update(): void;
      isSmall(): boolean;
      smallify(time?: number): void;
      biggify(): void;
    }
  | SolidComp
  | ScaleComp
  | OriginComp
>;

export const ToSpaceship = () => {
  const [player, setPlayer] = useState<player>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stepsCountRef = useRef<number>(1);
  const positionYRef = useRef<number>(1);
  const [code, setCode] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [angle, setAngle] = useState<number>(0);
  const [shouldRestart, setShouldRestart] = useState(false);
  const [level, setLevel] = useState(0);
  // const [isLoadingWorkspace] = useState(true);

  // custom component that makes stuff grow big
  function big() {
    let timer = 0;
    let isSmall = false;
    let destScale = 1;
    return {
      // component id / name
      id: "big",
      // it requires the scale component
      require: ["scale"],
      // this runs every frame
      update() {
        if (isSmall) {
          timer -= dt();
          if (timer <= 0) {
            this.biggify();
          }
        }
        (this as any).scale = (this as any).scale.lerp(
          vec2(destScale),
          dt() * 6
        );
      },
      // custom methods
      isSmall() {
        return isSmall;
      },
      smallify(time = 5) {
        destScale = 0.1;
        timer = time;
        isSmall = false;
      },
      biggify() {
        destScale = 1;
        timer = 0;
        isSmall = true;
      },
    };
  }

  const resetGame = useCallback(() => {
    stepsCountRef.current = 1;
    go("game", {
      level,
    });
  }, [level]);

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
        scale: 2,
      });

      loadSprite("spaceship", spaceshipSprite);
      loadSpriteAtlas(astronaut, {
        astronaut: {
          height: 48,
          width: 48 * 21,
          x: 0,
          y: 0,
          sliceX: 21,
          anims: {
            idle: 0,
            jump: 4,
          },
        },
      });
      scene("game", ({ level } = { level: 0 }) => {
        setLevel(level);
        setShouldRestart(false);
        addLevel(["===================m", "ffffffffffffffffffff"], {
          width: 24,
          height: 24,
          "=": () => [rect(24, 24), outline(1), "floor"],
          m: () => [
            rect(24, 24),
            outline(1),
            "floor",
            k.color(255, 0, 0),
            k.origin("topleft"),
          ],
          f: () => [rect(24, 24), "out", solid(), area(), "enemy"],
        });
        const map = ["A            "];
        addLevel(map, {
          height: 48,
          width: 48,
          pos: vec2(0, 0),
          A: () => [
            solid(),
            area(),
            big(),
            scale(),
            pos(48 * 0 + 8, 0),
            k.origin("center"),
            sprite("astronaut"),
            state("idle", [
              "idle",
              "forward",
              "backwards",
              "down",
              "up",
              "die",
            ]),
            "player",
          ],

          // "^": () => [
          //   sprite("spaceship"),
          //   k.origin("botright"),
          //   body(),
          //   area(),
          //   "spaceship",
          // ],
        });
        const player = get("player")[0];
        setPlayer(player as player);
      });
      scene("success", () => {
        add([text("You win"), pos(12)]);
      });
      scene("lose", () => {
        setShouldRestart(true);
        add([text("Deu ruim"), pos(12)]);
      });
      go("game");
    }
  }, []);

  useEffect(() => {
    if (player) {
      player.onStateUpdate("idle", async () => {
        player.play("idle");
      });
      player.onStateUpdate("jump", () => {
        player.move(width() * 0.3, 0);
      });
      player.onStateEnter("right", () => {
        if (!player.exists()) return;
      });
      player.onStateUpdate("backwards", () => {
        if (!player.exists()) return;
        player.flipX(true);
        const target = (stepsCountRef.current - 2) * 48 + 8;
        if (player.pos.x <= target) {
          stepsCountRef.current -= 1;
          player.moveTo(target, player.pos.y);
          return player.enterState("idle");
        }
        const dir = add([pos(target, player.pos.y)])
          .pos.sub(player.pos)
          .unit();
        player.move(dir.scale(200));
      });
      player.onStateUpdate("forward", () => {
        if (!player.exists()) return;
        player.flipX(false);
        const target = stepsCountRef.current * 48 + 8;
        if (player.pos.x >= target) {
          stepsCountRef.current += 1;
          player.moveTo(target, player.pos.y);
          return player.enterState("idle");
        }
        const dir = add([pos(target, player.pos.y)])
          .pos.sub(player.pos)
          .unit();
        player.move(dir.scale(200));
      });
      player.onStateUpdate("up", () => {
        if (!player.exists()) return;
        player.flipX(false);
        const target = (positionYRef.current - 2) * 48;
        if (player.pos.y <= target) {
          positionYRef.current -= 1;
          player.moveTo(player.pos.x, target);
          return player.enterState("idle");
        }
        const dir = add([pos(player.pos.x, target)])
          .pos.sub(player.pos)
          .unit();
        player.move(dir.scale(200));
      });
      player.onStateUpdate("down", () => {
        if (!player.exists()) return;
        player.flipX(false);
        const target = positionYRef.current * 48;
        if (player.pos.y >= target) {
          positionYRef.current += 1;
          player.moveTo(player.pos.x, target);
          return player.enterState("idle");
        }
        const dir = add([pos(player.pos.x, target)])
          .pos.sub(player.pos)
          .unit();
        player.move(dir.scale(200));
      });
      player.onStateUpdate("die", () => {
        player.smallify(40);
        if (typeof player.scale !== "number") {
          if (player.scale.x <= 0.15) {
            go("lose");
          }
        }
      });
      player.onCollide("enemy", (_obj, col) => {
        const target = player.pos.y + 24 + 8;
        if (col?.isBottom()) {
          player?.moveTo(player.pos.x, target);
          player.enterState("die");
        }
      });
    }
  }, [player, resetGame]);

  const generateCode = () => {
    const runnableCode = replaceMoves(code);
    evaluateAsyncCode(runnableCode);
  };

  const handleMoviment = () => {
    if (angle === 0) {
      player?.enterState("forward");
    } else if (angle === 90) {
      player?.enterState("up");
    } else if (angle === 180) {
      player?.enterState("backwards");
    } else if (angle === 270) {
      player?.enterState("down");
    } else {
      alert("aaaaaaaaaaaa");
    }
  };

  return (
    <>
      <Wrapper
        left={<canvas ref={canvasRef} className="w-[720px]" />}
        right={
          <div className="w-full">
            <BlocklyWorkspace
              className="w-full h-96"
              workspaceConfiguration={{
                renderer: "zelos",

                theme: {
                  name: ``,
                  blockStyles: {
                    move_blocks: {
                      hat: "#000",
                      colourPrimary: "#FD0F8F",
                      colourSecondary: "#ddd",
                      colourTertiary: "#eee",
                    },
                    logic_blocks: {
                      hat: "#000",
                      colourPrimary: "#FFF",
                      colourSecondary: "#ddd",
                      colourTertiary: "#eee",
                    },
                    math_blocks: {
                      hat: "",
                      colourPrimary: "#26C5F3",
                      colourSecondary: "#ddd",
                      colourTertiary: "#eee",
                    },
                  },
                  categoryStyles: {
                    logic_category: {
                      colour: "#FD8F8F",
                    },
                  },
                  fontStyle: {
                    family: "Courier New, serif",
                    weight: "bold",
                    size: 12,
                  },
                  componentStyles: {
                    workspaceBackgroundColour: "#fafafa",
                    toolboxBackgroundColour: "#eee",
                  },
                },
              }}
              initialJson={{
                blocks: {
                  languageVersion: 0,
                  blocks: [
                    {
                      type: "move",
                      id: "Rd`SA@JPC=lcK-mf{aPN",
                      x: 26,
                      y: 55,
                      fields: {
                        NAME: "caminhar",
                      },
                    },
                  ],
                },
              }}
              toolboxConfiguration={{
                kind: "categoryToolbox",
                contents: [
                  {
                    kind: "category",
                    name: "Control",
                    categorystyle: "control_blocks",
                    cssconfig: {
                      container: "yourClassName control",
                      row: "newRowClass",
                      icon: "newIconClass",
                      label: "newLabelClass",
                    },
                    contents: [
                      {
                        kind: "block",
                        type: "move",
                      },
                      {
                        kind: "block",
                        type: "jump",
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
                    cssconfig: {
                      container: "yourClassName math",
                      row: "newRowClass",
                      icon: "newIconClass",
                      label: "newLabelClass",
                    },
                    contents: [
                      {
                        kind: "block",
                        type: "math_number",
                      },
                    ],
                  },
                  {
                    kind: "category",
                    cssconfig: {
                      container: "yourClassName logic",
                      row: "newRowClass",
                      icon: "newIconClass",
                      label: "newLabelClass",
                    },

                    name: "Logic",
                    colour: "#FD8F8F",
                    contents: [
                      {
                        kind: "block",
                        type: "controls_if",
                      },
                      {
                        kind: "block",
                        type: "logic_compare",
                      },
                    ],
                  },
                ],
              }}
              onWorkspaceChange={(workspace) => {
                const code = javascriptGenerator.workspaceToCode(workspace);
                setCode(code);
              }}
            />
          </div>
        }
      />
      <button
        className="my-5 bg-blue-700 p-5"
        onClick={() => {
          setAngle((prev) => ((prev / 90 + 1) % 4) * 90);
        }}
      >
        {angle}
      </button>
      <div className="flex gap-5">
        <button onClick={() => player?.enterState("forward")}>Frente</button>
        <button onClick={() => player?.enterState("backwards")}>Traz</button>
        <button onClick={() => player?.enterState("down")}>Baixo</button>
        <button onClick={() => player?.enterState("up")}>Cima</button>
        <button onClick={handleMoviment}>Mover-se</button>
      </div>
      {/* <button
        onClick={shouldRestart ? resetGame : generateCode}
        className="w-10 h-10 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 dark:bg-blue-400 dark:hover:bg-blue-300 dark:active:bg-blue-200 flex items-center justify-center rounded-full p-2 text-3xl text-white transition duration-200 hover:cursor-pointer dark:text-white"
      >
        {!shouldRestart ? "‣" : "⟳"}
      </button> */}
      <pre>{code ?? ""}</pre>
      {showModal && (
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
                  <pre>{code}</pre>
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
                    onClick={async () => {
                      // await saveWorkspace(level);
                      go("game", { level: (level + 1) % 2 });
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
      )}
    </>
  );
};
