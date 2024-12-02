import { loadFile, timedSolution } from "../../utils/utils.ts";

type MapRule = [number, number, number];
type PreparedRule = {
  foreward: (input: number) => number;
  backward: (input: number) => number;
};

const parseData = (data: string) => {
  const parsedEntries = data.split("\n\n").map((entry, index) => {
    if (index === 0) {
      return entry.split(": ")[1].split(" ").map(Number);
    }
    const [title, data] = entry.split(":");
    return {
      title: title.split(" ")[0],
      data: data.trim().split("\n").map((dataline) =>
        dataline.split(" ").map(Number)
      ),
    };
  });
  return {
    seeds: parsedEntries[0] as number[],
    rules: parsedEntries.slice(1) as { title: string; data: MapRule[] }[],
  };
};

function prepareRules(
  allRules: MapRule[][],
): {
  rules: PreparedRule[];
  deltas: number[];
  source: { start: number; end: number };
  destination: { start: number; end: number };
}[] {
  return allRules.map((rules) => {
    const preparedRules = rules.map(
      ([destinationRangeStart, sourceRangeStart, rangeLength]) => {
        const delta = destinationRangeStart - sourceRangeStart;
        return {
          foreward: (input: number) => {
            const isValid = input >= sourceRangeStart &&
              input <= sourceRangeStart + rangeLength;
            if (
              isValid
            ) return input + delta;
            return input;
          },
          backward: (input: number) => {
            if (
              input >= destinationRangeStart &&
              input <= destinationRangeStart + rangeLength
            ) return input - delta;
            return input;
          },
          delta,
          destination: {
            start: destinationRangeStart,
            end: destinationRangeStart + rangeLength,
          },
          source: {
            start: sourceRangeStart,
            end: sourceRangeStart + rangeLength,
          },
        };
      },
    );
    return {
      rules: preparedRules,
      deltas: preparedRules.map((rule) => rule.delta),
      source: {
        start: Math.min(...preparedRules.map((rule) => rule.source.start)),
        end: Math.max(...preparedRules.map((rule) => rule.source.end)),
      },
      destination: {
        start: Math.min(...preparedRules.map((rule) => rule.destination.start)),
        end: Math.max(
          ...preparedRules.map((rule) => rule.destination.end),
        ),
      },
    };
  });
}

const applyPreParedRules = (
  rules: ReturnType<typeof prepareRules>,
  inputs: number[],
  direction: "foreward" | "backward",
) => {
  const rul = direction === "foreward" ? rules : [...rules].reverse();
  for (const ruleSet of rul) {
    const { start, end } =
      ruleSet[direction === "foreward" ? "source" : "destination"];
    inputs = inputs.filter((value) => value > 0).map((value) => {
      if (value < start || value > end) return value;
      for (const rule of ruleSet.rules) {
        const previousValue = value;
        value = rule[direction](value);
        if (value !== previousValue) break;
      }
      return value;
    });
  }
  return inputs;
};

await timedSolution(1, async () => {
  const { seeds, rules } = await loadFile(true).then(
    parseData,
  );
  const preparedRules = prepareRules(rules.map((rule) => rule.data));
  return Math.min(...applyPreParedRules(preparedRules, seeds, "foreward"));
});

await timedSolution(2, async () => {
  const { seeds, rules } = await loadFile(true).then(
    parseData,
  );

  const preparedRules = prepareRules(rules.map((rule) => rule.data));

  const seedRanges: { start: number; end: number }[] = [];
  for (let i = 0; i < seeds.length; i = i + 2) {
    seedRanges.push({ start: seeds[i], end: seeds[i] + seeds[i + 1] });
  }
  const minSeedRange = Math.min(...seedRanges.map((range) => range.start));
  const maxSeedRange = Math.max(...seedRanges.map((range) => range.end));
  const withinSeedRange = (
    value: number,
    seeds: { start: number; end: number }[],
  ) => {
    if (value < minSeedRange || value > maxSeedRange) return false;
    return seeds.some((seed) => value >= seed.start && value <= seed.end);
  };

  const { end } = preparedRules[preparedRules.length - 1].destination;

  const totalRange = [0, end];

  const increaseStart = (current: number) => {
    return current + Math.floor((totalRange[1] - current) / 1000);
  };
  const decreaseStart = (current: number) => {
    return current - Math.floor((current - totalRange[0]) / 10000);
  };

  let locationValue = 0;
  let direction = "inc";
  let minLocationValue = -1;

  do {
    const seed =
      applyPreParedRules(preparedRules, [locationValue], "backward")[0];
    if (withinSeedRange(seed, seedRanges)) {
      switch (direction) {
        case "inc":
          direction = "dec";
          break;
        case "incSmall":
          minLocationValue = locationValue;
      }
    } else {
      if (direction === "dec") {
        direction = "incSmall";
      }
    }

    switch (direction) {
      case "inc":
        locationValue = increaseStart(locationValue);
        break;
      case "dec":
        locationValue = decreaseStart(locationValue);
        break;
      case "incSmall":
        locationValue += 1;
        break;
    }
  } while (minLocationValue === -1);
  return minLocationValue;
});
