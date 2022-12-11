const input = await Deno.readTextFile("input.txt");

const rucksacks = input.split("\r\n").filter((l) => !!l);

function alphabetPosition(text: string) {
  return [...text].map((a) =>
    a === a.toLowerCase() ? parseInt(a, 36) - 10 : parseInt(a, 36) - 10 + 26
  ).filter((a) => a >= 0).map((a) => a + 1);
}

const groups: Array<Array<string>> = [];

// group the rucksacks in groups of three
for (let i = 0; i < rucksacks.length; i++) {
  if (i % 3 === 0) {
    groups.push([rucksacks[i], rucksacks[i + 1], rucksacks[i + 2]]);
  }
}

const badges = groups.map((group) => {
  const [first, second, third] = group;
  for (let c of first) {
    if (second.includes(c) && third.includes(c)) {
      return c;
    }
  }
  return "";
});

console.log(badges.map(alphabetPosition).flat().reduce((a, b) => a + b, 0));
console.log(badges.length);
