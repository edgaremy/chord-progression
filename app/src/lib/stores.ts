import { writable, derived } from 'svelte/store';
import { Progression } from '$lib/chords/Progression';
import { Chord } from '$lib/chords/Chord';
import { ProgManager } from '$lib/chords/ProgManager';

// Browser check - safe for SSR
const isBrowser = typeof window !== 'undefined';

// Theme store
const themeKey = 'chord-app-theme';
export const defaultTheme = 'system' as const;
const storedTheme = isBrowser ? localStorage.getItem(themeKey) : null;
const initialTheme = storedTheme ? validateTheme(storedTheme) : defaultTheme;
export const theme = writable<'light' | 'dark' | 'system'>(initialTheme);

// Function to apply theme
function applyTheme(value: 'light' | 'dark' | 'system') {
	if (!isBrowser) return;
	
	let actualTheme = value;
	if (value === 'system') {
		// Check system preference
		actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}
	document.documentElement.setAttribute('data-theme', actualTheme);
}

theme.subscribe((value) => {
	if (isBrowser) {
		localStorage.setItem(themeKey, value);
		applyTheme(value);
	}
});

// Listen for system theme changes
if (isBrowser) {
	const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
	mediaQuery.addEventListener('change', () => {
		// Only apply if current theme is system
		const currentTheme = localStorage.getItem(themeKey);
		if (currentTheme === 'system') {
			applyTheme('system');
		}
	});
	
	// Apply initial theme
	applyTheme(initialTheme);
}

// Auto-play audio store
const autoPlayKey = 'chord-app-autoplay';
export const defaultAutoPlay = true;
const storedAutoPlay = isBrowser ? localStorage.getItem(autoPlayKey) : null;
const initialAutoPlay = validateAutoPlay(storedAutoPlay === null ? null : storedAutoPlay === 'true');
export const autoPlayAudio = writable<boolean>(initialAutoPlay);

autoPlayAudio.subscribe((value) => {
	if (isBrowser) {
		localStorage.setItem(autoPlayKey, value.toString());
	}
});

// Filter options store
export interface FilterOptions {
	minChords: number; // 0-6 where 0=2 chords, 1=3 chords, etc. 6=8+ chords
	maxChords: number; // 0-6 where 0=2 chords, 1=3 chords, etc. 6=8+ chords
	chordType: number; // 0=minimal, 1=variations only, 2=seventh only, 3=seventh & variations, 4=any
	trulyRandom: boolean; // Generate truly random chords instead of from database
}

const defaultFilters: FilterOptions = {
	minChords: 0, // 2 chords
	maxChords: 6, // 8+ chords (any)
	chordType: 4, // any
	trulyRandom: false
};

// Validate and sanitize filter options to handle version changes
function validateFilters(filters: any): FilterOptions {
	const validated: FilterOptions = { ...defaultFilters };
	
	// Validate minChords (0-6)
	if (typeof filters.minChords === 'number' && filters.minChords >= 0 && filters.minChords <= 6) {
		validated.minChords = filters.minChords;
	}
	
	// Validate maxChords (0-6, and must be >= minChords)
	if (typeof filters.maxChords === 'number' && filters.maxChords >= 0 && filters.maxChords <= 6) {
		validated.maxChords = Math.max(filters.maxChords, validated.minChords);
	}
	
	// Validate chordType (0-4)
	if (typeof filters.chordType === 'number' && filters.chordType >= 0 && filters.chordType <= 4) {
		validated.chordType = filters.chordType;
	}
	
	// Validate trulyRandom (boolean)
	if (typeof filters.trulyRandom === 'boolean') {
		validated.trulyRandom = filters.trulyRandom;
	}
	
	return validated;
}

const filtersKey = 'chord-app-filters';
const storedFilters = isBrowser ? localStorage.getItem(filtersKey) : null;
const initialFilters = storedFilters ? validateFilters(JSON.parse(storedFilters)) : defaultFilters;

export const filters = writable<FilterOptions>(initialFilters);

filters.subscribe((value) => {
	if (isBrowser) {
		localStorage.setItem(filtersKey, JSON.stringify(value));
	}
});

// Check if filters are at default
export const isDefaultFilters = derived(filters, ($filters) => {
	return (
		$filters.minChords === defaultFilters.minChords &&
		$filters.maxChords === defaultFilters.maxChords &&
		$filters.chordType === defaultFilters.chordType &&
		$filters.trulyRandom === defaultFilters.trulyRandom
	);
});

// Progressions store
export const allProgressions = writable<Progression[]>([]);
export const currentProgression = writable<Progression | null>(null);
export const previousProgression = writable<Progression | null>(null);
export const memorizedProgression = writable<Progression | null>(null);

// Base hue for color generation
export const baseHue = writable<number>(Math.floor(Math.random() * 360));
export const previousBaseHue = writable<number | null>(null);
export const memorizedBaseHue = writable<number | null>(null);

// Loop state for progression playback
export const loopPlayback = writable<boolean>(false);

// Playback speed (0.5 = half speed, 1.5 = normal/100%, 2.0 = faster)
const playbackSpeedKey = 'chordProgressions:playbackSpeed';
export const defaultPlaybackSpeed = 1.5;
const storedPlaybackSpeed = isBrowser ? localStorage.getItem(playbackSpeedKey) : null;
const initialPlaybackSpeed = storedPlaybackSpeed ? validatePlaybackSpeed(storedPlaybackSpeed) : defaultPlaybackSpeed;
export const playbackSpeed = writable<number>(initialPlaybackSpeed);

if (isBrowser) {
	playbackSpeed.subscribe((value) => {
		localStorage.setItem(playbackSpeedKey, value.toString());
	});
}

// Initialize progressions from data file
export async function loadProgressions() {
	try {
		let text: string;
		
		if (import.meta.env.DEV) {
			// In dev mode, import directly from source to get HMR
			const dataModule = await import('./data/progressions.txt?raw');
			text = dataModule.default;
		} else {
			// In production, fetch from static assets
			const response = await fetch('/progressions.txt');
			if (!response.ok) {
				throw new Error(`Failed to load progressions: ${response.status} ${response.statusText}`);
			}
			text = await response.text();
		}
		
		// Check if we accidentally got HTML instead of text
		if (text.trim().startsWith('<') || text.includes('<!DOCTYPE')) {
			console.error('Received HTML instead of progressions file. Check file path and server configuration.');
			throw new Error('Invalid progressions file format');
		}
		
		const progs = ProgManager.parseProgressions(text);
		
		if (progs.length === 0) {
			console.warn('No progressions were parsed from the file');
		}
		
		allProgressions.set(progs);
		console.log(`Loaded ${progs.length} progressions`);
		return progs;
	} catch (error) {
		console.error('Failed to load progressions:', error);
		// Set empty array on error to prevent crashes
		allProgressions.set([]);
		return [];
	}
}

// Generate random progression based on filters
export function generateRandomProgression(
	progressions: Progression[],
	filterOptions: FilterOptions
): Progression | null {
	// If truly random is enabled, generate random chords
	if (filterOptions.trulyRandom) {
		return generateTrulyRandomProgression(filterOptions);
	}

	if (progressions.length === 0) return null;
	
	// Filter progressions based on options
	let filtered = [...progressions];

	// Filter by chord count range
	const minCount = filterOptions.minChords + 2; // 0=2 chords, 1=3 chords, etc.
	const maxCount = filterOptions.maxChords === 6 ? 999 : filterOptions.maxChords + 2; // 6=8+ chords
	filtered = filtered.filter((p) => {
		const nbChords = p.getNbChords();
		return nbChords >= minCount && nbChords <= maxCount;
	});

	// Get random progression from filtered list
	const prog = ProgManager.getRandomProg(filtered);
	if (!prog) return null;

	// Apply chord type transformations to the selected progression
	if (filterOptions.chordType < 4) {
		prog.chords.forEach((chord) => {
			switch (filterOptions.chordType) {
				case 0: // minimal - remove all additions and set to basic major/minor
					chord.add = [];
					chord.mod = [];
					if (chord.type !== 'm') {
						chord.type = '';
					}
					chord.refreshName();
					break;
				case 1: // variations only - keep dim/aug/sus, remove sevenths
					chord.add = [];
					chord.mod = [];
					// Keep type as is (dim, aug, sus2, sus4, or m)
					chord.refreshName();
					break;
				case 2: // seventh only - keep only 7, m7, maj7
					// Filter add[] to only keep 7 and maj7
					chord.add = chord.add.filter(a => a === '7' || a === 'maj7');
					chord.mod = [];
					// Reset type to basic major/minor
					if (chord.type !== 'm') {
						chord.type = '';
					}
					chord.refreshName();
					break;
				case 3: // seventh & variations - keep variations and only 7, m7, maj7
					// Filter add[] to only keep 7 and maj7
					chord.add = chord.add.filter(a => a === '7' || a === 'maj7');
					chord.mod = [];
					// Keep type as is (includes dim, aug, sus2, sus4, m)
					chord.refreshName();
					break;
			}
		});
	}

	return prog;
}

// Generate truly random progression
function generateTrulyRandomProgression(filterOptions: FilterOptions): Progression {
	// ========== PROBABILITY CONFIGURATION ==========
	// Adjust these values to tune chord generation (each group should sum to 1.0)
	
	// Basic chord type distribution (for minimal and seventh modes)
	const PROB_MAJOR = 0.5;       // Probability of major chord (minor is 1 - PROB_MAJOR)
	
	// Chord type variations distribution (for modes that include variations)
	const VARIATION_WEIGHTS = {
		'': 0.4,      // Major
		'm': 0.4,     // Minor
		'dim': 0.02,   // Diminished
		'aug': 0.02,   // Augmented
		'sus2': 0.08,  // Suspended 2nd
		'sus4': 0.08   // Suspended 4th
	};
	
	// Probability of adding seventh extensions
	const PROB_ADD_7_TO_MAJOR = 0.33;       // Probability of adding dominant 7 to major chord
	const PROB_ADD_MAJ7_TO_MAJOR = 0.33;    // Probability of adding maj7 to major chord
	const PROB_ADD_7_TO_MINOR = 0.49;        // Probability of adding 7 to minor chord
	const PROB_ADD_MAJ7_TO_MINOR = 0.01;     // Probability of adding maj7 to minor chord
	// Note: For major chords, 7 and maj7 are mutually exclusive (total 0.7)
	//       For minor chords, 7 and maj7 are mutually exclusive (total 0.7)
	
	// Probability of adding extensions by mode
	const PROB_ADD_SEVENTH_MODE2 = 0.7;     // For "seventh only" mode
	const PROB_ADD_SEVENTH_MODE3 = 0.6;     // For "seventh & variations" mode
	const PROB_ADD_EXTENSION_MODE4 = 0.1;   // For "any" mode
	
	// Extended additions for "any" mode (excluding 7/maj7 which use specific probabilities)
	const EXTENSION_WEIGHTS_BELOW_7 = {
		'2': 0.2,      // Add 2nd
		'4': 0.2,      // Add 4th
		'5': 0.2,      // Add 5th
		'6': 0.4       // Add 6th
	};
	
	const EXTENSION_WEIGHTS_ABOVE_7 = {
		'maj9': 0.01,  // Major ninth
		'9': 0.32,     // Dominant ninth
		'11': 0.33,    // Eleventh
		'13': 0.33     // Thirteenth
	};
	
	// ================================================
	
	// Helper function to select item based on weights
	function weightedRandom<T extends string>(weights: Record<T, number>): T {
		const rand = Math.random();
		let cumulative = 0;
		for (const [key, weight] of Object.entries(weights) as [T, number][]) {
			cumulative += weight;
			if (rand < cumulative) return key;
		}
		// Fallback to last item if rounding errors occur
		return Object.keys(weights).pop() as T;
	}
	
	// Helper function to add seventh extension based on chord type
	function addSeventhExtension(type: string, probability: number): string[] {
		if (Math.random() >= probability) return [];
		
		if (type === 'm') {
			// Minor chord: choose between 7 and maj7
			const rand = Math.random();
			const totalProb = PROB_ADD_7_TO_MINOR + PROB_ADD_MAJ7_TO_MINOR;
			return [rand < (PROB_ADD_7_TO_MINOR / totalProb) ? '7' : 'maj7'];
		} else if (type === '') {
			// Major chord: choose between 7 and maj7
			const rand = Math.random();
			const totalProb = PROB_ADD_7_TO_MAJOR + PROB_ADD_MAJ7_TO_MAJOR;
			return [rand < (PROB_ADD_7_TO_MAJOR / totalProb) ? '7' : 'maj7'];
		}
		// For dim, aug, sus2, sus4 - no seventh extension
		return [];
	}
	
	// Random number of chords between min and max (but never more than 8 for 8+)
	const minCount = filterOptions.minChords + 2;
	const maxCount = filterOptions.maxChords === 6 ? 8 : filterOptions.maxChords + 2; // 6=8+ chords
	const nbChords = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;

	// Random key
	const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
	const key = keys[Math.floor(Math.random() * keys.length)];

	// Generate random chords
	const chords = [];
	for (let i = 0; i < nbChords; i++) {
		const chordKey = keys[Math.floor(Math.random() * keys.length)];
		let type = '';
		let add: string[] = [];

		// Apply chord type filter
		switch (filterOptions.chordType) {
			case 0: // Minimal - only basic major/minor
				type = Math.random() < PROB_MAJOR ? '' : 'm';
				break;
				
			case 1: // Variations only - dim/aug/sus
				type = weightedRandom(VARIATION_WEIGHTS);
				break;
				
			case 2: // Seventh only - basic + 7
				type = Math.random() < PROB_MAJOR ? '' : 'm';
				add = addSeventhExtension(type, PROB_ADD_SEVENTH_MODE2);
				break;
				
			case 3: // Seventh & variations
				type = weightedRandom(VARIATION_WEIGHTS);
				add = addSeventhExtension(type, PROB_ADD_SEVENTH_MODE3);
				break;
				
			case 4: // Any - includes all extensions
				type = weightedRandom(VARIATION_WEIGHTS);
				if (Math.random() < PROB_ADD_EXTENSION_MODE4) {
					// Decide whether to add extension below 7, a seventh, or above 7
					const extensionType = Math.random();
					
					if (extensionType < 0.25) {
						// Add extension below 7 (2, 4, 5, 6)
						add = [weightedRandom(EXTENSION_WEIGHTS_BELOW_7)];
					} else if (extensionType < 0.75) {
						// Add seventh (7 or maj7)
						add = addSeventhExtension(type, 1.0);
					} else {
						// Add extension above 7 (maj9, 9, 11, 13)
						add = [weightedRandom(EXTENSION_WEIGHTS_ABOVE_7)];
					}
				}
				break;
		}

		const chord = new Chord(chordKey, type, add, [], chordKey);
		chords.push(chord);
	}

	return new Progression(chords, key);
}

// Reset function for filters
export function resetFilters() {
	filters.set({ ...defaultFilters });
}

// Instrument settings
export type InstrumentType = 'none' | 'piano' | 'guitar' | 'ukulele';

export interface InstrumentSettings {
	type: InstrumentType;
	ukuleleTuning: string[];
}

export const ukuleleTunings = [
	['G', 'C', 'E', 'A'],
	['A', 'D', 'F#', 'B'], // "Traditional" Hawaiian tuning
	['D', 'G', 'B', 'E'],  // Baritone Standard tuning
];

export const defaultInstrumentSettings: InstrumentSettings = {
	type: 'piano',
	ukuleleTuning: ukuleleTunings[0],
};

// Validate and sanitize instrument settings to handle version changes
function validateInstrumentSettings(settings: any): InstrumentSettings {
	const validated: InstrumentSettings = { ...defaultInstrumentSettings };
	
	// Validate type
	const validTypes: InstrumentType[] = ['none', 'piano', 'guitar', 'ukulele'];
	if (typeof settings.type === 'string' && validTypes.includes(settings.type as InstrumentType)) {
		validated.type = settings.type as InstrumentType;
	}
	
	// Validate ukuleleTuning
	if (Array.isArray(settings.ukuleleTuning) && settings.ukuleleTuning.length === 4) {
		// Check if it matches one of the known tunings
		const isValidTuning = ukuleleTunings.some(tuning => 
			tuning.length === settings.ukuleleTuning.length &&
			tuning.every((note, idx) => note === settings.ukuleleTuning[idx])
		);
		if (isValidTuning) {
			validated.ukuleleTuning = settings.ukuleleTuning;
		}
	}
	
	return validated;
}

// Validate theme to handle version changes
function validateTheme(theme: any): 'light' | 'dark' | 'system' {
	const validThemes = ['light', 'dark', 'system'];
	if (typeof theme === 'string' && validThemes.includes(theme)) {
		return theme as 'light' | 'dark' | 'system';
	}
	return defaultTheme;
}

// Validate playback speed to handle version changes
function validatePlaybackSpeed(speed: any): number {
	const parsed = typeof speed === 'string' ? parseFloat(speed) : speed;
	if (typeof parsed === 'number' && !isNaN(parsed) && parsed >= 0.5 && parsed <= 5.0) {
		return parsed;
	}
	return defaultPlaybackSpeed;
}

// Validate auto-play setting
function validateAutoPlay(value: any): boolean {
	if (value === null) return defaultAutoPlay;
	if (typeof value === 'boolean') return value;
	if (typeof value === 'string') return value === 'true';
	return defaultAutoPlay;
}

const instrumentSettingsKey = 'chord-app-instrument-settings';
const storedInstrumentSettings = isBrowser ? localStorage.getItem(instrumentSettingsKey) : null;
const initialInstrumentSettings = storedInstrumentSettings ? validateInstrumentSettings(JSON.parse(storedInstrumentSettings)) : defaultInstrumentSettings;

export const instrumentSettings = writable<InstrumentSettings>(initialInstrumentSettings);

instrumentSettings.subscribe((value) => {
	if (isBrowser) {
		localStorage.setItem(instrumentSettingsKey, JSON.stringify(value));
	}
});

// Legacy ukuleleSettings for backwards compatibility - derived from instrumentSettings
export interface UkuleleSettings {
	enabled: boolean;
	tuning: string[];
}

export const ukuleleSettings = derived(
	instrumentSettings,
	($instrumentSettings) => ({
		enabled: $instrumentSettings.type === 'ukulele',
		tuning: $instrumentSettings.ukuleleTuning,
	})
);

// Check if settings are at default
export const isDefaultSettings = derived(
	[theme, autoPlayAudio, playbackSpeed, instrumentSettings],
	([$theme, $autoPlayAudio, $playbackSpeed, $instrumentSettings]) => {
		// Helper to compare tuning arrays
		const isSameTuning = (a: string[], b: string[]) => 
			a.length === b.length && a.every((val, idx) => val === b[idx]);
		
		return (
			$theme === defaultTheme &&
			$autoPlayAudio === defaultAutoPlay &&
			$playbackSpeed === defaultPlaybackSpeed &&
			$instrumentSettings.type === defaultInstrumentSettings.type &&
			isSameTuning($instrumentSettings.ukuleleTuning, defaultInstrumentSettings.ukuleleTuning)
		);
	}
);

// Reset function for settings
export function resetSettings() {
	theme.set(defaultTheme);
	autoPlayAudio.set(defaultAutoPlay);
	playbackSpeed.set(defaultPlaybackSpeed);
	instrumentSettings.set({ ...defaultInstrumentSettings });
}
