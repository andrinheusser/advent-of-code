const input = await Deno.readTextFile("input.txt");

class FileTree {
  root: FileTreeNode;
  pwd: FileTreeNode;
  constructor() {
    this.root = new FileTreeNode("/", "directory", 0);
    this.pwd = this.root;
  }
  handleCdCommand(target: string) {
    if (target === "..") {
      if (this.pwd.parent) {
        this.pwd = this.pwd.parent;
      } else {
        throw new Error("Cannot go up from root");
      }
    } else if (target === "/" || target === "") {
      this.pwd = this.root;
    } else {
      let child = this.pwd.children.find((c) => c.name === target);
      if (!child) {
        child = new FileTreeNode(target, "directory", 0, this.pwd);
        this.pwd.children.push(child);
        this.pwd = child;
      }
      this.pwd = child;
    }
  }
}

class FileTreeNode {
  name: string;
  type: "file" | "directory";
  size: number;
  children: FileTreeNode[];
  parent: FileTreeNode | null;
  constructor(
    name: string,
    type: "file" | "directory",
    size: number,
    parent: FileTreeNode | null = null,
  ) {
    this.name = name;
    this.type = type;
    this.size = size;
    this.children = [];
    this.parent = parent;
  }
}

const lines = input.split("\r\n").filter((l) => !!l);

const isCommand = (line: string) => line.startsWith("$");
const isCdCommand = (line: string) => line.startsWith("$ cd");
const isLsCommand = (line: string) => line.startsWith("$ ls");

const cdTarget = (line: string) => {
  return line.replace("$ cd ", "");
};

const lsLineToFileTreeNode = (line: string, parent: FileTreeNode) => {
  if (line.startsWith("dir ")) {
    return new FileTreeNode(line.replace("dir ", ""), "directory", 0, parent);
  }
  const match = line.match(/(\d+) (.+)/);
  if (match?.length === 3) {
    return new FileTreeNode(match[2], "file", parseInt(match[1]), parent);
  }
  throw new Error(`Cannot parse line: ${line}`);
};

let checkingLsOutput = false;

const tree = new FileTree();

for (const line of lines) {
  if (checkingLsOutput) {
    try {
      const node = lsLineToFileTreeNode(line, tree.pwd);
      if (node) tree.pwd.children.push(node);
      continue;
    } catch (e) {
      checkingLsOutput = false;
    }
  }

  if (isCommand(line)) {
    if (isCdCommand(line)) {
      const target = cdTarget(line);
      tree.handleCdCommand(target);
    } else if (isLsCommand(line)) {
      checkingLsOutput = true;
    }
  }
}
let sizesToDelete: Map<string, number> = new Map<string, number>();

const getSize = (node: FileTreeNode): number => {
  if (node.type === "file") return node.size;
  const directorySize = node.children.reduce((acc, c) => acc + getSize(c), 0);
  if (directorySize <= 100000) {
    sizesToDelete.set(
      `${node.name}-${node.parent?.name ?? "/"}`,
      directorySize,
    );
  }
  return directorySize;
};
const totalSpace = 70000000;
const updateSpace = 30000000;
const rootSize = getSize(tree.root);
const ununsedSpace = totalSpace - rootSize;
const minimumDelete = updateSpace - ununsedSpace;

const candidates: number[] = [];

const checkIfCandidate = (node: FileTreeNode) => {
  if (node.type === "file") return;
  const directorySize = node.children.reduce((acc, c) => acc + getSize(c), 0);
  if (directorySize >= minimumDelete) {
    candidates.push(directorySize);
  }
  if (node.children.length > 0) {
    for (const child of node.children) {
      checkIfCandidate(child);
    }
  }
};

checkIfCandidate(tree.root);

const sorted = candidates.sort((a, b) => a - b);

console.log("sorted", sorted[0]);
