import { loadFile, timedSolution } from "../utils.ts";

function hash(s: string) {
  return s.split("").reduce((a, b) => (a + b.charCodeAt(0)) * 17 % 256, 0);
}

await timedSolution(1, async () => {
  return await loadFile(true).then((data) =>
    data.replaceAll("\n", "").split(",").reduce((a, s) => a + hash(s), 0)
  );
});

type Lens = {
  label: string;
  focalLength: number;
};

await timedSolution(2, async () => {
  const regex = /([a-z]+)(=|-)(\d*)/g;

  const boxes: Map<number, Array<Lens>> = new Map();
  const instructions = await loadFile(true).then((data) =>
    data.replaceAll("\n", "").split(",").map((s) => {
      const [_, label, op, lens] = [...s.matchAll(regex)][0];
      return {
        label: label,
        boxIndex: hash(label),
        op,
        lens: lens ? Number(lens) : 0,
      };
    })
  );
  instructions.forEach(({ boxIndex, op, lens, label }) => {
    if (!boxes.has(boxIndex)) boxes.set(boxIndex, []);
    const box = boxes.get(boxIndex)!;
    if (op === "-") {
      const lensIndex = box.findIndex((l) => l.label === label);
      if (lensIndex !== -1) box.splice(lensIndex, 1);
    } else if (op === "=") {
      const existingLens = box.find((l) => l.label === label);
      if (existingLens) existingLens.focalLength = lens;
      else box.push({ label, focalLength: lens });
    }
  });
  return [...boxes.entries()].reduce((a, [i, lenses]) => {
    return lenses.reduce((acc, { focalLength }, lensIndex) => {
      return acc + (1 + i) * (1 + lensIndex) * focalLength;
    }, a);
  }, 0);
});
