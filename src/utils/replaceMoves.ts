import { moveset } from "../movesets/movesets";

export function replaceMoves(code: string) {
  for (const move in moveset) {
    const regex = new RegExp(move.replace(/\(\)/g, "\\(\\)"), "g");

    code = code.replace(regex, moveset[move as keyof typeof moveset]);
  }
  return code;
}
