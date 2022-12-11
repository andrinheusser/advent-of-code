const input = await Deno.readTextFile("input.txt");

const lines = input.split("\r\n").filter((l) => !!l);

const pairs: number[][][] = [];

for (let i = 0; i < lines.length; i++) {
  pairs.push(lines[i].split(",").map((a) => a.split("-").map(Number)));
}

const _hasFullOverlap = (pair: number[][]) => {
  const [a, b] = pair;
  return a[0] <= b[0] && a[1] >= b[1] || b[0] <= a[0] && b[1] >= a[1];
};

const hasPartialOverlap = (pair: number[][]) => {
  const [a, b] = pair;
  const [a1, a2] = a;
  const [b1, b2] = b;
  // return true if a1 is between b1 and b2
  // or if a2 is between b1 and b2
  // or if b1 is between a1 and a2
  // or if b2 is between a1 and a2
  return (a1 >= b1 && a1 <= b2) || (a2 >= b1 && a2 <= b2) ||
    (b1 >= a1 && b1 <= a2) || (b2 >= a1 && b2 <= a2);
};

let z = 0;
for (let i = 0; i < pairs.length; i++) {
  const pair = pairs[i];
  if (hasPartialOverlap(pair)) {
    z++;
  }
}
console.log(z);
