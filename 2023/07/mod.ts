import { loadFile, splitLines, timedSolution } from "../../utils/utils.ts";

function removeDuplicates(current: number, hand: number[]) {
  const len = hand.length;
  hand = hand.filter((c) => c !== current);
  return { remaining: hand, card: current, duplicates: len - hand.length };
}

function score(hand: number[]) {
  const dupl: [number, number][] = [];
  while (hand.length > 0) {
    const { remaining, duplicates, card } = removeDuplicates(hand[0], hand);
    dupl.push([card, duplicates]);
    hand = remaining;
  }
  // Five of a kind
  if (dupl.length === 1) {
    return 6;
  }
  if (dupl.length === 2) {
    const [first, second] = dupl;
    const [occ1, occ2] = [first[1], second[1]];
    // Four of a kind
    if (occ1 === 4 || occ2 === 4) {
      return 5;
    }
    // Full house
    if (occ1 === 3 || occ2 === 3) {
      return 4;
    }
  }
  if (dupl.length === 3) {
    const occurences = dupl.map(([_, occ]) => occ);
    // Three of a kind
    if (occurences.some((occ) => occ === 3)) {
      return 3;
    }
    // Two pair
    if (occurences.filter((occ) => occ === 2).length === 2) {
      return 2;
    }
  }
  if (dupl.map(([_, occ]) => occ).filter((occ) => occ === 2).length === 1) {
    // One Pair
    return 1;
  }

  return 0;
}

await timedSolution(1, async () => {
  const letterCards = ["T", "J", "Q", "K", "A"];
  return await loadFile(true).then(splitLines).then((lines) =>
    lines.map((line) => {
      const [hand, bid] = line.split(" ");
      const parsedHand = hand.split("").map((card) => {
        const index = letterCards.indexOf(card);
        if (index >= 0) {
          return 10 + index;
        }
        return Number(card);
      });
      return {
        originalHand: hand,
        hand: parsedHand,
        bid: Number(bid),
        score: score(parsedHand),
      };
    }).sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score;
      }
      for (let i = 0; i < a.hand.length; i++) {
        if (a.hand[i] !== b.hand[i]) {
          return b.hand[i] - a.hand[i];
        }
      }
      return 0;
    }).reduce(
      (sum, hand, rank, arr) => {
        return sum + hand.bid * (arr.length - rank);
      },
      0,
    )
  );
});

const scoreWithJokers = (hand: number[]) => {
  const notJokers = hand.filter((card) => card !== 1);
  const oneOrNoJoker = (hand.length - notJokers.length) <= 1;
  const noJokers = notJokers.length === hand.length;
  // Five of a kind, All Jokers
  if (hand.every((card) => card === 1)) {
    return 6;
  }
  // Five of a kind
  if (hand.every((card) => card === 1 || card === notJokers[0])) {
    return 6;
  }
  // Four of a kind
  for (let i = 0; i < notJokers.length; i++) {
    if (
      hand.filter((card) => card === 1 || card === notJokers[i]).length === 4
    ) {
      return 5;
    }
  }
  // Full House
  if (oneOrNoJoker) {
    const distinctNoJokers = new Set(hand.filter((c) => c !== 1));
    if (distinctNoJokers.size === 2) {
      return 4;
    }
  }

  // Three of a kind
  const distinctNoJokers = new Set(hand.filter((c) => c !== 1));
  for (let i = 0; i < [...distinctNoJokers].length; i++) {
    const card = [...distinctNoJokers][i];
    if (hand.filter((c) => c === 1 || c === card).length === 3) {
      return 3;
    }
  }

  // Two pair
  if (noJokers) {
    const distinct = new Set(hand);
    if (distinct.size === 3) {
      return 2;
    }
  }

  // One pair
  if (oneOrNoJoker) {
    if (noJokers) {
      const distinct = new Set(hand);
      if (distinct.size === 4) {
        return 1;
      }
    } else {
      const distinct = new Set(notJokers);
      if (distinct.size === 4) {
        return 1;
      }
    }
  }

  return 0;
};

await timedSolution(2, async () => {
  const letterCards = ["T", "Q", "K", "A"];
  return await loadFile(true).then(splitLines).then((lines) =>
    lines.map((line) => {
      const [hand, bid] = line.split(" ");
      const parsedHand = hand.split("").map((card) => {
        const index = letterCards.indexOf(card);
        if (index >= 0) {
          return 10 + index;
        }
        if (card === "J") {
          return 1;
        }
        return Number(card);
      });
      return {
        originalHand: hand,
        hand: parsedHand,
        bid: Number(bid),
        score: scoreWithJokers(parsedHand),
      };
    }).sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score;
      }
      for (let i = 0; i < a.hand.length; i++) {
        if (a.hand[i] !== b.hand[i]) {
          return b.hand[i] - a.hand[i];
        }
      }
      return 0;
    }).reduce(
      (sum, hand, rank, arr) => {
        return sum + hand.bid * (arr.length - rank);
      },
      0,
    )
  );
});
