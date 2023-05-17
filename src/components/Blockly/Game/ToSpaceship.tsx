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
import BlocklyComponent from "../BlocklyComponent";
import { Block, Field, Shadow, Value } from "../blocks";
import { usePlayer } from "../../../data/hooks/usePlayer";
import { delay } from "../../../utils/delay";

type body = PosComp | BodyComp | AreaComp;
type player = GameObj<body | SpriteComp | StateComp>;

export const ToSpaceship = () => {
  const [player, setPlayer] = useState<player>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { player: code, createPlayer } = usePlayer();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stepsCountRef = useRef<number>(1);
  const [mode, setMode] = useState<"running" | "stop">("stop");

  const resetGame = useCallback(() => {
    createPlayer(undefined);
    setMode("stop");
    stepsCountRef.current = 1;
  }, [createPlayer]);

  const evaluateAsyncCode = (code: string) => {
    return new Promise(() => {
      // Create an async function from the code string

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
    if (code && mode === "running") {
      try {
        evaluateAsyncCode(code).catch((err) => console.error(err));
      } catch (error) {
        console.error(error);
      }
    }
    if (code && mode === "stop") {
      setMode("running");
    }
  }, [code, mode]);

  // function replaceMoves(code: string) {
  //   for (const move in moveset) {
  //     const regex = new RegExp(move.replace(/\(\)/g, "\\(\\)"), "g");

  //     code = code.replace(regex, moveset[move as keyof typeof moveset]);
  //   }
  //   return code;
  // }
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
      const map = [
        "A                    ",
        "                    ^",
        "=====================",
      ];
      scene("game", () => {
        gravity(2400);
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
      // add([
      //   rect(width(), 48),
      //   outline(4),
      //   area(),
      //   pos(0, height() - 48),
      //   solid(),
      //   color(0, 0, 0),
      // ]);
      // //spaceship;
      // add([
      //   sprite("spaceship"),
      //   pos(width() - 164, height() - 241),
      //   body(),
      //   area(),
      //   "spaceship",
      // ]);
      // const player = add([
      //   pos(0, 500 - 299),
      //   body(),
      //   area(),
      //   sprite("astronaut"),
      //   state("idle", ["idle", "move", "jump"]),
      // ]);
      // setPlayer(player);
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
        go("success");
        setTimeout(() => {
          go("game");
        }, 1000);
        setMode("stop");
      });
    }
  }, [player, resetGame]);

  return (
    <>
      <canvas ref={canvasRef} className="w-[500px] h-[300px]" />
      {/* <button onC >PARA</button> */}
      <BlocklyComponent
        readOnly={false}
        trashcan={true}
        media={"media/"}
        move={{
          scrollbars: true,
          drag: true,
          wheel: true,
        }}
        initialXml={`
<xml xmlns="http://www.w3.org/1999/xhtml">
<block type="controls_ifelse" x="0" y="0"></block>
</xml>
      `}
      >
        <Block type="move" />
        <Block type="controls_ifelse" />
        <Block type="logic_compare" />
        <Block type="logic_operation" />
        <Block type="controls_repeat_ext">
          <Value name="TIMES">
            <Shadow type="math_number">
              <Field name="NUM">10</Field>
            </Shadow>
          </Value>
        </Block>
        <Block type="logic_operation" />
        <Block type="logic_negate" />
        <Block type="logic_boolean" />
        <Block type="logic_null" disabled="true" />
        <Block type="logic_ternary" />
        <Block type="text_charAt">
          <Value name="VALUE">
            <Block type="variables_get">
              <Field name="VAR">text</Field>
            </Block>
          </Value>
        </Block>
      </BlocklyComponent>
    </>
  );
};
