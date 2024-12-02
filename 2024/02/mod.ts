import { TextLineStream } from "jsr:@std/streams@0.223.0/text-line-stream";
import { timedSolution } from "../../utils/utils.ts";

async function* lines() {
  const file = await Deno.open("input.txt");
  const readable = file.readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream());
  const reader = readable.getReader();
  while (true) {
    const { value, done } = await reader.read();
    if (value === undefined) break;
    if (done) break;
    yield value;
  }
}

function isSafe(levels: string[]): boolean {
  let i = 0,
    prevLevel = 0,
    initalDistance = 0;
  while (i < levels.length) {
    const x = Number(levels[i]);
    if (i === 0) {
      prevLevel = x;
      i++;
      continue;
    }
    const distance = x - prevLevel;
    if (Math.abs(distance) > 3 || Math.abs(distance) < 1) {
      return false;
    }
    if (i === 1) {
      initalDistance = distance;
    } else if (initalDistance * distance < 0) {
      return false;
    }

    if (i === levels.length - 1) {
      return true;
    } else {
      i++;
      prevLevel = x;
    }
  }
  throw new Error("Unreachable");
}

await timedSolution(1, async () => {
  let safe = 0;
  for await (const line of lines()) {
    const levels = line.split(" ");
    safe += isSafe(levels) ? 1 : 0;
  }
  return safe;
});

await timedSolution(2, async () => {
  let safe = 0;
  for await (const line of lines()) {
    const levels = line.split(" ");
    if (isSafe(levels)) {
      safe++;
    } else {
      for (let i = 0; i < levels.length; i++) {
        const l1 = levels.filter((_, index) => index !== i);
        if (isSafe(l1)) {
          safe++;
          break;
        }
      }
    }
  }
  return safe;
});
