const input = await Deno.readTextFile("input.txt");

//const lines = input.split("\r\n").filter((l) => !!l);
const lines = input.split("\r\n");

const calories: Map<number, number> = new Map();

let i = 0;
for (let line of lines) {
  const iCal = calories.get(i);
  if (line) {
    calories.set(i, iCal ? iCal + parseInt(line) : parseInt(line));
  } else {
    i++;
  }
}
const sorted = [...calories.values()].sort((a, b) => a - b).reverse();

const topThree = sorted.slice(0, 3).reduce((a, b) => a + b, 0);

console.log({ sorted: sorted.slice(0, 3), topThree });
