import { timedSolution } from "../../utils/utils.ts";

type FS = {
  startIndex: number;
  endIndex: number;
  fileId: number | null;
}[];

await timedSolution(1, async () => {
  const fs = await parseFS();

  while (true) {
    const { done } = fragment(fs);
    if (done) {
      break;
    }
  }
  return calculateChecksum(fs);
});
await timedSolution(2, async () => {
  const fs = await parseFS(),
    files = fs.filter((block) => block.fileId !== null);

  while (true) {
    const { done } = compact(fs, files);
    if (done) {
      break;
    }
  }
  return calculateChecksum(fs);
});

async function parseFS(fileName = "input.txt"): Promise<FS> {
  const input = await Deno.readTextFile(fileName).then((data) =>
    data
      .split("")
      .map(Number)
      .reduce<{ cursor: number; blocks: FS }>(
        (acc, curr, i) => {
          const isFile = i % 2 === 0,
            fileId = Math.floor(i / 2);

          if (isFile) {
            acc.blocks.push({
              startIndex: acc.cursor,
              endIndex: acc.cursor + curr,
              fileId,
            });
            acc.cursor += curr;
          } else if (curr > 0) {
            acc.blocks.push({
              startIndex: acc.cursor,
              endIndex: acc.cursor + curr,
              fileId: null,
            });
            acc.cursor += curr;
          }

          return acc;
        },
        { cursor: 0, blocks: [] }
      )
  );
  return input.blocks;
}

function calculateChecksum(fs: FS): number {
  let sum = 0;
  for (const block of fs) {
    if (!block.fileId) continue;
    for (let i = block.startIndex; i < block.endIndex; i++) {
      sum += block.fileId * i;
    }
  }
  return sum;
}

function fragment(fs: FS): { done: boolean; fs: FS } {
  const emptyBlockIndex = fs.findIndex((block) => block.fileId === null),
    emptyBlock = fs[emptyBlockIndex],
    lastBlock = fs[fs.length - 1];

  if (lastBlock.fileId === null) {
    fs.pop();
    return { done: false, fs };
  }

  if (!emptyBlock) {
    return { done: true, fs };
  }

  if (emptyBlock?.startIndex !== lastBlock.startIndex) {
    const spaceInEmptyBlock = emptyBlock.endIndex - emptyBlock.startIndex;
    const spaceInLastBlock = lastBlock.endIndex - lastBlock.startIndex;

    if (spaceInEmptyBlock === spaceInLastBlock) {
      emptyBlock.fileId = lastBlock.fileId;
      fs.pop();
    } else if (spaceInEmptyBlock < spaceInLastBlock) {
      emptyBlock.fileId = lastBlock.fileId;
      lastBlock.endIndex -= spaceInEmptyBlock;
    } else if (spaceInEmptyBlock > spaceInLastBlock) {
      const fileStart = emptyBlock.startIndex,
        fileEnd = emptyBlock.startIndex + spaceInLastBlock,
        emptyStart = fileEnd,
        emptyEnd = emptyBlock.endIndex;
      fs.splice(
        emptyBlockIndex,
        1,
        {
          startIndex: fileStart,
          endIndex: fileEnd,
          fileId: lastBlock.fileId,
        },
        {
          startIndex: emptyStart,
          endIndex: emptyEnd,
          fileId: null,
        }
      );
      fs.pop();
    }
  }

  return { done: false, fs };
}

function compact(fs: FS, files: FS): { done: boolean } {
  const file = files.pop();
  if (!file) {
    return { done: true };
  }
  const fileSize = file.endIndex - file.startIndex,
    emptyBlockIndex = fs.findIndex(
      (block) =>
        block.fileId === null && block.endIndex - block.startIndex >= fileSize
    );

  if (emptyBlockIndex === -1) return { done: false };

  const emptyBlock = fs[emptyBlockIndex];

  if (emptyBlock.startIndex >= file.startIndex) return { done: false };

  if (emptyBlock.endIndex - emptyBlock.startIndex === fileSize) {
    emptyBlock.fileId = file.fileId;
  } else {
    const fileStart = emptyBlock.startIndex,
      fileEnd = emptyBlock.startIndex + fileSize,
      emptyStart = fileEnd,
      emptyEnd = emptyBlock.endIndex;

    fs.splice(
      emptyBlockIndex,
      1,
      {
        startIndex: fileStart,
        endIndex: fileEnd,
        fileId: file.fileId,
      },
      {
        startIndex: emptyStart,
        endIndex: emptyEnd,
        fileId: null,
      }
    );
  }
  file.fileId = null;
  return { done: false };
}
