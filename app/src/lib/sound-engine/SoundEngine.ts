import * as Tone from 'tone';

/**
 * Configuration for the sound engine
 */
export interface SoundEngineConfig {
	/** Octave for bass notes (default: 2) */
	bassOctave: number;
	/** Starting octave for chord notes (default: 4) */
	chordOctave: number;
	/** Volume in decibels (default: -6) */
	volume: number;
	/** Attack time in seconds (default: 0.01) */
	attack: number;
	/** Release time in seconds (default: 0.8) */
	release: number;
	/** Interval between cascading notes in seconds (0 = all notes together, default: 0) */
	cascadeInterval: number;
}

/**
 * Sound engine for playing chord progressions using sampled Rhodes piano
 */
export class SoundEngine {
	private sampler: Tone.Sampler | null = null;
	private config: SoundEngineConfig;
	private isLoaded: boolean = false;
	private loadPromise: Promise<void> | null = null;

	constructor(config: Partial<SoundEngineConfig> = {}) {
		this.config = {
			bassOctave: config.bassOctave ?? 2,
			chordOctave: config.chordOctave ?? 4,
			volume: config.volume ?? -6,
			attack: config.attack ?? 0.01,
			release: config.release ?? 0.8,
			cascadeInterval: config.cascadeInterval ?? 0,
		};
	}

	/**
	 * Load all Rhodes samples
	 * Call this before playing any sounds
	 */
	async load(): Promise<void> {
		if (this.loadPromise) {
			return this.loadPromise;
		}

		this.loadPromise = this._loadSamples().catch((error) => {
			// Reset promise on error so it can retry
			this.loadPromise = null;
			throw error;
		});
		return this.loadPromise;
	}

	private async _loadSamples(): Promise<void> {
		// Ensure AudioContext is started (requires user gesture)
		const context = Tone.getContext();
		if (context.state !== 'running') {
			console.log('Starting AudioContext...');
			try {
				await Tone.start();
				console.log('AudioContext ready:', context.state);
			} catch (error) {
				console.error('Failed to start AudioContext (user gesture required):', error);
				throw new Error('AudioContext requires user interaction. Please click on the page first.');
			}
		}

		// Build sample map for Tone.Sampler
		const sampleMap: { [note: string]: string } = {};

		// Sample every 3 semitones (major third) for good coverage
		// MIDI notes 24-108 (C1-C8)
		const sampledNotes = [
			24, 27, 30, 33, 36, 39, 42, 45, 48, 51, 54, 57, 60, 63, 66, 69, 72, 75, 78, 81, 84,
			87, 90, 93, 96, 99, 102, 105, 108,
		];

		for (const midiNote of sampledNotes) {
			const noteName = this.midiToNoteName(midiNote);
			// Replace # with 's' for filename (e.g., C#4 becomes Cs4)
			const fileName = `${midiNote}_${noteName}.ogg`.replace(/#/g, 's');
			sampleMap[noteName] = `/samples/Rhodes/${fileName}`;
		}

		console.log('Loading', Object.keys(sampleMap).length, 'samples...');

		// Create sampler with onload callback to ensure proper loading
		return new Promise<void>((resolve, reject) => {
			this.sampler = new Tone.Sampler({
				urls: sampleMap,
				attack: this.config.attack,
				release: this.config.release,
				onload: () => {
					console.log('All samples loaded successfully!');
					this.isLoaded = true;
					resolve();
				},
				onerror: (error) => {
					console.error('Error loading samples:', error);
					// Reset load promise so it can retry
					this.loadPromise = null;
					this.isLoaded = false;
					reject(error);
				}
			}).toDestination();

			this.sampler.volume.value = this.config.volume;
		});
	}

	/**
	 * Convert MIDI note number to note name (e.g., 60 -> "C4")
	 */
	private midiToNoteName(midiNote: number): string {
		const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
		const octave = Math.floor(midiNote / 12) - 1;
		const note = noteNames[midiNote % 12];
		return `${note}${octave}`;
	}

	/**
	 * Convert note name without octave to note name with octave
	 * @param note Note name like 'C', 'F#', 'Bb'
	 * @param octave Octave number
	 * @returns Note name with octave like 'C4', 'F#5', 'Bb3'
	 */
	private noteWithOctave(note: string, octave: number): string {
		// Handle flat notation - Tone.js uses sharp notation
		const noteMap: { [key: string]: string } = {
			Db: 'C#',
			Eb: 'D#',
			Gb: 'F#',
			Ab: 'G#',
			Bb: 'A#',
		};

		const normalizedNote = noteMap[note] || note;
		return `${normalizedNote}${octave}`;
	}

	/**
	 * Play a chord from a list of notes
	 * @param notes Array of note names [bass, root, third, fifth, seventh, etc.]
	 * @param duration Duration in seconds (default: 2)
	 * @param velocity Velocity (0-1, default: 0.7)
	 */
	async playChord(notes: string[], duration: number = 2, velocity: number = 0.7): Promise<void> {
		// Ensure samples are loaded before playing
		if (!this.isLoaded) {
			console.log('Loading samples before playback...');
			await this.load();
		}

		if (!this.sampler || notes.length < 2) {
			console.warn('Sampler not ready or insufficient notes');
			return;
		}

		// Double-check sampler is fully loaded
		if (!this.sampler.loaded) {
			console.warn('Sampler not fully loaded yet, waiting...');
			await new Promise(resolve => setTimeout(resolve, 100));
			if (!this.sampler?.loaded) {
				console.error('Sampler still not loaded after waiting');
				return;
			}
		}

		const now = Tone.now();
		const notesToPlay: string[] = [];

		// First note is bass
		if (notes.length > 0) {
			notesToPlay.push(this.noteWithOctave(notes[0], this.config.bassOctave));
		}

		// Rest are chord notes, with octave wrapping
		let currentOctave = this.config.chordOctave;
		let lastNoteIndex = -1;

		for (let i = 1; i < notes.length; i++) {
			const note = notes[i];
			const noteIndex = this.getNoteIndex(note);

			// If this note is lower than the previous note, move to next octave
			if (lastNoteIndex !== -1 && noteIndex <= lastNoteIndex) {
				currentOctave++;
			}

			notesToPlay.push(this.noteWithOctave(note, currentOctave));
			lastNoteIndex = noteIndex;
		}

		// Play notes with optional cascading
		if (this.config.cascadeInterval > 0) {
			// Cascade notes from low to high
			let currentTime = now + 0.05;
			for (const note of notesToPlay) {
				this.sampler.triggerAttackRelease(note, duration, currentTime, velocity);
				currentTime += this.config.cascadeInterval;
			}
		} else {
			// Play all notes together
			this.sampler.triggerAttackRelease(notesToPlay, duration, now + 0.05, velocity);
		}
	}

	/**
	 * Get the chromatic index of a note (C=0, C#/Db=1, ..., B=11)
	 */
	private getNoteIndex(note: string): number {
		const noteMap: { [key: string]: number } = {
			C: 0,
			'C#': 1,
			Db: 1,
			D: 2,
			'D#': 3,
			Eb: 3,
			E: 4,
			F: 5,
			'F#': 6,
			Gb: 6,
			G: 7,
			'G#': 8,
			Ab: 8,
			A: 9,
			'A#': 10,
			Bb: 10,
			B: 11,
		};
		return noteMap[note] ?? 0;
	}

	/**
	 * Update configuration
	 */
	updateConfig(config: Partial<SoundEngineConfig>): void {
		this.config = { ...this.config, ...config };

		if (this.sampler) {
			if (config.volume !== undefined) {
				this.sampler.volume.value = config.volume;
			}
			if (config.attack !== undefined) {
				this.sampler.attack = config.attack;
			}
			if (config.release !== undefined) {
				this.sampler.release = config.release;
			}
		}
	}

	/**
	 * Stop all currently playing sounds
	 */
	stopAll(): void {
		if (this.sampler) {
			this.sampler.releaseAll();
		}
	}

	/**
	 * Play a progression (sequence of chords)
	 * @param chordsNotes Array of chord notes arrays
	 * @param chordDuration Duration of each chord in seconds (default: 1.5)
	 * @param delayBetweenChords Delay between chords in seconds (default: 0.3)
	 * @param velocity Velocity (0-1, default: 0.7)
	 */
	async playProgression(
		chordsNotes: string[][],
		chordDuration: number = 1.5,
		delayBetweenChords: number = 0.3,
		velocity: number = 0.7
	): Promise<void> {
		// Ensure samples are loaded before playing
		if (!this.isLoaded) {
			console.log('Loading samples before playback...');
			await this.load();
		}

		if (!this.sampler || chordsNotes.length === 0) {
			console.warn('Sampler not ready or no chords to play');
			return;
		}

		// Double-check sampler is fully loaded
		if (!this.sampler.loaded) {
			console.warn('Sampler not fully loaded yet, waiting...');
			await new Promise(resolve => setTimeout(resolve, 100));
			if (!this.sampler?.loaded) {
				console.error('Sampler still not loaded after waiting');
				return;
			}
		}

		// Use Tone.js scheduling for accurate timing
		const now = Tone.now();
		let currentTime = now + 0.1; // Small initial delay to ensure everything is ready

		for (const notes of chordsNotes) {
			if (notes.length < 2) continue;

			const notesToPlay: string[] = [];

			// First note is bass
			notesToPlay.push(this.noteWithOctave(notes[0], this.config.bassOctave));

			// Rest are chord notes, with octave wrapping
			let currentOctave = this.config.chordOctave;
			let lastNoteIndex = -1;

			for (let i = 1; i < notes.length; i++) {
				const note = notes[i];
				const noteIndex = this.getNoteIndex(note);

				// If this note is lower than the previous note, move to next octave
				if (lastNoteIndex !== -1 && noteIndex <= lastNoteIndex) {
					currentOctave++;
				}

				notesToPlay.push(this.noteWithOctave(note, currentOctave));
				lastNoteIndex = noteIndex;
			}

			// Schedule the chord to play at the current time with optional cascading
			if (this.config.cascadeInterval > 0) {
				// Cascade notes from low to high
				let cascadeTime = currentTime;
				for (const note of notesToPlay) {
					this.sampler.triggerAttackRelease(note, chordDuration, cascadeTime, velocity);
					cascadeTime += this.config.cascadeInterval;
				}
			} else {
				// Play all notes together
				this.sampler.triggerAttackRelease(notesToPlay, chordDuration, currentTime, velocity);
			}
			
			// Move to next chord time (chord duration + delay)
			currentTime += chordDuration + delayBetweenChords;
		}

		// Calculate total duration and return a promise that resolves when done
		const totalDuration = chordsNotes.length * (chordDuration + delayBetweenChords);
		return new Promise(resolve => {
			setTimeout(() => resolve(), totalDuration * 1000);
		});
	}

	/**
	 * Dispose of the sound engine and release resources
	 */
	dispose(): void {
		if (this.sampler) {
			this.sampler.dispose();
			this.sampler = null;
		}
		this.isLoaded = false;
		this.loadPromise = null;
	}
}

// Singleton instance for easy use across the app
let soundEngineInstance: SoundEngine | null = null;

/**
 * Get the global sound engine instance
 */
export function getSoundEngine(): SoundEngine {
	if (!soundEngineInstance) {
		soundEngineInstance = new SoundEngine({
			bassOctave: 2,
			chordOctave: 4,
			volume: -6,
			attack: 0.001,
			release: 0.8,
			cascadeInterval: 0.06
		});
	}
	return soundEngineInstance;
}

/**
 * Initialize the sound engine (call this on app startup)
 */
export async function initSoundEngine(config?: Partial<SoundEngineConfig>): Promise<SoundEngine> {
	console.log('Initializing sound engine...');
	if (!soundEngineInstance) {
		soundEngineInstance = new SoundEngine(config);
	} else if (config) {
		soundEngineInstance.updateConfig(config);
	}
	await soundEngineInstance.load();
	console.log('Sound engine initialized successfully');
	return soundEngineInstance;
}
