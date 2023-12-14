const decoder = new TextDecoder();

export function decode(value: Uint8Array | undefined) {
  return decoder.decode(value);
}
export function splitLines(value: string) {
  return value.split("\n");
}

export async function loadFile<T extends boolean>(loadActualInput = false) {
  const data = await Deno.readFile(
    loadActualInput ? "./input.txt" : "./test.txt",
  )
    .then(decode);
  return data;
}

export function* iter_window<T>(
  iterable: Iterable<T>,
  size: number,
  rest: "discard" | "keep" = "discard",
) {
  const iterator = iterable[Symbol.iterator]();
  let result = iterator.next();
  let window: Array<T> = [];
  while (!result.done) {
    window.push(result.value);
    if (window.length === size) {
      yield window;
      window = window.slice(1);
    }
    result = iterator.next();
  }
  if (rest === "keep") {
    yield window;
  }
}

export async function* fileContents(
  fileName: string,
  bufferSize = 1,
): AsyncGenerator<[string, number]> {
  const file = await Deno.open(fileName, { read: true });
  const fileInfo = await file.stat();
  const buf = new Uint8Array(bufferSize);
  const decoder = new TextDecoder();
  if (!fileInfo.isFile) throw new Error(`${fileName} is not a file`);
  let chunkIndex = 0;
  while (await file.read(buf)) {
    const text = decoder.decode(buf);
    yield [text, chunkIndex++];
  }
  file.close();
}

export async function timedSolution(
  part: number,
  solution: () => Promise<string | number>,
) {
  const times_part_t0 = performance.now();
  return await solution().then((solution) => {
    const times_part_t1 = performance.now();
    console.log(`Solution Part ${part}: ${solution}`);
    console.log(`Time Part ${part}: ${times_part_t1 - times_part_t0} ms`);
  });
}

export const gcd = (a: number, b: number): number => a ? gcd(b % a, a) : b;
// usage: Array<number>.reduce(lcm)
export const lcm = (a: number, b: number): number => a * b / gcd(a, b);

// for grid[y][x] = string
export function rotate2DGridEast(grid: string[][]): string[][] {
  const rows = grid.length;
  const cols = grid[0].length;

  const rotated: string[][] = Array(cols).fill(null).map(() =>
    Array(rows).fill("")
  );

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      rotated[x][rows - y - 1] = grid[y][x];
    }
  }

  return rotated;
}
export function rotate2DGridWest(grid: string[][]): string[][] {
  const rows = grid.length;
  const cols = grid[0].length;

  const rotated: string[][] = Array(cols).fill(null).map(() =>
    Array(rows).fill("")
  );

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      rotated[cols - x - 1][y] = grid[y][x];
    }
  }

  return rotated;
}
