// Common guitar chord shapes
import type { GuitarFingerPlacement } from './Guitar';

/**
 * Guitar chord shape definition
 * All fret numbers are relative to the starting position (0 = start fret)
 * -1 means muted string, 0-4 are fret offsets
 */
export interface GuitarChordShape {
	name: string;
	rootNote: string; // The root note this shape is based on (e.g., 'E', 'A', 'C')
	rootString: number; // Which string the root is on (1-6, where 1 is high E)
	// Array of 6 numbers (one per string, from string 6 to string 1)
	// -1 = muted, 0-20 = fret offset from root position
	frets: number[];
	// Finger assignments (0 = open, 1-4 = fingers, -1 = muted)
	fingers: number[];
	// Optional barre information
	barres?: { fret: number; strings: number[] }[];
}

export class GuitarChords {
	// All notes in chromatic order
	private static readonly chromaticNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

	/**
	 * Common guitar chord shapes library
	 * Using movable (fretted) shapes that can be transposed up the neck
	 * All shapes start at fret 1 and can be moved up
	 * Arrays are ordered from string 1 to 6 (high E to low E, left to right on diagram)
	 */
	private static readonly shapes: { [key: string]: GuitarChordShape[] } = {
		// Major chord shapes - using barre chord shapes
		'major': [
			// E-shape barre chord (root on 6th string, starting at fret 1 = F major)
			{
				name: 'E-shape barre',
				rootNote: 'F',
				rootString: 6,
				frets: [1, 1, 2, 3, 3, 1], // high E, B, G, D, A, low E (strings 1-6)
				fingers: [1, 1, 2, 4, 3, 1],
				barres: [{ fret: 1, strings: [6, 1] }],
			},
			// A-shape barre chord (root on 5th string, starting at fret 1 = A# major)
			{
				name: 'A-shape barre',
				rootNote: 'A#',
				rootString: 5,
				frets: [1, 3, 3, 3, 1, -1], // high E, B, G, D, A, x (strings 1-6)
				fingers: [1, 3, 3, 3, 1, -1],
				barres: [{ fret: 1, strings: [5, 1] }],
			},
		],
		
		// Minor chord shapes - using barre chord shapes
		'minor': [
			// Em-shape barre chord (root on 6th string, starting at fret 1 = Fm)
			{
				name: 'Em-shape barre',
				rootNote: 'F',
				rootString: 6,
				frets: [1, 1, 1, 3, 3, 1], // high E, B, G, D, A, low E (strings 1-6)
				fingers: [1, 1, 1, 4, 3, 1],
				barres: [{ fret: 1, strings: [6, 1] }],
			},
			// Am-shape barre chord (root on 5th string, starting at fret 1 = A#m)
			{
				name: 'Am-shape barre',
				rootNote: 'A#',
				rootString: 5,
				frets: [1, 2, 3, 3, 1, -1], // high E, B, G, D, A, x (strings 1-6)
				fingers: [1, 2, 4, 3, 1, -1],
				barres: [{ fret: 1, strings: [5, 1] }],
			},
		],
		
		// Dominant 7th chord shapes - using barre chord shapes
		'7': [
			// E7-shape barre chord (root on 6th string, starting at fret 1 = F7)
			{
				name: 'E7-shape barre',
				rootNote: 'F',
				rootString: 6,
				frets: [1, 1, 2, 1, 3, 1], // high E, B, G, D, A, low E (strings 1-6)
				fingers: [1, 1, 2, 1, 3, 1],
				barres: [{ fret: 1, strings: [6, 1] }],
			},
			// A7-shape barre chord (root on 5th string, starting at fret 1 = A#7)
			{
				name: 'A7-shape barre',
				rootNote: 'A#',
				rootString: 5,
				frets: [1, 3, 1, 3, 1, -1], // high E, B, G, D, A, x (strings 1-6)
				fingers: [1, 4, 1, 3, 1, -1],
				barres: [{ fret: 1, strings: [5, 1] }],
			},
		],
		
		// Major 7th chord shapes - using barre chord shapes
		'maj7': [
			// Emaj7-shape barre chord (root on 6th string, starting at fret 1 = Fmaj7)
			{
				name: 'Emaj7-shape barre',
				rootNote: 'F',
				rootString: 6,
				frets: [1, 1, 2, 2, 3, 1], // high E, B, G, D, A, low E (strings 1-6)
				fingers: [1, 1, 2, 2, 3, 1],
				barres: [{ fret: 1, strings: [6, 1] }],
			},
			// Amaj7-shape barre chord (root on 5th string, starting at fret 1 = A#maj7)
			{
				name: 'Amaj7-shape barre',
				rootNote: 'A#',
				rootString: 5,
				frets: [1, 3, 2, 3, 1, -1], // high E, B, G, D, A, x (strings 1-6)
				fingers: [1, 4, 2, 3, 1, -1],
				barres: [{ fret: 1, strings: [5, 1] }],
			},
		],
		
		// Minor 7th chord shapes - using barre chord shapes
		'min7': [
			// Em7-shape barre chord (root on 6th string, starting at fret 1 = Fm7)
			{
				name: 'Em7-shape barre',
				rootNote: 'F',
				rootString: 6,
				frets: [1, 1, 1, 1, 3, 1], // high E, B, G, D, A, low E (strings 1-6)
				fingers: [1, 1, 1, 1, 3, 1],
				barres: [{ fret: 1, strings: [6, 1] }],
			},
			// Am7-shape barre chord (root on 5th string, starting at fret 1 = A#m7)
			{
				name: 'Am7-shape barre',
				rootNote: 'A#',
				rootString: 5,
				frets: [1, 2, 1, 3, 1, -1], // high E, B, G, D, A, x (strings 1-6)
				fingers: [1, 2, 1, 3, 1, -1],
				barres: [{ fret: 1, strings: [5, 1] }],
			},
		],
	};

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
	 * Get note index in chromatic scale
	 */
	static getNoteIndex(note: string): number {
		const normalized = this.normalizeNote(note);
		return this.chromaticNotes.indexOf(normalized);
	}

	/**
	 * Calculate the fret offset needed to transpose a shape to a target root note
	 */
	static calculateTransposition(shapeRootNote: string, targetRootNote: string): number {
		const shapeIndex = this.getNoteIndex(shapeRootNote);
		const targetIndex = this.getNoteIndex(targetRootNote);
		
		if (shapeIndex === -1 || targetIndex === -1) return 0;
		
		// Calculate semitone difference
		let offset = targetIndex - shapeIndex;
		
		// Normalize to 0-11 range
		while (offset < 0) offset += 12;
		while (offset >= 12) offset -= 12;
		
		return offset;
	}

	/**
	 * Get the best chord shape for a given root and type
	 */
	static getChordShape(rootNote: string, chordType: string): GuitarFingerPlacement[] | null {
		// Normalize the chord type
		let shapeKey = chordType.toLowerCase();
		
		// Map various chord type names to shape keys
		if (chordType === '' || chordType === 'M') {
			shapeKey = 'major';
		} else if (chordType === 'm' || chordType === 'min') {
			shapeKey = 'minor';
		} else if (chordType === 'maj7' || chordType === 'M7') {
			shapeKey = 'maj7';
		} else if (chordType === 'm7' || chordType === 'min7') {
			shapeKey = 'min7';
		} else if (chordType === '7' || chordType === 'dom7') {
			shapeKey = '7';
		}
		
		const shapes = this.shapes[shapeKey];
		if (!shapes || shapes.length === 0) return null;
		
		// Try each shape and pick the one that transposes most naturally
		let bestShape: GuitarChordShape | null = null;
		let lowestTransposition = Infinity;
		
		for (const shape of shapes) {
			const transposition = this.calculateTransposition(shape.rootNote, rootNote);
			
			// Prefer shapes with lower transposition (closer to open position)
			// But allow up to fret 12
			if (transposition < 12 && transposition < lowestTransposition) {
				lowestTransposition = transposition;
				bestShape = shape;
			}
		}
		
		if (!bestShape) return null;
		
		// Convert shape to finger placements with transposition
		const transposition = this.calculateTransposition(bestShape.rootNote, rootNote);
		const placements: GuitarFingerPlacement[] = [];
		
		for (let i = 0; i < bestShape.frets.length; i++) {
			const stringNum = 6 - i; // Array is ordered from string 6 to 1 (low E to high E)
			const shapeFret = bestShape.frets[i];
			const finger = bestShape.fingers[i];
			
			if (shapeFret === -1) {
				// Muted string
				placements.push({
					string: stringNum,
					fret: 0,
					finger: 0,
					barre: 0,
					muted: true,
				});
			} else {
				// Active string
				const actualFret = shapeFret + transposition;
				placements.push({
					string: stringNum,
					fret: actualFret,
					finger: finger > 0 ? Math.min(finger, 4) : 0,
					barre: 0,
				});
			}
		}
		
		return placements;
	}
}
