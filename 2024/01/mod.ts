import { BinaryHeap } from "jsr:@std/data-structures";
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

async function part1() {
  const heapA = new BinaryHeap<number>((a, b) => a - b),
    heapB = new BinaryHeap<number>((a, b) => a - b);

  for await (const line of lines()) {
    const [a, b] = line.split("   ").map(Number);
    heapA.push(a);
    heapB.push(b);
  }

  let distance = 0;
  while (heapA.length) {
    distance += Math.abs((heapA.pop() ?? 0) - (heapB.pop() ?? 0));
  }
  return distance;
}

async function part2() {
  const occurencesA = new Map<number, number>(),
    occurencesB = new Map<number, number>();

  for await (const line of lines()) {
    const [a, b] = line.split("   ").map(Number);
    occurencesA.set(a, (occurencesA.get(a) ?? 0) + 1);
    occurencesB.set(b, (occurencesB.get(b) ?? 0) + 1);
  }

  let similarity = 0;
  for (const [number, times] of occurencesA.entries()) {
    const timesB = occurencesB.get(number) ?? 0;
    similarity += number * times * timesB;
  }
  return similarity;
}

await timedSolution(1, () => part1());
await timedSolution(2, () => part2());
