export const moveset = {
  "move();": `
    player.enterState("move");
    await delay();
  `,
  "jump();": `
    player?.enterState("jump");
    await delay(1);
  `,
};
