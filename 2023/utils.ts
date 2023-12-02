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

/**
 * Asynchronously reads the input file in chunks and yields each chunk.
 * @param loadActualInput Flag indicating whether to load the actual input file or the test file.
 * @returns An async generator that yields each chunk of the file.
 */
export async function* readChunks(loadActualInput = false) {
  const file = await Deno.open(loadActualInput ? "./input.txt" : "./test.txt");
  const reader = file.readable.getReader();
  let done = false;
  do {
    const result = await reader.read();
    done = result.done;

    if (result.value) {
      yield decoder.decode(result.value);
    }
  } while (!done);

  reader.releaseLock();
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
