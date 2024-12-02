import { loadFile, splitLines, timedSolution } from "../../utils/utils.ts";

const reduceDelta = (
  deltas: number[],
  value: number,
  index: number,
  arr: number[],
) => {
  if (index === arr.length - 1) return deltas;
  return deltas.concat([arr[index + 1] - value]);
};

class Sequence {
  public differencesAtSteps: Array<number[]> = [];
  constructor(public input: number[]) {
    this.calculateDifferencesAtSteps();
  }
  private calculateDifferencesAtSteps() {
    let currentValues = this.input.reduce(reduceDelta, []);
    let differences: number[] = [];
    do {
      differences = currentValues.reduce(reduceDelta, []);
      this.differencesAtSteps.push(currentValues);
      currentValues = differences;
    } while (!differences.every((v) => v === 0));
  }
  public get nextValue(): number {
    return this.differencesAtSteps.reduce(
      (acc, deltas) => acc + deltas[deltas.length - 1],
      this.input[this.input.length - 1],
    );
  }
  public get previousValue(): number {
    const diffTotal = this.differencesAtSteps.slice(0, -1).reverse().reduce(
      (acc, deltas) => {
        return deltas[0] - acc;
      },
      this.differencesAtSteps[this.differencesAtSteps.length - 1][0],
    );
    return this.input[0] - diffTotal;
  }
}

await timedSolution(1, async () => {
  const data = await loadFile(true).then(splitLines).then((lines) => {
    return lines.map((line) => {
      return new Sequence(line.split(" ").map(Number));
    });
  });
  return data.reduce((acc, s) => acc + s.nextValue, 0);
});
await timedSolution(2, async () => {
  const data = await loadFile(true).then(splitLines).then((lines) => {
    return lines.map((line) => {
      return new Sequence(line.split(" ").map(Number));
    });
  });
  return data.reduce((acc, s) => acc + s.previousValue, 0);
});
