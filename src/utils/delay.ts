export const delay = (time = 1.5) =>
  new Promise((resolve) => setTimeout(resolve, time * 1000));
