const input = await Deno.readTextFile("input.txt");

const signal = input.split("\r\n").filter((l) => !!l)[0];

const SIGNAL_LENGTH = 14;

const isUnique = (s: string) => {
  if (s.length !== SIGNAL_LENGTH) return false;
  const set = new Set(s);
  return set.size === SIGNAL_LENGTH;
};

for (let index = 0; index < signal.length; index++) {
  if (index < SIGNAL_LENGTH) continue;
  const s = signal.slice(index - SIGNAL_LENGTH, index);
  if (isUnique(s)) {
    console.log(index);
    break;
  }
}
