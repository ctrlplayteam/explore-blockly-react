export const moveset = {
  "move();": `
    player.enterState("move");
    await delay();
  `,
  "jump();": `
  if(mode === "running"){
    player?.enterState("jump");
    await delay(1);
  }
  `,
};
