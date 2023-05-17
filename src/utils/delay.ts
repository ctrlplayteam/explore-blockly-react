export const delay = (time = 1.8) =>
  new Promise((resolve) => setTimeout(resolve, time * 1000));
