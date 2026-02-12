import { writable, derived } from 'svelte/store';
import { Progression } from '$lib/chords/Progression';
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
	maxChords: number; // 0-8 where 0=2 chords, 1=3 chords, etc. 7=8 chords, 8=any
	chordType: number; // 0=minimal, 1=variations only, 2=seventh only, 3=seventh & variations, 4=any
}

const defaultFilters: FilterOptions = {
	maxChords: 8, // any
	chordType: 4 // any
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
		$filters.maxChords === defaultFilters.maxChords &&
		$filters.chordType === defaultFilters.chordType
	);
});

// Progressions store
export const allProgressions = writable<Progression[]>([]);
export const currentProgression = writable<Progression | null>(null);
export const previousProgression = writable<Progression | null>(null);

// Base hue for color generation
export const baseHue = writable<number>(Math.floor(Math.random() * 360));
export const previousBaseHue = writable<number | null>(null);

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
	if (progressions.length === 0) return null;
	
	// Filter progressions based on options
	let filtered = [...progressions];

	// Filter by chord count
	if (filterOptions.maxChords < 8) {
		const maxCount = filterOptions.maxChords + 2; // 0=2 chords, 1=3 chords, etc. 7=9 chords
		filtered = filtered.filter((p) => p.getNbChords() <= maxCount);
	}

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

// Reset function for filters
export function resetFilters() {
	filters.set({ ...defaultFilters });
}
