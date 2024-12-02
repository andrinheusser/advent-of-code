import { loadFile, splitLines, timedSolution } from "../../utils/utils.ts";

function parseNumberPart(s: string) {
  const numbers: number[] = [];
  for (let i = 0; i < s.length; i++) {
    if (s[i] !== " ") {
      if (!isNaN(Number(s[i + 1]))) {
        numbers.push(Number(s[i] + s[i + 1]));
        i++;
      } else {
        numbers.push(Number(s[i]));
      }
    }
  }
  return numbers;
}

function binarySearch(
  arr: number[],
  el: number,
  compare_fn: (a: number, b: number) => number,
) {
  let m = 0;
  let n = arr.length - 1;
  while (m <= n) {
    const k = (n + m) >> 1;
    const cmp = compare_fn(el, arr[k]);
    if (cmp > 0) {
      m = k + 1;
    } else if (cmp < 0) {
      n = k - 1;
    } else {
      return k;
    }
  }
  return ~m;
}

await timedSolution(1, async () => {
  return await loadFile(true).then(splitLines).then((lines) => {
    return lines.map((line) => {
      const [cardstr, nrstr] = line.split(":");
      const [left, right] = nrstr.split("|");
      return {
        card: Number(cardstr.split(" ").pop()),
        left: parseNumberPart(left),
        right: parseNumberPart(right).sort((a, b) => a - b),
      };
    }).reduce((sum, { left, right }) => {
      return sum + left.reduce((a, n) => {
        if (binarySearch(right, n, (a, b) => a - b) >= 0) {
          return a === 0 ? 1 : a * 2;
        }
        return a;
      }, 0);
    }, 0);
  });
});

await timedSolution(2, async () => {
  const cards = await loadFile(true).then(splitLines).then((lines) => {
    return lines.map((line) => {
      const [cardstr, nrstr] = line.split(":");
      const [leftstr, rightstr] = nrstr.split("|");
      const left = parseNumberPart(leftstr);
      const right = parseNumberPart(rightstr).sort((a, b) => a - b);
      const winning = left.reduce((a, n) => {
        if (binarySearch(right, n, (a, b) => a - b) >= 0) {
          return a + 1;
        }
        return a;
      }, 0);
      return {
        card: Number(cardstr.split(" ").pop()),
        left,
        right,
        winning,
        instances: 1,
      };
    });
  });
  for (let i = 0; i < cards.length; i++) {
    const { winning, instances } = cards[i];
    for (let w = 0; w < winning; w++) {
      const next = cards[i + 1 + w];
      if (next) {
        next.instances += instances;
      }
    }
  }
  return cards.reduce((sum, { instances }) => sum + instances, 0);
});
