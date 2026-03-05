import { Chord } from "./Chord";
import { Instrument, InstrumentInstance } from "./Instrument";

/**
 * A stringed instrument tuning.
 * name: a human‑friendly name for the tuning (e.g. "Standard Guitar", "Drop D", "Ukulele")
 * strings: an array of note names for each string, from top string (string 1) to bottom string (string N)
 * capo: the fret number of the capo (0 for no capo, 1+ for capo fret)
 */
export interface Tuning {
  name: string;
  strings: string[];
  capo: number;
}

/**
 * A finger placement for a chord voicing.
 * string: 1 is the top string, increasing downwards
 * fret: 1-12 for frets, 0 for open string
 * finger: 1=index, 2=middle, 3=ring, 4=pinky, 0=thumb or open
 * barre: number of strings barred by this finger (0 for no barre)
 * muted: true if the string should be muted (not played)
 * Note: open strings are not included in the result, as they require no finger placement.
 */
export interface FingerPlacement {
  string: number;
  fret: number;
  finger: number;
  barre: number;
  muted: boolean;
}

/**
 * A stringed instrument definition.
 * name: e.g. "Guitar", "Ukulele"
 * tunings: a list of tunings available for this instrument
 * tuning: the currently selected tuning index in the tunings array
 */
export interface StringedInstrument extends Instrument {
  tunings: Tuning[];
}

/**
 * Check if an object is a StringedInstrument by verifying it has the required properties.
 * @param obj the object to test
 * @return whether obj is a StringedInstrument
 */
export function isStringedInstrument(obj: any): obj is StringedInstrument {
  return (obj && typeof obj === "object" && "tunings" in obj && Array.isArray(obj.tunings));
}

/**
 * A stringed instrument instance with a specific tuning.
 * name: e.g. "Guitar", "Ukulele"
 * tuning: the currently selected tuning
 */
export interface StringedInstrumentInstance extends InstrumentInstance<StringedInstrument> {
  tuning: Tuning;
}

/**
 * Check if an object is a StringedInstrumentInstance by verifying it has the required properties.
 * @param obj the object to test
 * @returns wether obj is an StringedInstrumentInstance
 */
export function isStringedInstrumentInstance(obj: any): obj is StringedInstrumentInstance {
  return obj && typeof obj === "object" && obj.instrument && obj.tuning;
}

export const guitar: StringedInstrument = {
  name: "Guitar",
  image: "/src/assets/guitar.svg",
  tunings: [
    {
      name: "Standard Guitar",
      strings: ["E", "A", "D", "G", "B", "E"],
      capo: 0,
    },
    {
      name: "Drop D",
      strings: ["D", "A", "D", "G", "B", "E"],
      capo: 0,
    },
  ],
};

export const ukulele: StringedInstrument = {
  name: "Ukulele",
  image: "/src/assets/ukulele.svg",
  tunings: [
    {
      name: "Standard Ukulele",
      strings: ["G", "C", "E", "A"],
      capo: 0,
    },
    {
      name: "Baritone Ukulele",
      strings: ["D", "G", "B", "E"],
      capo: 0,
    },
    {
      name: "Traditional Hawaiian",
      strings: ["A", "D", "F#", "B"],
      capo: 0,
    },
  ],
};

export const stringedInstruments: StringedInstrument[] = [guitar, ukulele];


export const MAX_FRET = 12;
export const MAX_SPAN = 5; // max fret span for a playable voicing

// ── Helpers: note/semitone mapping ──────────────────────────────────

/** Convert a note name (sharp or flat) to a semitone index 0‑11 (A=0). */
function noteToSemitone(note: string): number {
  const idx = Chord.notesUp.indexOf(note);
  if (idx !== -1) return idx;
  return Chord.notesDown.indexOf(note);
}

/** Semitone produced by a given open‑string note at a given fret. */
function fretToSemitone(openNote: string, fret: number): number {
  return (noteToSemitone(openNote) + fret) % 12;
}

// ── Helpers: chord → interval set ───────────────────────────────────

/** Return the semitone intervals for a chord's type + additions + modifications. */
function getChordIntervals(
  type: string,
  add: string[],
  mod: string[],
): number[] {
  // Base triad intervals from chord type
  let intervals: Set<number>;
  switch (type) {
    case "m":
      intervals = new Set([0, 3, 7]);
      break;
    case "aug":
      intervals = new Set([0, 4, 8]);
      break;
    case "dim":
      intervals = new Set([0, 3, 6]);
      break;
    case "sus2":
      intervals = new Set([0, 2, 7]);
      break;
    case "sus4":
      intervals = new Set([0, 5, 7]);
      break;
    default:
      // major
      intervals = new Set([0, 4, 7]);
      break;
  }

  // Apply additions
  for (const a of add) {
    switch (a) {
      case "2":
        intervals.add(2);
        break;
      case "4":
        intervals.add(5);
        break;
      case "5":
        // power chord
        intervals = new Set([0, 7]);
        break;
      case "6":
      case "maj6":
        intervals.add(9);
        break;
      case "7":
        intervals.add(10);
        break;
      case "maj7":
        intervals.add(11);
        break;
      case "9":
        intervals.add(10);
        intervals.add(2);
        break;
      case "maj9":
        intervals.add(11);
        intervals.add(2);
        break;
      case "11":
        intervals.add(10);
        intervals.add(2);
        intervals.add(5);
        break;
      case "13":
        intervals.add(10);
        intervals.add(2);
        intervals.add(5);
        intervals.add(9);
        break;
    }
  }

  // Apply modifications
  for (const m of mod) {
    switch (m) {
      case "b3":
        intervals.delete(4);
        intervals.add(3);
        break;
      case "#4":
        intervals.add(6);
        break;
      case "#5":
        intervals.delete(7);
        intervals.add(8);
        break;
      case "b5":
        intervals.delete(7);
        intervals.add(6);
        break;
      case "b6":
        intervals.add(8);
        break;
      case "b9":
        intervals.add(1);
        break;
      case "#9":
        intervals.add(3);
        break;
      case "#11":
        intervals.add(6);
        break;
      case "b13":
        intervals.add(8);
        break;
      case "maj6":
        intervals.add(9);
        break;
      case "maj7":
        intervals.delete(10);
        intervals.add(11);
        break;
    }
  }

  return Array.from(intervals).sort((a, b) => a - b);
}

// ── Helpers: target notes ───────────────────────────────────────────

/** Compute the set of target semitones (0‑11) for a chord. */
function getTargetNotes(chord: Chord): Set<number> {
  const root = noteToSemitone(chord.key);
  return new Set(
    getChordIntervals(chord.type, chord.add, chord.mod).map(
      (i) => (root + i) % 12,
    ),
  );
}

// ── Helpers: fret enumeration ───────────────────────────────────────

/**
 * For each string, return the frets that produce a note
 * in the target set. Open strings (fret 0) are included if valid.
 * Muted strings are always included as fret -1.
 */
function getValidFretsPerString(
  tuning: Tuning,
  targetNotes: Set<number>,
): number[][] {
  return tuning.strings.map((openNote) => {
    const valid: number[] = [-1]; // include muted option
    for (let fret = tuning.capo; fret <= MAX_FRET; fret++) {
      if (targetNotes.has(fretToSemitone(openNote, fret))) {
        valid.push(fret);
      }
    }
    return valid;
  });
}

// ── Helpers: voicing validation & scoring ───────────────────────────

/** True when muted strings are only on the outside (no inner mutes). */
function hasValidMutePattern(frets: number[]): boolean {
  // Muted strings should only be at the top (low-pitch side).
  // Find first non-muted and last non-muted; everything between must be played.
  let first = -1;
  let last = -1;
  for (let i = 0; i < frets.length; i++) {
    if (frets[i] !== -1) {
      if (first === -1) first = i;
      last = i;
    }
  }
  if (first === -1) return false; // all muted
  for (let i = first; i <= last; i++) {
    if (frets[i] === -1) return false; // inner mute
  }
  return true;
}

/** True when every target note is present in the sounded notes (doubling allowed). */
function coversAllNotes(
  frets: number[],
  tuning: Tuning,
  targetNotes: Set<number>,
): boolean {
  const played = new Set<number>();
  for (let i = 0; i < frets.length; i++) {
    if (frets[i] === -1) continue;
    played.add(fretToSemitone(tuning.strings[i], frets[i]));
  }
  for (const t of targetNotes) {
    if (!played.has(t)) return false;
  }
  return true;
}

// ── Finger assignment with barre detection ──────────────────────────

const MAX_FINGERS = 4;

/**
 * Try to assign fingers to a fret-per-string voicing.
 * Returns null if the voicing is physically impossible.
 *
 * Strategy:
 * 1. Identify barre candidates: the lowest fret played on 2+ strings.
 * 2. Assign the index finger (1) to the barre.
 * 3. Assign remaining fingers (2, 3, 4) low-to-high fret, low-to-high string.
 * 4. If more fretted positions remain than available fingers, the voicing is unplayable.
 */
function assignFingers(frets: number[]): FingerPlacement[] | null {
  const entries: { string: number; fret: number; muted: boolean }[] = [];
  for (let i = 0; i < frets.length; i++) {
    if (frets[i] === -1) {
      entries.push({ string: i + 1, fret: 0, muted: true });
    } else if (frets[i] > 0) {
      entries.push({ string: i + 1, fret: frets[i], muted: false });
    }
    // fret 0 = open string, no entry needed
  }

  const fretted = entries.filter((e) => !e.muted && e.fret > 0);
  const muted = entries.filter((e) => e.muted);

  if (fretted.length === 0) {
    // All open/muted — no fingers needed
    return muted.map((m) => ({
      string: m.string,
      fret: 0,
      finger: 0,
      barre: 0,
      muted: true,
    }));
  }

  // Sort fretted notes: by fret ascending, then string ascending
  fretted.sort((a, b) => a.fret - b.fret || a.string - b.string);

  const minFret = fretted[0].fret;

  // Detect barre: if multiple strings at the minimum fret, or if we need
  // the barre to free up fingers for higher-fret notes.
  // A barre at fret F covers all strings from the barre string to the last string.
  let barreResult = tryWithBarre(fretted, minFret);
  let noBarre = tryWithoutBarre(fretted);

  // Pick the option that works
  let assignment: { placements: FingerPlacement[]; fingersUsed: number } | null = null;

  if (noBarre && barreResult) {
    // Prefer the one using fewer fingers; if tied, prefer no barre (simpler)
    assignment = noBarre.fingersUsed <= barreResult.fingersUsed ? noBarre : barreResult;
  } else {
    assignment = noBarre || barreResult;
  }

  if (!assignment) return null;

  // Add muted strings
  for (const m of muted) {
    assignment.placements.push({
      string: m.string,
      fret: 0,
      finger: 0,
      barre: 0,
      muted: true,
    });
  }

  return assignment.placements;
}

function tryWithoutBarre(
  fretted: { string: number; fret: number }[],
): { placements: FingerPlacement[]; fingersUsed: number } | null {
  if (fretted.length > MAX_FINGERS) return null;

  const placements: FingerPlacement[] = [];
  let finger = 1;
  for (const f of fretted) {
    placements.push({
      string: f.string,
      fret: f.fret,
      finger: finger,
      barre: 0,
      muted: false,
    });
    finger++;
  }
  return { placements, fingersUsed: fretted.length };
}

function tryWithBarre(
  fretted: { string: number; fret: number }[],
  barreFret: number,
): { placements: FingerPlacement[]; fingersUsed: number } | null {
  // Notes at the barre fret
  const atBarre = fretted.filter((f) => f.fret === barreFret);
  const aboveBarre = fretted.filter((f) => f.fret > barreFret);

  if (atBarre.length < 1) return null;

  // The barre spans from the first string at barreFret to the last string in atBarre
  const barreFirstString = Math.min(...atBarre.map((f) => f.string));
  const barreLastString = Math.max(...atBarre.map((f) => f.string));
  const barreSpan = barreLastString - barreFirstString;

  // Only use barre if it actually covers 2+ strings or we need it to free up fingers
  if (barreSpan === 0 && aboveBarre.length + atBarre.length <= MAX_FINGERS) return null;

  const remainingFingers = MAX_FINGERS - 1; // 1 finger used for barre
  if (aboveBarre.length > remainingFingers) return null;

  const placements: FingerPlacement[] = [];

  // Barre placement on the first (highest-pitch, lowest-numbered) string
  placements.push({
    string: barreFirstString,
    fret: barreFret,
    finger: 1,
    barre: barreSpan,
    muted: false,
  });

  // Assign remaining fingers to above-barre notes, sorted low fret → high fret, then low string → high string
  aboveBarre.sort((a, b) => a.fret - b.fret || a.string - b.string);
  let finger = 2;
  for (const f of aboveBarre) {
    placements.push({
      string: f.string,
      fret: f.fret,
      finger: finger,
      barre: 0,
      muted: false,
    });
    finger++;
  }

  return { placements, fingersUsed: 1 + aboveBarre.length };
}

// ── Voicing scoring ─────────────────────────────────────────────────

/**
 * Score a voicing — lower is better.
 *
 * Criteria (weighted):
 * - Root in bass: strongly prefer the chord root as the lowest sounding note
 * - Open strings: prefer voicings with open strings (easier to play)
 * - Low position: prefer voicings near the nut
 * - Fret span: prefer smaller stretches
 * - Muted strings: penalize muted strings (harder to control when strumming)
 * - Number of sounding strings: prefer more strings ringing
 * - Finger count: prefer fewer fingers needed
 */
function scoreVoicing(
  frets: number[],
  tuning: Tuning,
  rootSemitone: number,
  bassSemitone: number,
): number {
  let score = 0;

  const sounded: { string: number; fret: number }[] = [];
  let mutedCount = 0;
  let openCount = 0;

  for (let i = 0; i < frets.length; i++) {
    if (frets[i] === -1) {
      mutedCount++;
    } else {
      sounded.push({ string: i + 1, fret: frets[i] });
      if (frets[i] === 0) openCount++;
    }
  }

  if (sounded.length === 0) return Infinity;

  const fretted = sounded.filter((s) => s.fret > 0);
  const minFret = fretted.length > 0 ? Math.min(...fretted.map((s) => s.fret)) : 0;
  const maxFret = fretted.length > 0 ? Math.max(...fretted.map((s) => s.fret)) : 0;
  const span = maxFret - minFret;

  // ── Bass note check ──
  // The lowest sounding string's note
  const lowestSounded = sounded[0]; // strings are in order, 0 = lowest pitch string
  const bassNote = fretToSemitone(tuning.strings[lowestSounded.string - 1], lowestSounded.fret);

  if (bassNote !== bassSemitone) {
    // If chord has a specific bass (slash chord), heavily penalize wrong bass
    score += 80;
  }

  if (bassNote !== rootSemitone && bassNote !== bassSemitone) {
    // Non-root, non-specified-bass in the bass — penalize
    score += 40;
  }

  // ── Position: prefer open/low positions ──
  score += minFret * 6;

  // ── Open strings: reward ──
  score -= openCount * 4;

  // ── Fret span: penalize wide stretches ──
  score += span * 5;

  // ── Muted strings: penalize ──
  score += mutedCount * 12;

  // ── Finger count: penalize ──
  score += fretted.length * 2;

  // ── Prefer more sounding strings ──
  score -= sounded.length * 2;

  return score;
}

// ── Voicing search ──────────────────────────────────────────────────

/**
 * Enumerate valid, playable voicings that cover every target note.
 * Uses pruning to limit the search space:
 * - Track which target notes are covered; prune branches that can't complete coverage
 * - Enforce fret span constraint early
 */
function findVoicings(
  validFretsPerString: number[][],
  tuning: Tuning,
  targetNotes: Set<number>,
  rootSemitone: number,
  bassSemitone: number,
  maxResults: number = 500,
): { frets: number[]; score: number }[] {
  const results: { frets: number[]; score: number }[] = [];
  const numStrings = validFretsPerString.length;
  const current: number[] = new Array(numStrings);
  const targetArr = Array.from(targetNotes);

  function enumerate(idx: number, coveredMask: number, minF: number, maxF: number): void {
    if (results.length >= maxResults) return;

    if (idx === numStrings) {
      // Check all target notes are covered
      const allCovered = coveredMask === (1 << targetArr.length) - 1;
      if (!allCovered) return;
      if (!hasValidMutePattern(current)) return;

      const score = scoreVoicing(current, tuning, rootSemitone, bassSemitone);
      results.push({ frets: [...current], score });
      return;
    }

    // How many strings remain after this one
    const remaining = numStrings - idx - 1;

    for (const fret of validFretsPerString[idx]) {
      // Compute new span bounds
      let newMin = minF;
      let newMax = maxF;
      if (fret > 0) {
        newMin = minF === 0 ? fret : Math.min(minF, fret);
        newMax = maxF === 0 ? fret : Math.max(maxF, fret);
        if (newMax - newMin >= MAX_SPAN) continue; // span too wide, prune
      }

      // Update coverage mask
      let newMask = coveredMask;
      if (fret >= 0) {
        const sem = fretToSemitone(tuning.strings[idx], fret);
        for (let t = 0; t < targetArr.length; t++) {
          if (targetArr[t] === sem) newMask |= (1 << t);
        }
      }

      // Prune: can we still cover all remaining uncovered notes?
      // Count uncovered notes and see if enough strings remain
      const uncovered = targetArr.length - popcount(newMask);
      if (uncovered > remaining + 1) continue; // +1 because this string is being set now but remaining strings left

      // Actually: remaining = strings AFTER idx. If uncovered > remaining, prune.
      // But we already set current[idx] = fret, so the remaining strings to fill are (remaining).
      if (uncovered > remaining) continue;

      current[idx] = fret;
      enumerate(idx + 1, newMask, newMin, newMax);
    }
  }

  enumerate(0, 0, 0, 0);
  return results;
}

function popcount(n: number): number {
  let c = 0;
  while (n) { c += n & 1; n >>= 1; }
  return c;
}

// ── Combined: finger assignment + scoring → pick best ───────────────

function fretsToFingerPlacements(
  frets: number[],
  tuning: Tuning,
  rootSemitone: number,
  bassSemitone: number,
): { fingerPlacements: FingerPlacement[]; score: number } | null {
  const placements = assignFingers(frets);
  if (!placements) return null; // unplayable

  const score = scoreVoicing(frets, tuning, rootSemitone, bassSemitone);
  return { fingerPlacements: placements, score };
}

// ── Public API ──────────────────────────────────────────────────────

/**
 * Given a Chord and a tuning, return the finger placements of the best
 * voicing (open strings have no placement entry).
 *
 * Algorithm:
 * 1. Derive the interval pattern from the chord type/additions/modifications.
 * 2. Map intervals to absolute target semitones.
 * 3. For each string, list frets that produce a target note (doubling allowed).
 * 4. Enumerate combinations with pruning (fret span, coverage, mute pattern).
 * 5. Assign fingers with barre detection; reject unplayable voicings.
 * 6. Score and return the best voicing.
 */
export function chordToFingerPlacements(
  chord: Chord,
  tuning: Tuning,
): FingerPlacement[] | null {
  const targetNotes = getTargetNotes(chord);
  const rootSemitone = noteToSemitone(chord.key);
  const bassSemitone = noteToSemitone(chord.bass);

  // More distinct notes than strings → can't cover them all
  if (targetNotes.size > tuning.strings.length) return null;

  const validFretsPerString = getValidFretsPerString(tuning, targetNotes);
  const voicings = findVoicings(
    validFretsPerString,
    tuning,
    targetNotes,
    rootSemitone,
    bassSemitone,
  );

  if (voicings.length === 0) return null;

  // Pre-sort voicings by raw score and only try finger assignment on top candidates
  voicings.sort((a, b) => a.score - b.score);
  const topCandidates = voicings.slice(0, 100);

  let best: { fingerPlacements: FingerPlacement[]; score: number } | null = null;

  for (const v of topCandidates) {
    const result = fretsToFingerPlacements(v.frets, tuning, rootSemitone, bassSemitone);
    if (!result) continue; // unplayable (too many fingers needed)
    if (!best || result.score < best.score) {
      best = result;
    }
  }

  return best ? best.fingerPlacements : null;
}
