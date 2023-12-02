const input = await Deno.readTextFile("input.txt");
const rucksacks = input.split("\r\n").filter((l) => !!l);

function priorityLevel(text: string) {
  return [...text]
    .map((a) =>
      a === a.toLowerCase() ? parseInt(a, 36) - 10 : parseInt(a, 36) - 10 + 26
    )
    .filter((a) => a >= 0)
    .map((a) => a + 1);
}

const part1 = () =>
  rucksacks
    .reduce<Array<number>>((acc, r) => {
      const comp2 = r.slice(r.length / 2);
      return [
        ...acc,
        ...new Set(
          priorityLevel(
            [...r.slice(0, r.length / 2)]
              .filter((a) => comp2.includes(a))
              .join("")
          )
        ),
      ];
    }, [])
    .reduce((a, b) => a + b, 0);

const part2 = () =>
  rucksacks.reduce<number>((acc, _r, i, arr) => {
    return i % 3 === 0
      ? acc +
          priorityLevel(
            [...arr[i]].find(
              (a) => arr[i + 1].includes(a) && arr[i + 2].includes(a)
            )!
          )[0]
      : acc;
  }, 0);

console.log(part1());
console.log(part2());
