import { Chord } from './src/lib/chords/Chord';

interface ChordTest {
	chordName: string;
	expectedNotes: string[];
	description?: string;
}

const tests: ChordTest[] = [
	// Basic major chords
	{ chordName: 'C', expectedNotes: ['C', 'C', 'E', 'G'], description: 'C major triad' },
	{ chordName: 'F#', expectedNotes: ['F#', 'F#', 'A#', 'C#'], description: 'F# major triad' },
	{ chordName: 'Bb', expectedNotes: ['Bb', 'Bb', 'D', 'F'], description: 'Bb major triad' },

	// Basic minor chords
	{ chordName: 'Cm', expectedNotes: ['C', 'C', 'Eb', 'G'], description: 'C minor triad' },
	{ chordName: 'F#m', expectedNotes: ['F#', 'F#', 'A', 'C#'], description: 'F# minor triad' },
	{ chordName: 'Am', expectedNotes: ['A', 'A', 'C', 'E'], description: 'A minor triad' },

	// Augmented and diminished
	{ chordName: 'Caug', expectedNotes: ['C', 'C', 'E', 'G#'], description: 'C augmented' },
	{ chordName: 'Cdim', expectedNotes: ['C', 'C', 'Eb', 'Gb'], description: 'C diminished' },

	// Suspended chords
	{ chordName: 'Csus2', expectedNotes: ['C', 'C', 'D', 'G'], description: 'C suspended 2' },
	{ chordName: 'Csus4', expectedNotes: ['C', 'C', 'F', 'G'], description: 'C suspended 4' },

	// Seventh chords
	{ chordName: 'C7', expectedNotes: ['C', 'C', 'E', 'G', 'Bb'], description: 'C dominant 7' },
	{ chordName: 'Cmaj7', expectedNotes: ['C', 'C', 'E', 'G', 'B'], description: 'C major 7' },
	{ chordName: 'Cm7', expectedNotes: ['C', 'C', 'Eb', 'G', 'Bb'], description: 'C minor 7' },
	{ chordName: 'Cmmaj7', expectedNotes: ['C', 'C', 'Eb', 'G', 'B'], description: 'C minor major 7' },

	// Extended chords
	{ chordName: 'C9', expectedNotes: ['C', 'C', 'E', 'G', 'Bb', 'D'], description: 'C dominant 9' },
	{ chordName: 'Cmaj9', expectedNotes: ['C', 'C', 'E', 'G', 'B', 'D'], description: 'C major 9' },
	{ chordName: 'C11', expectedNotes: ['C', 'C', 'E', 'G', 'Bb', 'D', 'F'], description: 'C 11' },
	{ chordName: 'C13', expectedNotes: ['C', 'C', 'E', 'G', 'Bb', 'D', 'F', 'A'], description: 'C 13' },

	// Sixth chords
	{ chordName: 'C6', expectedNotes: ['C', 'C', 'E', 'G', 'A'], description: 'C major 6' },
	{ chordName: 'Cm6', expectedNotes: ['C', 'C', 'Eb', 'G', 'Ab'], description: 'C minor 6' },
	{ chordName: 'Cmmaj6', expectedNotes: ['C', 'C', 'Eb', 'G', 'A'], description: 'C minor with major 6' },

	// Modified chords
	{ chordName: 'C7(b5)', expectedNotes: ['C', 'C', 'E', 'Gb', 'Bb'], description: 'C7 flat 5' },
	{ chordName: 'C7(#5)', expectedNotes: ['C', 'C', 'E', 'G#', 'Bb'], description: 'C7 sharp 5' },
	{ chordName: 'C7(b9)', expectedNotes: ['C', 'C', 'E', 'G', 'Bb', 'Db'], description: 'C7 flat 9' },
	{ chordName: 'C7(#9)', expectedNotes: ['C', 'C', 'E', 'G', 'Bb', 'D#'], description: 'C7 sharp 9' },
	{ chordName: 'C7(#11)', expectedNotes: ['C', 'C', 'E', 'G', 'Bb', 'D', 'F#'], description: 'C7 sharp 11' },
	{ chordName: 'C7(b13)', expectedNotes: ['C', 'C', 'E', 'G', 'Bb', 'D', 'F', 'Ab'], description: 'C7 flat 13' },
    { chordName: 'Dm(b5)', expectedNotes: ['D', 'D', 'F', 'Ab'], description: 'D minor flat 5' },
    { chordName: 'Dm7(b5)', expectedNotes: ['D', 'D', 'F', 'Ab', 'C'], description: 'D minor 7 flat 5' },

	// Add2 and Add4
	{ chordName: 'C2', expectedNotes: ['C', 'C', 'D', 'E', 'G'], description: 'C add 2' },
	{ chordName: 'C4', expectedNotes: ['C', 'C', 'E', 'F', 'G'], description: 'C add 4' },

	// Slash chords (different bass)
	{ chordName: 'C\\G', expectedNotes: ['G', 'C', 'E', 'G'], description: 'C major with G bass' },
	{ chordName: 'C\\E', expectedNotes: ['E', 'C', 'E', 'G'], description: 'C major with E bass' },
	{ chordName: 'Dm\\F', expectedNotes: ['F', 'D', 'F', 'A'], description: 'D minor with F bass' },
	{ chordName: 'C7\\Bb', expectedNotes: ['Bb', 'C', 'E', 'G', 'Bb'], description: 'C7 with Bb bass' },

	// Complex chords
	{ chordName: 'Cmaj9', expectedNotes: ['C', 'C', 'E', 'G', 'B', 'D'], description: 'C major 9 (already tested but important)' },
	{ chordName: 'C7(b5/b9)', expectedNotes: ['C', 'C', 'E', 'Gb', 'Bb', 'Db'], description: 'C7 b5 b9' },
];

let passed = 0;
let failed = 0;
const errors: string[] = [];

console.log('🎵 Testing Chord.getNotes() function\n');
console.log('='.repeat(80));

for (const test of tests) {
	try {
		const chord = Chord.fromString(test.chordName);
		const actualNotes = chord.getNotes();
		const expected = test.expectedNotes;

		// Compare arrays
		const match = 
			actualNotes.length === expected.length &&
			actualNotes.every((note, i) => note === expected[i]);

		if (match) {
			console.log(`✅ ${test.chordName.padEnd(15)} ${test.description || ''}`);
			console.log(`   Notes: ${actualNotes.join(', ')}`);
			passed++;
		} else {
			console.log(`❌ ${test.chordName.padEnd(15)} ${test.description || ''}`);
			console.log(`   Expected: ${expected.join(', ')}`);
			console.log(`   Got:      ${actualNotes.join(', ')}`);
			errors.push(`${test.chordName}: expected [${expected.join(', ')}], got [${actualNotes.join(', ')}]`);
			failed++;
		}
	} catch (error) {
		console.log(`❌ ${test.chordName.padEnd(15)} ${test.description || ''}`);
		console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
		errors.push(`${test.chordName}: ${error instanceof Error ? error.message : String(error)}`);
		failed++;
	}
	console.log('');
}

console.log('='.repeat(80));
console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${tests.length} tests\n`);

if (failed > 0) {
	console.log('❌ Failed tests:');
	errors.forEach(err => console.log(`   - ${err}`));
} else {
	console.log('✅ All tests passed!');
}
