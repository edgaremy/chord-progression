import { writable, derived } from 'svelte/store';
import { Progression } from '$lib/chords/Progression';
import { Chord } from '$lib/chords/Chord';
import { ProgManager } from '$lib/chords/ProgManager';

// Browser check - safe for SSR
const isBrowser = typeof window !== 'undefined';

// Theme store
const themeKey = 'chord-app-theme';
const storedTheme = isBrowser ? localStorage.getItem(themeKey) || 'system' : 'system';
export const theme = writable<'light' | 'dark' | 'system'>(storedTheme as 'light' | 'dark' | 'system');

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
	applyTheme(storedTheme as 'light' | 'dark' | 'system');
}

// Auto-play audio store
const autoPlayKey = 'chord-app-autoplay';
const storedAutoPlay = isBrowser ? localStorage.getItem(autoPlayKey) : null;
export const autoPlayAudio = writable<boolean>(storedAutoPlay !== null ? storedAutoPlay === 'true' : true);

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

const filtersKey = 'chord-app-filters';
const storedFilters = isBrowser ? localStorage.getItem(filtersKey) : null;
const initialFilters = storedFilters ? JSON.parse(storedFilters) : defaultFilters;

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

// Playback speed (0.5 = half speed, 1.0 = normal, 2.0 = double speed)
const playbackSpeedKey = 'chordProgressions:playbackSpeed';
const storedPlaybackSpeed = isBrowser ? localStorage.getItem(playbackSpeedKey) : null;
export const playbackSpeed = writable<number>(storedPlaybackSpeed ? parseFloat(storedPlaybackSpeed) : 1.0);

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
	// Random number of chords between min and max (but never more than 8 for 8+)
	const minCount = filterOptions.minChords + 2;
	const maxCount = filterOptions.maxChords === 6 ? 999 : filterOptions.maxChords + 2; // 6=8+ chords
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
			case 0: // minimal - only basic major/minor
				type = Math.random() < 0.5 ? '' : 'm';
				break;
			case 1: // variations only - dim/aug/sus
				const variations = ['', 'm', 'dim', 'aug', 'sus2', 'sus4'];
				type = variations[Math.floor(Math.random() * variations.length)];
				break;
			case 2: // seventh only - basic + 7
				type = Math.random() < 0.5 ? '' : 'm';
				if (Math.random() < 0.7) {
					add = [type === 'm' ? '7' : (Math.random() < 0.5 ? '7' : 'maj7')];
				}
				break;
			case 3: // seventh & variations
				const allTypes = ['', 'm', 'dim', 'aug', 'sus2', 'sus4'];
				type = allTypes[Math.floor(Math.random() * allTypes.length)];
				if (Math.random() < 0.6) {
					add = [type === 'm' ? '7' : (Math.random() < 0.5 ? '7' : 'maj7')];
				}
				break;
			case 4: // any
				const anyTypes = ['', 'm', 'dim', 'aug', 'sus2', 'sus4'];
				type = anyTypes[Math.floor(Math.random() * anyTypes.length)];
				if (Math.random() < 0.5) {
					const additions = ['2', '4', '5', '6', 'maj7', '7', 'maj9', '9', '11', '13'];
					add = [additions[Math.floor(Math.random() * additions.length)]];
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

const instrumentSettingsKey = 'chord-app-instrument-settings';
const defaultInstrumentSettings: InstrumentSettings = {
	type: 'piano',
	ukuleleTuning: ukuleleTunings[0],
};
const storedInstrumentSettings = isBrowser ? localStorage.getItem(instrumentSettingsKey) : null;
const initialInstrumentSettings = storedInstrumentSettings ? JSON.parse(storedInstrumentSettings) : defaultInstrumentSettings;

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
