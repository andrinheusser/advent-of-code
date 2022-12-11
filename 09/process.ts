const input = await Deno.readTextFile("input.txt");

const headMovements = input.split("\r\n").filter((l) => !!l);
//const headMovements = input.split("\n").filter((l) => !!l);

const parseHeadMovement = (headMovement: string) => {
  const movementSplits = headMovement.split(" ");
  return {
    direction: movementSplits[0],
    distance: parseInt(movementSplits[1]),
  };
};

const DIRECTIONS: Record<string, { x: number; y: number }> = {
  U: { x: 0, y: 1 },
  D: { x: 0, y: -1 },
  L: { x: -1, y: 0 },
  R: { x: 1, y: 0 },
  UR: { x: 1, y: 1 },
  UL: { x: -1, y: 1 },
  DR: { x: 1, y: -1 },
  DL: { x: -1, y: -1 },
};

const visitedByTail = new Set<string>();
visitedByTail.add("0,0");

class RopePiece {
  constructor(public x: number, public y: number, public name: string) {}

  step(direction: string) {
    const { x, y } = DIRECTIONS[direction];
    this.x += x;
    this.y += y;
    if (this.name === "Tail") visitedByTail.add(this.x + "," + this.y);
  }

  isNextTo(other: RopePiece) {
    return (
      Math.abs(this.x - other.x) <= 1 && Math.abs(this.y - other.y) <= 1
    );
  }

  follow(other: RopePiece) {
    if (this.isNextTo(other)) return;
    const xDelta = other.x - this.x;
    const yDelta = other.y - this.y;

    let upDown = yDelta === 0 ? "" : yDelta < 0 ? "D" : "U";
    let leftRight = xDelta === 0 ? "" : xDelta < 0 ? "L" : "R";
    this.step(upDown + leftRight);
  }
}

class Rope {
  public pieces: RopePiece[] = [];

  constructor(public length = 1) {
    this.pieces.push(new RopePiece(0, 0, "Head"));
    for (let i = 0; i < length - 1; i++) {
      this.pieces.push(new RopePiece(0, 0, "Member"));
    }
    this.pieces.push(new RopePiece(0, 0, "Tail"));
  }

  step(direction: string) {
    this.pieces[0].step(direction);
    for (let i = 1; i < this.pieces.length; i++) {
      this.pieces[i].follow(this.pieces[i - 1] || this.pieces[0]);
    }
  }
}

const rope = new Rope(9);

for (let i = 0; i < headMovements.length; i++) {
  const headMovement = parseHeadMovement(headMovements[i]);
  for (let j = 0; j < headMovement.distance; j++) {
    rope.step(headMovement.direction);
  }
}

console.log(visitedByTail.size);
