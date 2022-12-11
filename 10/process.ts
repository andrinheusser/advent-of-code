import { writeAllSync } from "https://deno.land/std/streams/write_all.ts";

const input = await Deno.readTextFile("input.txt");
const instructions = input.split("\r\n").filter((l) => !!l);
/*
const input = await Deno.readTextFile("test.txt");
const instructions = input.split("\n").filter((l) => !!l);

*/
let cycle = 0;
let signalStrentgh = 0;
let X = 1;
let overflow = 20;
let crtLine = 0;

// CRT 40x6

const isNoop = (instruction: string) => instruction.startsWith("noop");
const parseAddx = (instruction: string) => {
  const [, x] = instruction.match(/addx \-?(\d+)/) || [];
  if (instruction.includes("-")) {
    return -parseInt(x);
  }
  return parseInt(x);
};

const eachCycle = () => {
  cycle++;
  recordSignalStrength();
  draw();
};

const drawPixel = () => {
  /*
  console.log("");
  console.log("---- Cycle", cycle, "----");
  console.log("X", X);
  console.log("cycle-crtLine", cycle - crtLine * 40 + 40);
  console.log("");
  */
  const delta = Math.abs(cycle - crtLine * 40 + 40 - X - 1) < 2;
  if (delta) {
    return "#";
  }
  return ".";
};

const draw = () => {
  if ((cycle - 1) % 40 === 0) {
    writeAllSync(Deno.stdout, new TextEncoder().encode("\n"));
    crtLine++;
  }
  writeAllSync(Deno.stdout, new TextEncoder().encode(drawPixel()));
};

const recordSignalStrength = () => {
  overflow++;
  if (overflow === 40) {
    signalStrentgh += X * cycle;
    overflow = 0;
    return;
  }
};

for (const instruction of instructions) {
  eachCycle();
  if (isNoop(instruction)) {
    continue;
  }

  eachCycle();
  // mid-Cycle
  const x = parseAddx(instruction);
  X += x;
}
cycle++;
recordSignalStrength();
writeAllSync(Deno.stdout, new TextEncoder().encode("\r\n"));
writeAllSync(Deno.stdout, new TextEncoder().encode("\r\n"));
console.log(signalStrentgh);
