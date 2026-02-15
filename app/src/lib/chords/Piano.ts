// Piano-related utilities and types
export interface PianoKey {
	note: string;
	isBlack: boolean;
	isPlayed: boolean;
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
	 * Generate the piano keys for a given range with played notes highlighted
	 */
	static generatePianoKeys(chordNotes: string[]): PianoKey[] {
		if (chordNotes.length === 0) return [];

		// Normalize all chord notes to sharps for comparison
		const normalizedChordNotes = chordNotes.map(n => this.normalizeNote(n));
		
		// Find the leftmost and rightmost white keys
		const firstNote = chordNotes[0];
		const lastNote = chordNotes[chordNotes.length - 1];
		
		const startWhiteKey = this.getLeftWhiteKey(firstNote);
		const endWhiteKey = this.getRightWhiteKey(lastNote);
		
		// Generate the sequence of white keys
		const startIndex = this.whiteNotes.indexOf(startWhiteKey);
		const endIndex = this.whiteNotes.indexOf(endWhiteKey);
		
		const keys: PianoKey[] = [];
		
		// Handle wrapping around the octave
		let currentIndex = startIndex;
		let iterations = 0;
		const maxIterations = 14; // Max 2 octaves
		
		while (iterations < maxIterations) {
			const whiteNote = this.whiteNotes[currentIndex];
			
			// Add white key
			keys.push({
				note: whiteNote,
				isBlack: false,
				isPlayed: normalizedChordNotes.includes(this.normalizeNote(whiteNote)),
			});
			
			// Add black key if exists
			const blackNote = this.blackNoteMap[whiteNote];
			if (blackNote) {
				keys.push({
					note: blackNote,
					isBlack: true,
					isPlayed: normalizedChordNotes.includes(this.normalizeNote(blackNote)),
				});
			}
			
			// Break if we've reached the end
			if (currentIndex === endIndex && iterations > 0) {
				break;
			}
			
			currentIndex = (currentIndex + 1) % 7;
			iterations++;
		}
		
		return keys;
	}
}
