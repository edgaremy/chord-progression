import { Chord } from "./Chord";

export interface FingerPlacement {
  string: number; // 1-4 for ukulele strings
  fret: number; // 1-12 for frets
  finger: number; // 1-5 for fingers (1=index, 2=middle, 3=ring, 4=pinky, 5=thumb)
  barre: number; // 0 for no barre, or fret number for barre chords
}

const MAX_FRET = 12;
const MAX_SPAN = 6; // max fret span for a playable voicing

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
 * For each string, return the frets (0 … MAX_FRET) that produce a note
 * in the target set.
 */
function getValidFretsPerString(
  tune: string[],
  targetNotes: Set<number>,
): number[][] {
  return tune.map((openNote) => {
    const valid: number[] = [];
    for (let fret = 0; fret <= MAX_FRET; fret++) {
      if (targetNotes.has(fretToSemitone(openNote, fret))) {
        valid.push(fret);
      }
    }
    return valid;
  });
}

// ── Helpers: voicing validation & scoring ───────────────────────────

/** True when the fretted‑note span fits within MAX_SPAN frets. */
function isPlayable(frets: number[]): boolean {
  const fretted = frets.filter((f) => f > 0);
  if (fretted.length === 0) return true;
  return Math.max(...fretted) - Math.min(...fretted) <= MAX_SPAN;
}

/** True when the voicing sounds *exactly* the target note set. */
function coversAllNotes(
  frets: number[],
  tune: string[],
  targetNotes: Set<number>,
): boolean {
  const played = new Set<number>();
  for (let i = 0; i < frets.length; i++) {
    played.add(fretToSemitone(tune[i], frets[i]));
  }
  if (played.size !== targetNotes.size) return false;
  const targetArr = Array.from(targetNotes);
  for (let i = 0; i < targetArr.length; i++) {
    if (!played.has(targetArr[i])) return false;
  }
  return true;
}

/**
 * Score a voicing — lower is better.
 * Prefers open chords, small spans, and low fret positions.
 */
function scoreVoicing(frets: number[]): number {
  const fretted = frets.filter((f) => f > 0);
  if (fretted.length === 0) return 0;
  const minFret = Math.min(...fretted);
  const span = Math.max(...fretted) - minFret;
  const sum = fretted.reduce((a, b) => a + b, 0);
  return minFret * 3 + span * 2 + sum;
}

// ── Voicing search ──────────────────────────────────────────────────

/** Enumerate all valid, playable voicings that cover every target note. */
function findAllVoicings(
  validFretsPerString: number[][],
  tune: string[],
  targetNotes: Set<number>,
): number[][] {
  const results: number[][] = [];
  const numStrings = validFretsPerString.length;
  const current: number[] = new Array(numStrings);

  function enumerate(idx: number): void {
    if (idx === numStrings) {
      if (isPlayable(current) && coversAllNotes(current, tune, targetNotes)) {
        results.push([...current]);
      }
      return;
    }
    for (const fret of validFretsPerString[idx]) {
      current[idx] = fret;
      enumerate(idx + 1);
    }
  }

  enumerate(0);
  return results;
}

// ── Finger assignment ───────────────────────────────────────────────

/** Convert a fret‑per‑string array into FingerPlacement[]. Open strings are omitted. */
function fretsToFingerPlacements(frets: number[]): FingerPlacement[] {
  const fretted = frets
    .map((fret, i) => ({ string: i + 1, fret }))
    .filter((f) => f.fret > 0)
    .sort((a, b) => a.fret - b.fret || a.string - b.string);

  return fretted.map((f, idx) => ({
    string: f.string,
    fret: f.fret,
    finger: idx + 1,
    barre: 0,
  }));
}

// ── Public API ──────────────────────────────────────────────────────

/**
 * Given a Chord and a tuning, return the finger placements of the best
 * voicing (open strings have no placement entry).
 *
 * Algorithm:
 * 1. Derive the interval pattern from the chord type/additions/modifications.
 * 2. Map intervals to absolute target semitones.
 * 3. For each string, list frets that produce a target note.
 * 4. Enumerate all combinations that contain *all and only* target notes
 *    and are physically playable (fret span ≤ MAX_SPAN).
 * 5. Score and return the best voicing.
 */
export function chordToFingerPlacements(
  chord: Chord,
  tune: string[] = ["G", "C", "E", "A"],
): FingerPlacement[] | null {
  const targetNotes = getTargetNotes(chord);

  // More distinct notes than strings → can't cover them all
  if (targetNotes.size > tune.length) return null;

  const validFretsPerString = getValidFretsPerString(tune, targetNotes);
  const voicings = findAllVoicings(validFretsPerString, tune, targetNotes);

  if (voicings.length === 0) return null;

  // Pick the best voicing (lowest score)
  voicings.sort((a, b) => scoreVoicing(a) - scoreVoicing(b));
  return fretsToFingerPlacements(voicings[0]);
}
