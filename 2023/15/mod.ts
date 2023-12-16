import { loadFile, timedSolution } from "../utils.ts";

function hash(s: string) {
  return s.split("").reduce((a, b) => (a + b.charCodeAt(0)) * 17 % 256, 0);
}

await timedSolution(1, async () => {
  return await loadFile(true).then((data) =>
    data.replaceAll("\n", "").split(",").reduce((a, s) => a + hash(s), 0)
  );
});
new Map();

class HolidayASCIIStringHelperManualArrangementProcedure {
  boxes: Map<number, Array<{ label: string; focalLength: number }>> = new Map(
    [...Array.from({ length: 256 })].map((_, i) => [i, []]),
  );
  instruction(op: string, label: string, focalLength: number) {
    const box = this.boxes.get(hash(label))!,
      lensIndex = box.findIndex((l) => l.label === label);
    if (lensIndex === -1) {
      return op === "=" ? box.push({ label, focalLength }) : null;
    }
    return op === "-"
      ? box.splice(lensIndex, 1)
      : box[lensIndex].focalLength = focalLength;
  }
  get score() {
    return [...this.boxes.entries()].reduce(
      (a, [i, lenses]) =>
        lenses.reduce(
          (acc, { focalLength }, lensIndex) =>
            acc + (1 + i) * (1 + lensIndex) * focalLength,
          a,
        ),
      0,
    );
  }
}

await timedSolution(2, async () => {
  const regex = /([a-z]+)(=|-)(\d*)/g,
    hashMap = new HolidayASCIIStringHelperManualArrangementProcedure();
  return await loadFile(true).then((data) =>
    data.split(",").forEach((s) => {
      const [_, label, op, lens] = [...s.matchAll(regex)][0];
      hashMap.instruction(op, label, Number(lens));
    })
  ).then(() => hashMap.score);
});
