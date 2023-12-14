import { fileContents, timedSolution } from "../utils.ts";

type State = {
  char: string;
  charCount: number;
  line: number;
  score: number;
  rockCount: number;
  bounds: Array<number>;
};

type Char = "O" | "." | "#" | "\n";

const charMap: Record<Char, (state: State) => State> = {
  "\n": (state: State) => ({
    ...state,
    line: state.line + 1,
    charCount: state.charCount + 1,
  }),
  ".": (state: State) => {
    if (state.line === 0) state.bounds[state.charCount] = -1;
    return { ...state, charCount: state.charCount + 1 };
  },
  "#": (state: State) => {
    state
      .bounds[
        state.line === 0
          ? state.charCount
          : state.charCount % (state.bounds.length + 1)
      ] = state.line;
    return { ...state, charCount: state.charCount + 1 };
  },
  "O": (state: State) => {
    const boundsIndex = state.line === 0
      ? state.charCount
      : state.charCount % (state.bounds.length + 1);
    const obstacleIndex = state.bounds[boundsIndex];
    const slideTo = obstacleIndex === undefined ? 0 : obstacleIndex + 1;
    state.bounds[boundsIndex] = slideTo;
    state.score += slideTo;
    state.rockCount++;
    return { ...state, charCount: state.charCount + 1 };
  },
};

await timedSolution(1, async () => {
  let state: State = {
    bounds: [],
    char: "",
    charCount: 0,
    line: 0,
    rockCount: 0,
    score: 0,
  };
  for await (const [char] of fileContents("./input.txt")) {
    state = charMap[char as Char](state);
  }
  return Math.abs(state.score - state.rockCount * state.line);
});
