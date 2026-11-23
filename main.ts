// One Letter for Your Day — make.fun entry (program/v1).
//
// The entry is exactly ONE letter, A-Z, standing for the word that
// describes the day. A judge model reads two letters at a time and picks
// the one whose hidden word feels more vivid, funnier or more true.
//
// This program scores a shortlist of letter + hidden-word candidates
// against the judge's brief (vivid first, then funny, then true, then
// how well the letter fits its word) and writes the winner — one
// character, no newline — to /output/entry.txt.
//
// Deterministic: no network, no model calls, no randomness, no clock.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

type Candidate = {
  letter: string;
  word: string; // the hidden word behind the letter
  vivid: number; // 1-5: specific, sharp picture of the day
  funny: number; // 1-5: lands at once, repeatable to a friend
  truth: number; // 1-5: an honest report of a real day
  fit: number; // 1-5: the letter is the word's unmistakable initial
};

// The shortlist, brainstormed against the brief. The judge sees only
// the letter, so a candidate only counts if its word is the FIRST word
// a reader thinks of for that letter.
// Why Z wins, in the brief's order:
//   - Vivid: "zero sleep" paints one sharp picture — 3 a.m., red eyes,
//     an empty coffee cup. No vague mood, one concrete night.
//   - Funny: "zero" is a punchline you repeat to a friend, and Z doubles
//     as "Zzz", so either reading of the letter lands.
//   - True: a zero-sleep day is universal and honestly reported.
//   - Fit: Z is the unmistakable initial of "zero" — no rival word
//     competes for the letter, so the judge's first guess IS the word.
//     (The brief itself gives "Z for zero sleep" as its example.)
// Runners-up lose on fit: H reads "happy" before "hungover", P reads
// "productive" before "procrastinating", C reads "calm" before "chaos".
const CANDIDATES: Candidate[] = [
  { letter: "Z", word: "zero sleep", vivid: 5, funny: 5, truth: 5, fit: 5 },
  { letter: "H", word: "hungover", vivid: 5, funny: 4, truth: 4, fit: 3 },
  { letter: "C", word: "chaos", vivid: 4, funny: 3, truth: 4, fit: 3 },
  { letter: "M", word: "meltdown", vivid: 4, funny: 4, truth: 4, fit: 3 },
  { letter: "P", word: "procrastinating", vivid: 4, funny: 4, truth: 5, fit: 3 },
  { letter: "W", word: "wrecked", vivid: 4, funny: 4, truth: 4, fit: 3 },
  { letter: "D", word: "doomed", vivid: 3, funny: 4, truth: 3, fit: 3 },
  { letter: "S", word: "surviving", vivid: 3, funny: 4, truth: 5, fit: 3 },
  { letter: "U", word: "unbothered", vivid: 2, funny: 4, truth: 4, fit: 3 },
  { letter: "V", word: "vibing", vivid: 2, funny: 3, truth: 4, fit: 3 },
  { letter: "K", word: "knackered", vivid: 4, funny: 4, truth: 4, fit: 2 },
  { letter: "E", word: "exhausted", vivid: 3, funny: 2, truth: 5, fit: 4 },
  { letter: "F", word: "Friday-feeling", vivid: 3, funny: 3, truth: 3, fit: 4 },
  { letter: "Q", word: "quitting everything", vivid: 3, funny: 4, truth: 3, fit: 2 },
];

// Score in the brief's own order: vivid, then funny, then true, then fit.
// Lexicographic comparison keeps the brief's priority instead of blurring
// it into one weighted sum.
function score(c: Candidate): [number, number, number, number] {
  return [c.vivid, c.funny, c.truth, c.fit];
}

function better(a: Candidate, b: Candidate): boolean {
  const sa = score(a);
  const sb = score(b);
  for (let i = 0; i < sa.length; i++) {
    if (sa[i] !== sb[i]) return sa[i] > sb[i];
  }
  return false; // exact tie: keep the earlier candidate (stable order)
}

let best = CANDIDATES[0];
for (const c of CANDIDATES.slice(1)) {
  if (better(c, best)) best = c;
}

const letter = best.letter;

// Gate self-check: the entry must be exactly one A-Z character.
if (!/^[A-Z]$/.test(letter)) {
  throw new Error(`invalid entry letter: ${JSON.stringify(letter)}`);
}

mkdirSync("/output", { recursive: true });
// Exactly one character, no trailing newline: the gate allows 1 to 1
// characters, so a newline would make the file 2 characters long.
writeFileSync("/output/entry.txt", letter, "utf8");

// Read it back and re-check: the file the grader gates must be the
// letter alone, nothing else.
const written = readFileSync("/output/entry.txt", "utf8");
if (written !== letter) {
  throw new Error(
    `entry.txt mismatch: wrote ${JSON.stringify(letter)}, read back ${JSON.stringify(written)}`,
  );
}

console.log(`entry: ${letter} (${best.word})`);
