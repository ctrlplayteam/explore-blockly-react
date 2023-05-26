import { useCallback, useEffect, useRef, useState } from "react";
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
import { replaceMoves } from "../../../utils/replaceMoves";
import { BlocklyWorkspace } from "react-blockly";
import { javascriptGenerator } from "blockly/javascript";

type body = PosComp | BodyComp | AreaComp;
type player = GameObj<body | SpriteComp | StateComp>;

export const ToSpaceship = () => {
  const [player, setPlayer] = useState<player>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stepsCountRef = useRef<number>(1);
  const [code, setCode] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [shouldRestart, setShouldRestart] = useState(false);
  const [level, setLevel] = useState(0);
  const [isLoadingWorkspace] = useState(true);

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
        background: [100, 100, 100],
      });

      loadSprite("spaceship", spaceshipSprite);
      loadSpriteAtlas(astronaut, {
        astronaut: {
          height: 794,
          width: 963,
          x: 0,
          y: 140,
          sliceX: 9,
          sliceY: 6,
          anims: {
            move: {
              from: 0,
              to: 7,
              loop: true,
            },
            idle: 8,
            jump: 4,
          },
        },
      });
      const level1 = [
        "                     ",
        "                     ",
        "A                    ",
        "                    ^",
        "=====================",
      ];
      const level2 = [
        "                     ",
        "                     ",
        "A                    ",
        "                    ^",
        "=======  =============",
      ];
      const levels = [level1, level2];
      scene("game", ({ level } = { level: 0 }) => {
        gravity(2400);
        setLevel(level);
        setShouldRestart(false);

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
      scene("lose", () => {
        setShouldRestart(true);
        add([text("Deu ruim"), pos(12)]);
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
        player.move(width() * 0.3, 0);
        stepsCountRef.current += 1;
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
      player.onUpdate(() => {
        if (player.pos.y >= 480) {
          go("lose");
        }
      });
      player.onCollide("spaceship", () => {
        setShowModal(true);
        go("success");
        resetGame();
      });
    }
  }, [player, resetGame]);

  const generateCode = () => {
    const runnableCode = replaceMoves(code);
    evaluateAsyncCode(runnableCode);
  };

  return (
    <>
      <Wrapper
        left={<canvas ref={canvasRef} className="w-[512px] h-[256px]" />}
        right={
          <div className="w-full">
            <p className={isLoadingWorkspace ? "block" : "hidden"}>LOADING</p>
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
              onXmlChange={(e) => console.log(e)}
            />
          </div>
        }
      />
      <button
        onClick={shouldRestart ? resetGame : generateCode}
        className="w-10 h-10 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 dark:bg-blue-400 dark:hover:bg-blue-300 dark:active:bg-blue-200 flex items-center justify-center rounded-full p-2 text-3xl text-white transition duration-200 hover:cursor-pointer dark:text-white"
      >
        {!shouldRestart ? "‣" : "⟳"}
      </button>
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
