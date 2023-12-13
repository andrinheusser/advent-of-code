import { loadFile, splitLines, timedSolution } from "../utils.ts";

const null_cache = new Set<string>();
const cache = new Map<string, number>();

function parseSpringData(lines: string[], expand = false) {
  return lines.map((line) => {
    let [springStr, valueStr] = line.split(" ");

    const trimEnd = (s: Array<string>): Array<string> =>
      s[s.length - 1] === "_" ? trimEnd(s.slice(0, -1)) : s;
    const trimStart = (s: Array<string>): Array<string> =>
      s[0] === "_" ? trimStart(s.slice(1)) : s;
    const trim = (s: Array<string>): Array<string> => trimEnd(trimStart(s));

    springStr = expand
      ? [springStr, springStr, springStr, springStr, springStr].join("?")
      : springStr;
    valueStr = expand
      ? [valueStr, valueStr, valueStr, valueStr, valueStr].join(",")
      : valueStr;

    const values = valueStr.split(",").map(Number);
    const springs: Array<string> = [];

    for (const spring of springStr) {
      if (spring === ".") {
        if (springs.length > 0 && springs[springs.length - 1] !== "_") {
          springs.push("_");
        }
      }
      if (spring === "?") {
        springs.push("0");
      }
      if (spring === "#") {
        springs.push("1");
      }
    }

    return { springs: trim(springs).join(""), values };
  });
}

function validString(s: string, groups: Array<number>) {
  const splits = s.split("_").filter((s) => s.length > 0);
  if (splits.length !== groups.length) {
    return false;
  }
  if (
    splits.reduce((a, b) => a + b.length, 0) !==
      groups.reduce((a, b) => a + b, 0)
  ) {
    return false;
  }
  const foundGroups: Array<number> = [];
  let prevCounted = false;
  for (let i = 0; i < s.length; i++) {
    const char = s[i];

    switch (char) {
      case "1": {
        if (prevCounted) {
          foundGroups[foundGroups.length - 1] += 1;
        } else {
          foundGroups.push(1);
          prevCounted = true;
        }
        break;
      }
      case "_": {
        prevCounted = false;
        const next = s[i + 1];
        if (next && next === "_" || !foundGroups.length) {
          continue;
        }
        const firstGroup = groups.shift();
        if (foundGroups[foundGroups.length - 1] !== firstGroup) {
          return false;
        }
        break;
      }
    }
  }
  return true;
}

function checkString(s: string, groups: Array<number>): number {
  let cacheKey = "";
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "_" && (i + 1 < s.length && s[i + 1] === "_")) {
      continue;
    }
    cacheKey += s[i];
  }
  cacheKey += groups.join(",");
  if (null_cache.has(cacheKey)) {
    return 0;
  }
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }
  const firstReplacementIndex = s.indexOf("0");
  if (firstReplacementIndex === -1) {
    const result = validString(s, [...groups]);
    return result ? 1 : 0;
  }
  const foundGroups = s.substring(0, firstReplacementIndex).split("_").filter((
    s,
  ) => s.length > 0);
  for (let i = 0; i < foundGroups.length - 1; i++) {
    if (foundGroups[i].length !== groups[i]) {
      return 0;
    }
  }
  const onesAndZeroes = s.split("").filter((c) => c !== "_");
  const totalPossibleSum = onesAndZeroes.length;
  const totalRequiredSum = groups.reduce((a, b) => a + b, 0);
  const onesSum = onesAndZeroes.filter((c) => c === "1").length;
  const delta = totalRequiredSum - onesSum;
  if (
    totalPossibleSum <
      totalRequiredSum || onesSum > totalRequiredSum
  ) {
    null_cache.add(cacheKey);
    return 0;
  }

  if (delta === 0) {
    const with_ = s.slice(0, firstReplacementIndex) + "_" +
      s.slice(firstReplacementIndex + 1, s.length);
    const result = checkString(with_, groups);
    cache.set(cacheKey, result);
    return result;
  } else {
    const with1 = s.slice(0, firstReplacementIndex) + "1" +
      s.slice(firstReplacementIndex + 1, s.length);
    const with_ = s.slice(0, firstReplacementIndex) + "_" +
      s.slice(firstReplacementIndex + 1, s.length);
    const result = checkString(with1, groups) +
      checkString(with_, groups);
    cache.set(cacheKey, result);
    return result;
  }
}

await timedSolution(1, async () => {
  const springData = await loadFile(true).then(splitLines).then(
    (data) => parseSpringData(data, false),
  );

  let sum = 0;
  for (const { springs, values } of springData) {
    cache.clear();
    null_cache.clear();
    const combinations = checkString(springs, values);
    sum += combinations;
  }

  return sum;
});
await timedSolution(2, async () => {
  const springData = await loadFile(true).then(splitLines).then(
    (data) => parseSpringData(data, true),
  );

  let sum = 0;
  for (const { springs, values } of springData) {
    cache.clear();
    null_cache.clear();
    const combinations = checkString(springs, values);
    sum += combinations;
  }

  return sum;
});
