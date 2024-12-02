import { loadFile, timedSolution } from "../../utils/utils.ts";

type Part = {
  x: number;
  m: number;
  a: number;
  s: number;
  id: string;
};
type Rule = {
  name: string;
  rules: {
    label: string;
    comparison: "eq" | "lt" | "gt";
    value: number;
    result: string;
  };
  finally: string;
};
const dataRegex = /\{x=(\d+),m=(\d+),a=(\d+),s=(\d+)\}/;
function parseData(line: string): Part {
  const match = line.match(dataRegex);
  if (match) {
    return {
      x: parseInt(match[1]),
      m: parseInt(match[2]),
      a: parseInt(match[3]),
      s: parseInt(match[4]),
      id: line,
    };
  }
  throw new Error("Invalid data");
}

function parseRules(line: string) {
  const [name, rul] = line.split("{");
  const rules = rul.substring(0, rul.length - 1).split(",");
  return {
    name,
    rules: rules.slice(0, rules.length - 1).map(parseRule),
    finally: rules[rules.length - 1],
  };
}
function parseRule(rule: string) {
  const [def, result] = rule.split(":");
  return {
    label: def[0] as "x" | "m" | "a" | "s",
    comparison: def[1] === ">" ? "gt" : "lt" as "gt" | "lt",
    value: +def.substring(2),
    result,
  };
}
function parse(lines: string) {
  const [rules, data] = lines.split("\n\n");

  return {
    rules: rules.split("\n").map(parseRules),
    data: data.split("\n").map(parseData),
  };
}

await timedSolution(1, async () => {
  const { rules, data } = await loadFile().then(parse);
  return 1;
});
