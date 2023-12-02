const input = await Deno.readTextFile("input.txt");
const lines = input.split("\r\n");
/*
const input = await Deno.readTextFile("test.txt");
const lines = input.split("\n");
*/

type Packet = Array<Packet | number>;
type LeftRight = { left: Packet; right: Packet };

const packets: LeftRight[] = [];

let leftRight: Partial<LeftRight> = {};
for (const line of lines) {
  if (line) {
    const packet = JSON.parse(line) as Packet;
    if (leftRight.left === undefined) {
      leftRight.left = packet;
    } else {
      leftRight.right = packet;
    }
  } else {
    packets.push(leftRight as LeftRight);
    leftRight = {};
  }
}

const compareNumbers = (left: number, right: number): number => {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
};

const makePacket = (value: unknown): Packet => {
  if (typeof value === "number") {
    return [value];
  }
  return value as Packet;
};

const comparePackets = ({
  left: leftPacket,
  right: rightPacket,
}: LeftRight): number => {
  for (let i = 0; i < Math.max(leftPacket.length, rightPacket.length); i++) {
    const left = leftPacket[i];
    const right = rightPacket[i];

    if (left === undefined) return -1;
    if (right === undefined) return 1;

    let result: number;

    if (typeof left === "number" && typeof right === "number") {
      result = compareNumbers(left, right);
      if (result !== 0) return result;
    } else {
      result = comparePackets({
        left: makePacket(left),
        right: makePacket(right),
      });
      if (result !== 0) return result;
    }
  }

  return 0;
};

const correctIndexes = packets.reduce<Array<number>>(
  (acc, curr, index) => {
    if (comparePackets(curr) === -1) {
      acc.push(index + 1);
    }
    return acc;
  },
  [],
);

// part 1
console.log(correctIndexes.reduce<number>((acc, curr) => acc + curr, 0));

const allPackets = packets.reduce<Packet[]>((acc, curr) => {
  acc.push(curr.left);
  acc.push(curr.right);
  return acc;
}, []);

const before = (divider: number, packets: Packet[]): number => {
  return packets.reduce<number>((acc, curr) => {
    if (comparePackets({ left: curr, right: [divider] }) === -1) {
      acc++;
    }
    return acc;
  }, 1);
};

// part 2
console.log(before(2, allPackets) * (before(6, allPackets) + 1));
