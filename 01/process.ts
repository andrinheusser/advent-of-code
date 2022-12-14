const input = await Deno.readTextFile("input.txt");

//const lines = input.split("\r\n").filter((l) => !!l);
const lines = input.split("\r\n");

// part 1
const part1 = () =>
  lines
    .reduce<[number, number]>(
      (acc, line) =>
        line
          ? [acc[0] + parseInt(line), acc[1]]
          : acc[0] > acc[1]
          ? [0, acc[0]]
          : [0, acc[1]],
      [0, 0]
    )
    .pop();

// part 2
const part2 = () =>
  lines
    .reduce<[number, Array<number>]>(
      (acc, line) =>
        line
          ? [acc[0] + parseInt(line), acc[1]]
          : acc[0] > acc[1][2]
          ? [0, [acc[1][0], acc[1][1], acc[0]].sort((a, b) => b - a)]
          : [0, acc[1]],
      [0, [0, 0, 0]]
    )[1]
    .reduce((a, b) => a + b);

console.log("part 1", part1());
console.log("part 2", part2());
