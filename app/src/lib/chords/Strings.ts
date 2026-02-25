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
  tuning: Tuning,
  targetNotes: Set<number>,
): boolean {
  const played = new Set<number>();
  for (let i = 0; i < frets.length; i++) {
    if (frets[i] === -1) continue; // muted string
    played.add(fretToSemitone(tuning.strings[i], frets[i]));
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
  tuning: Tuning,
  targetNotes: Set<number>,
): number[][] {
  const results: number[][] = [];
  const numStrings = validFretsPerString.length;
  const current: number[] = new Array(numStrings);

  function enumerate(idx: number): void {
    if (idx === numStrings) {
      if (isPlayable(current) && coversAllNotes(current, tuning, targetNotes)) {
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
    .map((fret, i) => ({ string: i + 1, fret: Math.max(fret, 0), muted: fret === -1 }))
    .filter((f) => f.fret > 0 || f.muted)
    .sort((a, b) => a.fret - b.fret || a.string - b.string);

  return fretted.map((f, idx) => ({
    string: f.string,
    fret: f.fret,
    finger: idx + 1,
    barre: 0,
    muted: f.muted,
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
  tuning: Tuning,
): FingerPlacement[] | null {
  const targetNotes = getTargetNotes(chord);

  // More distinct notes than strings → can't cover them all
  if (targetNotes.size > tuning.strings.length) return null;

  const validFretsPerString = getValidFretsPerString(tuning, targetNotes);
  const voicings = findAllVoicings(validFretsPerString, tuning, targetNotes);

  if (voicings.length === 0) return null;

  // Pick the best voicing (lowest score)
  voicings.sort((a, b) => scoreVoicing(a) - scoreVoicing(b));
  return fretsToFingerPlacements(voicings[0]);
}
