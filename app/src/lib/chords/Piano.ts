import { Instrument, InstrumentInstance } from "./Instrument";

/**
 * Defines the Piano interface extending the base Instrument interface.
 * This allows us to represent a piano as an instrument with a name and image,
 * while also providing a clear type for piano-specific functionality in the future.
 */
export interface Piano extends Instrument {
	// No additional properties needed for now, but this allows us to easily extend in the future
}

/**
 * Export a constant interface for the piano instrument instance.
 */
export interface PianoInstance extends InstrumentInstance<Piano> {
	instrument: Piano;
}

export const piano: Piano = {
	name: "Piano",
	image: "/src/assets/piano.svg",
};

// Piano-related utilities and types
export interface PianoKey {
	note: string;
	isBlack: boolean;
	isPlayed: boolean;
	blackKeyAfter?: PianoKey | null;
}

export class Piano {
	// White keys in order
	private static readonly whiteNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
	
	// Black keys with their positions (null means no black key after this white key)
	private static readonly blackNoteMap: { [key: string]: string | null } = {
		'C': 'C#',
		'D': 'D#',
		'E': null,
		'F': 'F#',
		'G': 'G#',
		'A': 'A#',
		'B': null,
	};

	/**
	 * Get the white key to the left of or at the given note
	 */
	static getLeftWhiteKey(note: string): string {
		// If it's already a white key, return it
		if (this.whiteNotes.includes(note)) {
			return note;
		}
		
		// It's a black key (sharp or flat)
		// Map sharps/flats to their base white keys
		const baseNote = note.replace('#', '').replace('b', '');
		
		// For sharps like C#, the white key to the left is C
		if (note.includes('#')) {
			return baseNote;
		}
		
		// For flats like Db, the white key to the left is C (one step down)
		const baseIndex = this.whiteNotes.indexOf(baseNote);
		if (baseIndex === -1) return 'C';
		
		// Go one step back in white keys
		const leftIndex = (baseIndex - 1 + 7) % 7;
		return this.whiteNotes[leftIndex];
	}

	/**
	 * Get the white key to the right of or at the given note
	 */
	static getRightWhiteKey(note: string): string {
		// If it's already a white key, return it
		if (this.whiteNotes.includes(note)) {
			return note;
		}
		
		// It's a black key (sharp or flat)
		const baseNote = note.replace('#', '').replace('b', '');
		const baseIndex = this.whiteNotes.indexOf(baseNote);
		if (baseIndex === -1) return 'C';
		
		// For sharps like C#, the white key to the right is D (one step up)
		if (note.includes('#')) {
			const rightIndex = (baseIndex + 1) % 7;
			return this.whiteNotes[rightIndex];
		}
		
		// For flats like Db, the white key to the right is D (the base note itself)
		return baseNote;
	}

	/**
	 * Normalize notes to use sharps for comparison
	 */
	static normalizeNote(note: string): string {
		const flatToSharp: { [key: string]: string } = {
			'Db': 'C#',
			'Eb': 'D#',
			'Gb': 'F#',
			'Ab': 'G#',
			'Bb': 'A#',
		};
		
		return flatToSharp[note] || note;
	}

	/**
	 * Get the chromatic index of a note (C=0, C#/Db=1, ..., B=11)
	 */
	static getNoteIndex(note: string): number {
		const normalized = this.normalizeNote(note);
		const noteMap: { [key: string]: number } = {
			'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
			'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
		};
		return noteMap[normalized] ?? -1;
	}

	/**
	 * Sort notes in chromatic order
	 */
	static sortNotesByPitch(notes: string[]): string[] {
		return notes.slice().sort((a, b) => {
			const indexA = this.getNoteIndex(a);
			const indexB = this.getNoteIndex(b);
			return indexA - indexB;
		});
	}

	/**
	 * Generate the piano keys for a given range with played notes highlighted
	 * Notes are displayed in the order they appear in chordNotes, left to right
	 */
	static generatePianoKeys(chordNotes: string[]): PianoKey[] {
		if (chordNotes.length === 0) return [];

		// Keep ALL notes including duplicates (important for slash chords like D/F# where F# appears twice)
		// Calculate the actual pitch (with octave) for each note in sequence order
		const allNotes = chordNotes;
		const notePitches: number[] = []; // Absolute pitch for each note (0-11 is octave 0, 12-23 is octave 1, etc.)
		
		// Build the range based on note order (using ALL notes including duplicates)
		// Each note should be to the right of the previous one
		const firstNote = allNotes[0];
		let currentPitch = this.getNoteIndex(firstNote); // Start in "octave 0"
		notePitches.push(currentPitch);
		let highestPitch = currentPitch;
		let lowestPitch = currentPitch;
		
		// Calculate the absolute pitch for each note, ensuring sequence order
		for (let i = 1; i < allNotes.length; i++) {
			const notePitch = this.getNoteIndex(allNotes[i]);
			
			// If this note's pitch is less than or equal to current, it's in the next octave
			if (notePitch <= currentPitch % 12) {
				// Move to next octave
				currentPitch = Math.floor(currentPitch / 12) * 12 + 12 + notePitch;
			} else {
				// Same octave as current
				currentPitch = Math.floor(currentPitch / 12) * 12 + notePitch;
			}
			
			notePitches.push(currentPitch);
			if (currentPitch > highestPitch) {
				highestPitch = currentPitch;
			}
			if (currentPitch < lowestPitch) {
				lowestPitch = currentPitch;
			}
		}
		
		// Find the actual first and last notes in the display range
		const chromaticNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
		const startPitch = lowestPitch;
		const endPitch = highestPitch;
		
		const startNote = chromaticNotes[startPitch % 12];
		const endNote = chromaticNotes[endPitch % 12];
		
		// Ensure we start with a white key
		const startWhiteKey = this.getLeftWhiteKey(startNote);
		const startWhiteKeyPitch = this.getNoteIndex(startWhiteKey);
		// Adjust to the correct octave (at or before lowestPitch)
		let startAbsolutePitch = Math.floor(startPitch / 12) * 12 + startWhiteKeyPitch;
		if (startAbsolutePitch > lowestPitch) {
			startAbsolutePitch -= 12;
		}
		
		// Ensure we end with a white key
		let endWhiteKey: string;
		if (this.whiteNotes.includes(endNote)) {
			endWhiteKey = endNote;
		} else {
			endWhiteKey = this.getRightWhiteKey(endNote);
		}
		
		// Generate the sequence of white keys
		const startIndex = this.whiteNotes.indexOf(startWhiteKey);
		
		const keys: PianoKey[] = [];
		
		// Track which INDEX in chordNotes we're currently trying to highlight
		// This ensures we highlight notes in the EXACT order they appear in the array
		let nextIndexToHighlight = 0;
		
		let currentIndex = startIndex;
		let currentWhiteNote = this.whiteNotes[currentIndex];
		let currentWhiteNotePitch = this.getNoteIndex(currentWhiteNote);
		let currentOctave = Math.floor(startAbsolutePitch / 12);
		let currentAbsolutePitch = currentOctave * 12 + currentWhiteNotePitch;
		
		// Continue until we've highlighted all notes and passed the highest pitch
		while (currentAbsolutePitch <= highestPitch + 12) {
			const whiteNote = this.whiteNotes[currentIndex];
			const whiteNotePitch = this.getNoteIndex(whiteNote);
			const whiteAbsolutePitch = currentAbsolutePitch;
			
			// Check if this white key matches the NEXT note to highlight (in sequence)
			let whiteKeyPlayed = false;
			if (nextIndexToHighlight < notePitches.length && 
				notePitches[nextIndexToHighlight] === whiteAbsolutePitch) {
				whiteKeyPlayed = true;
				nextIndexToHighlight++;
			}
			
			// Get the black key after this white key if exists
			const blackNote = this.blackNoteMap[whiteNote];
			let blackKeyAfter: PianoKey | null = null;
			
			if (blackNote) {
				const blackNotePitch = this.getNoteIndex(blackNote);
				const blackAbsolutePitch = currentOctave * 12 + blackNotePitch;
				
				// Check if this black key matches the NEXT note to highlight (in sequence)
				let blackKeyPlayed = false;
				if (nextIndexToHighlight < notePitches.length && 
					notePitches[nextIndexToHighlight] === blackAbsolutePitch) {
					blackKeyPlayed = true;
					nextIndexToHighlight++;
				}
				blackKeyAfter = {
					note: blackNote,
					isBlack: true,
					isPlayed: blackKeyPlayed,
				};
			}
			
			// Add white key with its black key
			keys.push({
				note: whiteNote,
				isBlack: false,
				isPlayed: whiteKeyPlayed,
				blackKeyAfter: blackKeyAfter,
			});
			
			// Break if we've highlighted all notes in sequence
			if (nextIndexToHighlight >= allNotes.length) {
				break;
			}
			
			// Move to next white key
			const prevWhiteNotePitch = whiteNotePitch;
			currentIndex = (currentIndex + 1) % 7;
			currentWhiteNote = this.whiteNotes[currentIndex];
			currentWhiteNotePitch = this.getNoteIndex(currentWhiteNote);
			
			// Check if we wrapped around to next octave
			if (currentWhiteNotePitch <= prevWhiteNotePitch) {
				currentOctave++;
			}
			currentAbsolutePitch = currentOctave * 12 + currentWhiteNotePitch;
		}
		
		return keys;
	}
}
