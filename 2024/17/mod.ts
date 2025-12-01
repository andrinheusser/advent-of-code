import { assertEquals } from "jsr:@std/assert";
import { timedSolution } from "../../utils/utils.ts";

type Program = number[];
type Registers = [number, number, number];

await timedSolution(1, async () => {
  const { program, registers } = await parseInput();

  console.log(computeProgram(program, registers).join(","));

  return 1;
});

async function parseInput(
  fileName = "input"
): Promise<{ program: Program; registers: Registers }> {
  const [rInput, pInput] = await Deno.readTextFile(`./${fileName}.txt`).then(
    (f) => f.split("\n\n")
  );

  return {
    registers: rInput
      .split("\n")
      .map((r) => r.split(": ")[1])
      .map(Number) as Registers,
    program: pInput.split(": ")[1].split(",").map(Number),
  };
}

function getOperand(
  operand: number,
  type: "literal" | "combo",
  registers: Registers
): number {
  if (type === "literal") return operand;
  if (operand < 4) return operand;
  switch (operand) {
    case 4:
      return registers[0];
    case 5:
      return registers[1];
    case 6:
      return registers[2];
  }
  console.log({ operand });
  throw new Error("Invalid operand");
}

function computeProgram(program: Program, registers: Registers): number[] {
  let pointer = 0,
    i = 0;
  const output: number[] = [];

  while (true) {
    if (pointer >= program.length) break;
    console.log({ i, pointer, registers });
    const result = computeInstruction(pointer, program, registers);
    if (result.stdOut !== undefined) output.push(result.stdOut);
    pointer = result.pointer;
    registers = result.registers;
    i = i + 1;
  }
  return output;
}

function computeInstruction(
  pointer: number,
  program: Program,
  registers: Registers
): { pointer: number; registers: Registers; stdOut?: number } {
  const opCode = program[pointer];
  const operand = program[pointer + 1];

  switch (opCode) {
    case 0:
      console.log(
        "0",
        `${registers[0]} / ${Math.pow(
          2,
          getOperand(operand, "combo", registers)
        )}`
      );
      registers[0] = Math.floor(
        registers[0] / Math.pow(2, getOperand(operand, "combo", registers))
      );
      return { pointer: pointer + 2, registers };
    case 1:
      registers[1] = registers[1] ^ getOperand(operand, "literal", registers);
      return { pointer: pointer + 2, registers };
    case 2:
      registers[1] = getOperand(operand, "combo", registers) % 8;
      return { pointer: pointer + 2, registers };
    case 3:
      if (registers[0] === 0) return { pointer: pointer + 2, registers };
      return { pointer: getOperand(operand, "literal", registers), registers };
    case 4:
      registers[1] = registers[1] ^ registers[2];
      return { pointer: pointer + 2, registers };
    case 5:
      return {
        pointer: pointer + 2,
        registers,
        stdOut: getOperand(operand, "combo", registers) % 8,
      };
    case 6:
      registers[1] = Math.floor(
        registers[0] / Math.pow(getOperand(operand, "combo", registers), 2)
      );
      return { pointer: pointer + 2, registers };
    case 7:
      registers[2] = Math.floor(
        registers[0] / Math.pow(getOperand(operand, "combo", registers), 2)
      );
      return { pointer: pointer + 2, registers };
  }
  throw new Error("Invalid opcode");
}

Deno.test("2", () => {
  const registers: Registers = [0, 0, 9];
  const program: Program = [2, 6];

  const result = computeInstruction(0, program, registers);

  assertEquals(result.registers[1], 1);
});

Deno.test("1", () => {
  const registers: Registers = [0, 29, 0];
  const program: Program = [1, 7];

  const result = computeInstruction(0, program, registers);

  assertEquals(result.registers[1], 26);
});
Deno.test("4", () => {
  const registers: Registers = [0, 2024, 43690];
  const program: Program = [4, 0];

  const result = computeInstruction(0, program, registers);

  assertEquals(result.registers[1], 44354);
});

Deno.test("5,0,5,1,5,4", () => {
  const registers: Registers = [10, 0, 0];
  const program: Program = [5, 0, 5, 1, 5, 4];

  const result = computeProgram(program, registers);

  assertEquals(result, [0, 1, 2]);
});

Deno.test("4,2,5,6,7,7,7,7,3,1,0", () => {
  const registers: Registers = [2024, 0, 0];
  const program: Program = [0, 1, 5, 4, 3, 0];

  const result = computeProgram(program, registers).join(",");

  assertEquals(result, "4,2,5,6,7,7,7,7,3,1,0");
});
