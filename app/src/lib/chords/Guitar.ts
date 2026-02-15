// Guitar chord utilities
import type { Chord } from './Chord';

export interface GuitarFingerPlacement {
	string: number; // 1-6 (1 is high E, 6 is low E)
	fret: number; // 0 for open, 1-24 for fret positions
	finger: number; // 0-4 (0 for open, 1=index, 2=middle, 3=ring, 4=pinky)
	barre: number; // number of strings this finger bars (0 for no barre, 1+ for barre)
	muted?: boolean; // true if string should be muted
}

export class Guitar {
	// Standard tuning from string 6 to 1 (low E to high E)
	static readonly standardTuning = ['E', 'A', 'D', 'G', 'B', 'E'];
	
	// All notes in chromatic order
	private static readonly chromaticNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
	
	/**
	 * Normalize note to use sharps
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
	 * Get the fret position for a note on a specific string
	 */
	static getFretForNote(note: string, stringIndex: number, tuning: string[] = this.standardTuning): number | null {
		const noteIndex = this.getNoteIndex(note);
		const openStringIndex = this.getNoteIndex(tuning[stringIndex]);
		
		if (noteIndex === -1 || openStringIndex === -1) return null;
		
		// Calculate fret position (0-12 for first octave)
		let fret = (noteIndex - openStringIndex + 12) % 12;
		
		// Prefer frets 0-5 for playability
		return fret <= 5 ? fret : null;
	}
	
	/**
	 * Find guitar fingering for a chord (simplified version)
	 * This is a basic implementation - full chord voicing is complex
	 */
	static chordToFingerPlacements(chord: Chord, tuning: string[] = this.standardTuning): GuitarFingerPlacement[] | null {
		const chordNotes = chord.getNotes();
		if (chordNotes.length === 0) return null;
		
		// Normalize chord notes
		const normalizedNotes = chordNotes.map(n => this.normalizeNote(n));
		const uniqueNotes = Array.from(new Set(normalizedNotes));
		
		// Try to find a simple voicing
		const placements: GuitarFingerPlacement[] = [];
		
		// For each string (from low E to high E)
		for (let stringIndex = 0; stringIndex < tuning.length; stringIndex++) {
			const stringNum = stringIndex + 1;
			let placed = false;
			
			// Try to match a chord note on this string
			for (const note of uniqueNotes) {
				const fret = this.getFretForNote(note, stringIndex, tuning);
				
				if (fret !== null) {
					placements.push({
						string: stringNum,
						fret: fret,
						finger: fret === 0 ? 0 : Math.min(fret, 4),
						barre: 0,
					});
					placed = true;
					break;
				}
			}
			
			// If we couldn't place a note, mark as muted for strings 5 and 6
			if (!placed && stringIndex >= 4) {
				placements.push({
					string: stringNum,
					fret: 0,
					finger: 0,
					barre: 0,
					muted: true,
				});
			}
		}
		
		// If we have too few notes, return null
		if (placements.filter(p => !p.muted).length < 3) {
			return null;
		}
		
		return placements;
	}
}
