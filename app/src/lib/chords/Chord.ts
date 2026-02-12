// Chord representation (absolute position)
export class Chord {
	public static readonly notesUp = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
	public static readonly notesDown = ['A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab'];
	public static readonly types = ['', 'm', 'aug', 'dim', 'sus2', 'sus4'];
	public static readonly additions = ['2', '4', '5', '6', 'maj6', 'maj7', '7', 'maj9', '9', '11', '13'];

	private static readonly notePattern = '(A#|C#|D#|F#|G#|Ab|Bb|Db|Eb|Gb|A|B|C|D|E|F|G)';
	private static readonly pretypePattern = '(m)';
	private static readonly posttypePattern = '(aug|dim|sus2|sus4)';
	private static readonly addPattern = '(2|4|5|6|maj6|maj7|7|maj9|9|11|13)';
	private static readonly modPattern = '(b3|#4|#5|b5|b6|b9|#9|#11|b13|maj6|maj7)';
	private static readonly addPatterns = `(${Chord.addPattern}(\\/${Chord.addPattern})*)`;
	private static readonly modPatterns = `(\\(${Chord.modPattern}(\\/${Chord.modPattern})*\\))`;
	private static readonly chordPattern = new RegExp(
		`^${Chord.notePattern}(${Chord.pretypePattern}?${Chord.addPatterns}?|${Chord.addPatterns}?${Chord.posttypePattern})(${Chord.modPatterns})?(\\\\${Chord.notePattern})?$`
	);

	private name: string;
	public key: string;
	public type: string;
	public add: string[]; // added notes
	public mod: string[]; // modified notes
	public bass: string;

	constructor(
		key: string,
		type: string = '',
		add: string[] = [],
		mod: string[] = [],
		bass?: string
	) {
		this.key = key;
		this.type = type;
		this.add = [...add];
		this.mod = [...mod];
		this.bass = bass || key;
		this.name = '';
		this.updateName();
	}

	// Construct from chord name
	static fromString(name: string): Chord {
		const standardized = Chord.standardize(name);
		if (!standardized) {
			throw new Error(`Unrecognized chord: ${name}`);
		}

		let buffer = standardized;
		let key = '';
		let bass = '';
		let type = '';
		const add: string[] = [];
		const mod: string[] = [];

		// Get key
		key = buffer.charAt(0);
		if (buffer.length > 1 && (buffer.charAt(1) === '#' || buffer.charAt(1) === 'b')) {
			key += buffer.charAt(1);
			buffer = buffer.substring(2);
		} else {
			buffer = buffer.substring(1);
		}

		// Get bass note (after backslash)
		const bassIndex = buffer.indexOf('\\');
		if (bassIndex !== -1) {
			bass = buffer.substring(bassIndex + 1);
			buffer = buffer.substring(0, bassIndex);
		} else {
			bass = key;
		}

		// Get modifications (in parentheses)
		const modMatch = buffer.match(/\(([^)]+)\)/);
		if (modMatch) {
			const modStr = modMatch[1];
			mod.push(...modStr.split('/'));
			buffer = buffer.replace(modMatch[0], '');
		}

		// Get type
		if (buffer.length > 0) {
			// Check for 'maj' first (to avoid detecting 'm' instead)
			if (buffer.startsWith('maj')) {
				// 'maj' is typically part of additions, not the type
				type = '';
			} else {
				for (const t of Chord.types) {
					if (t && buffer.startsWith(t)) {
						type = t;
						buffer = buffer.substring(t.length);
						break;
					}
				}
			}
		}

		// Get additions (what remains)
		if (buffer.length > 0) {
			add.push(...buffer.split('/').filter((s) => s.length > 0));
		}

		const chord = new Chord(key, type, add, mod, bass);
		return chord;
	}

	static standardize(name: string): string | null {
		// Validate chord structure using regex pattern (same as Java version)
		if (!name || name.length === 0) return null;
		
		const matchFound = Chord.chordPattern.test(name);
		if (!matchFound) return null;
		
		return name;
	}

	private updateName(): void {
		let nameParts: string[] = [];
		let typeAdded = false;

		nameParts.push(this.key);

		// Add type if it's '' or 'm' first
		if (this.type === '' || this.type === 'm') {
			nameParts.push(this.type);
			typeAdded = true;
		}

		// Add additions
		if (this.add.length > 0) {
			nameParts.push(this.add.join('/'));
		}

		// Add type if not yet added
		if (!typeAdded && this.type) {
			nameParts.push(this.type);
		}

		// Add modifications
		if (this.mod.length > 0) {
			nameParts.push(`(${this.mod.join('/')})`);
		}

		// Add bass if different from key
		if (this.bass !== this.key) {
			nameParts.push(`\\${this.bass}`);
		}

		this.name = nameParts.join('');
	}

	// Public method to update name after modifying chord properties
	public refreshName(): void {
		this.updateName();
	}

	copy(): Chord {
		return new Chord(this.key, this.type, this.add, this.mod, this.bass);
	}

	static transposeKey(key: string, halfsteps: number): string {
		const notes = key.includes('b') ? Chord.notesDown : Chord.notesUp;
		const index = notes.indexOf(key);
		if (index === -1) return key;

		const newIndex = ((index + halfsteps) + 12) % 12;
		return notes[newIndex];
	}

	transpose(halfsteps: number): void {
		this.key = Chord.transposeKey(this.key, halfsteps);
		this.bass = Chord.transposeKey(this.bass, halfsteps);
		this.updateName();
	}

	static getInterval(key1: string, key2: string): number {
		const notes1 = key1.includes('b') ? Chord.notesDown : Chord.notesUp;
		const notes2 = key2.includes('b') ? Chord.notesDown : Chord.notesUp;

		const index1 = notes1.indexOf(key1);
		const index2 = notes2.indexOf(key2);

		if (index1 === -1 || index2 === -1) return 0;

		return (12 - index1 + index2) % 12;
	}

	toString(): string {
		return this.name;
	}

	// Get a color for the chord based on its key (for UI)
	getColor(baseHue: number = 0): string {
		const notes = this.key.includes('b') ? Chord.notesDown : Chord.notesUp;
		const index = notes.indexOf(this.key);
		if (index === -1) return `hsl(${baseHue}, 40%, 70%)`;

		// Map each semitone to a color across the rainbow (360 degrees / 12 notes = 30 degrees per note)
		const hue = (baseHue + index * 30) % 360;
		return `hsl(${hue}, 40%, 70%)`;
	}

	/**
	 * Get the list of notes that compose the chord
	 * @returns Array of note names [bass, root, 3rd, 5th, 7th, 9th, 11th, 13th, ...]
	 */
	getNotes(): string[] {
		const notes: string[] = [];
		const intervals = new Map<number, { semitones: number; preferSharps: boolean }>(); 
		
		// Determine if chord is major or minor (affects default intervals)
		const isMajor = this.type !== 'm' && this.type !== 'dim';
		const isDim = this.type === 'dim';
		const isAug = this.type === 'aug';
		const isSus2 = this.type === 'sus2';
		const isSus4 = this.type === 'sus4';

		// Start with bass note
		notes.push(this.bass);
		
		// Add root (only if different from bass or if same, we add it twice)
		notes.push(this.key);

		// Set default third based on chord type
		if (isSus2) {
			intervals.set(2, { semitones: 2, preferSharps: false }); // Major 2nd instead of 3rd
		} else if (isSus4) {
			intervals.set(4, { semitones: 5, preferSharps: false }); // Perfect 4th instead of 3rd
		} else if (isMajor && !isDim) {
			intervals.set(3, { semitones: 4, preferSharps: false }); // Major 3rd
		} else if (this.type === 'm' || isDim) {
			intervals.set(3, { semitones: 3, preferSharps: false }); // Minor 3rd
		}

		// Set default fifth
		if (isAug) {
			intervals.set(5, { semitones: 8, preferSharps: true }); // Augmented 5th
		} else if (isDim) {
			intervals.set(5, { semitones: 6, preferSharps: false }); // Diminished 5th
		} else {
			intervals.set(5, { semitones: 7, preferSharps: false }); // Perfect 5th
		}

		// Process additions
		for (const add of this.add) {
			if (add === '2') {
				intervals.set(2, { semitones: 2, preferSharps: false }); // Major 2nd
			} else if (add === '4') {
				intervals.set(4, { semitones: 5, preferSharps: false }); // Perfect 4th
			} else if (add === '5') {
				// 5th already set by default
			} else if (add === '6') {
				intervals.set(6, { semitones: isMajor ? 9 : 8, preferSharps: false }); // Major 6th for major, Minor 6th for minor
			} else if (add === 'maj6') {
				intervals.set(6, { semitones: 9, preferSharps: false }); // Major 6th
			} else if (add === '7') {
				// Dominant 7th (minor 7th)
				intervals.set(7, { semitones: 10, preferSharps: false });
			} else if (add === 'maj7') {
				intervals.set(7, { semitones: 11, preferSharps: false }); // Major 7th
			} else if (add === '9') {
				intervals.set(7, { semitones: 10, preferSharps: false }); // Includes dominant 7th
				intervals.set(9, { semitones: 14, preferSharps: false }); // Major 9th
			} else if (add === 'maj9') {
				intervals.set(7, { semitones: 11, preferSharps: false }); // Major 7th
				intervals.set(9, { semitones: 14, preferSharps: false }); // Major 9th
			} else if (add === '11') {
				intervals.set(7, { semitones: 10, preferSharps: false }); // Includes dominant 7th
				intervals.set(9, { semitones: 14, preferSharps: false }); // Includes 9th
				intervals.set(11, { semitones: 17, preferSharps: false }); // Perfect 11th
			} else if (add === '13') {
				intervals.set(7, { semitones: 10, preferSharps: false }); // Includes dominant 7th
				intervals.set(9, { semitones: 14, preferSharps: false }); // Includes 9th
				intervals.set(11, { semitones: 17, preferSharps: false }); // Includes 11th
				intervals.set(13, { semitones: 21, preferSharps: false }); // Major 13th
			}
		}

		// Process modifications (override defaults)
		for (const mod of this.mod) {
			if (mod === 'b3') {
				intervals.set(3, { semitones: 3, preferSharps: false }); // Minor 3rd
			} else if (mod === '#4') {
				intervals.set(4, { semitones: 6, preferSharps: true }); // Augmented 4th
			} else if (mod === 'b5') {
				intervals.set(5, { semitones: 6, preferSharps: false }); // Diminished 5th
			} else if (mod === '#5') {
				intervals.set(5, { semitones: 8, preferSharps: true }); // Augmented 5th
			} else if (mod === 'b6') {
				const baseSemitones = isMajor ? 9 : 8;
				intervals.set(6, { semitones: baseSemitones - 1, preferSharps: false });
			} else if (mod === 'maj6') {
				intervals.set(6, { semitones: 9, preferSharps: false }); // Major 6th
			} else if (mod === 'maj7') {
				intervals.set(7, { semitones: 11, preferSharps: false }); // Major 7th
			} else if (mod === 'b9') {
				intervals.set(9, { semitones: 13, preferSharps: false }); // Minor 9th
			} else if (mod === '#9') {
				intervals.set(9, { semitones: 15, preferSharps: true }); // Augmented 9th
			} else if (mod === '#11') {
				intervals.set(9, { semitones: 14, preferSharps: false }); // Make sure 9th is included
				intervals.set(11, { semitones: 18, preferSharps: true }); // Augmented 11th
			} else if (mod === 'b13') {
				intervals.set(9, { semitones: 14, preferSharps: false }); // Make sure 9th is included
				intervals.set(11, { semitones: 17, preferSharps: false }); // Make sure 11th is included
				intervals.set(13, { semitones: 20, preferSharps: false }); // Minor 13th
			}
		}

		// Build the notes in order: root, 2, 3, 4, 5, 6, 7, 9, 11, 13
		const orderedIntervals = [2, 3, 4, 5, 6, 7, 9, 11, 13];
		
		for (const interval of orderedIntervals) {
			if (intervals.has(interval)) {
				const { semitones, preferSharps } = intervals.get(interval)!;
				const note = this.getNoteFromInterval(this.key, semitones, preferSharps);
				notes.push(note);
			}
		}

		return notes;
	}

	/**
	 * Get a note that is a specific number of semitones above a root note
	 * @param root Root note (e.g., 'C', 'F#', 'Bb')
	 * @param semitones Number of semitones above root
	 * @param preferSharps Force use of sharps instead of flats (for #5, #9, #11, etc.)
	 * @returns The resulting note name
	 */
	private getNoteFromInterval(root: string, semitones: number, preferSharps: boolean = false): string {
		// Use sharps if root has sharp, or if explicitly requested, flats otherwise
		const useFlats = !root.includes('#') && !preferSharps;
		const notes = useFlats ? Chord.notesDown : Chord.notesUp;
		const rootIndex = notes.indexOf(root);
		if (rootIndex === -1) return root;

		const targetIndex = (rootIndex + semitones) % 12;
		return notes[targetIndex];
	}
}
