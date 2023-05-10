import { useEffect, useRef, useState } from "react";
import kaboom from "kaboom";
import astronaut from "./assets/sprites/sprit-astronauta.png";
import { Board } from "./components/common/Board";

function App() {
  const canvasRef = useRef(null);
  const [player, setPlayer] = useState();
  const [utils, setUtils] = useState();
  useEffect(() => {
    const k = kaboom({
      // if you don't want to import to the global namespace
      global: false,
      // if you don't want kaboom to create a canvas and insert under document.body
      canvas: canvasRef.current,
      background: [0, 0, 0],
      fullScreen: true,
    });
    // k.setGravity(1600);
    setUtils(k);
    // k.loadRoot("./assets/sprites");
    k.loadSpriteAtlas(astronaut, {
      astronaut: {
        x: 0,
        y: 0,
        width: 1365,
        height: 299,
        sliceX: 6,
        anims: {
          idle: 0,
          walk: {
            from: 0,
            to: 5,
            speed: 8,
          },
        },
      },
    });
    k.add([
      k.rect(k.width(), 480),

      k.outline(4),
      k.area(),
      k.pos(0, 680),
      // Give objects a body() component if you don't want other solid objects pass through
      k.solid(),
    ]);
    setPlayer(
      k.add([
        // List of components, each offers a set of functionalities
        k.fixed(),
        k.sprite("astronaut"),
        k.state("idle", ["idle", "walk"]),
        k.move(0, 0),
        k.pos(200, 0),
        k.area(),
        k.body(),
        k.health(8),
        {
          dir: k.RIGHT,
          dead: false,
          speed: 36,
        },
      ])
    );
    return () => {
      setPlayer(null);
    };
    // write all your kaboom code here
  }, []);

  useEffect(() => {
    if (player) {
      player.onStateEnter("walk", () => {
        console.log("AAAAAAAA");
        // enter "idle" state when the attack animation ends
        player.play("walk", {
          // any additional arguments will be passed into the onStateEnter() callback
          onEnd: () => {
            player.move();
            console.log("AAAAa");
          },
        });
      });
    }
  }, []);

  return (
    <>
      {/* <Board background="https://img.freepik.com/premium-vector/space-background_22191-32.jpg" /> */}
      <canvas className="h-[700px]" ref={canvasRef} />
      <button
        onClick={() => {
          player.follow(utils.vec2(100, 80));
        }}
      >
        walk
      </button>
    </>
  );
}

export default App;
