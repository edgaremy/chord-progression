import { Chord } from './Chord';

export class Progression {
	private nbChords: number;
	public key: string;
	private category: string[];
	public chords: Chord[];

	constructor(chords: Chord[], key: string) {
		this.chords = [...chords];
		this.nbChords = chords.length;
		this.key = key;
		this.category = [];
		this.updateCategory();
	}

	static fromString(prog: string, key: string = 'C'): Progression {
		const chordStrings = prog.split(' ');
		const chords = chordStrings.map((str) => Chord.fromString(str));
		return new Progression(chords, key);
	}

	getNbChords(): number {
		return this.nbChords;
	}

	getKey(): string {
		return this.key;
	}

	private getNumberOfChord(root: string, chord: Chord): string {
		const interval = Chord.getInterval(root, chord.key);
		const romanNumerals = ['I', 'bII', 'II', 'III', 'III', 'IV', '#IV', 'V', 'VI', 'VI', 'VII', 'VII'];
		return romanNumerals[interval] || 'I';
	}

	private getKeyOfNumber(root: string, number: string): string | null {
		const upperNum = number.toUpperCase().replace('#', '').replace('B', 'b');

		const transposeMap: { [key: string]: number } = {
			I: 0,
			bII: 1,
			II: 2,
			III: 4,
			IV: 5,
			bV: 6,
			'#IV': 6,
			V: 7,
			VI: 9,
			VII: 11
		};

		if (upperNum in transposeMap) {
			return Chord.transposeKey(root, transposeMap[upperNum]);
		}

		return null;
	}

	private updateCategory(): void {
		this.category = [];
		for (const chord of this.chords) {
			this.category.push(this.getNumberOfChord(this.key, chord));
		}
	}

	transpose(halfsteps: number): void {
		this.key = Chord.transposeKey(this.key, halfsteps);
		this.chords.forEach((chord) => chord.transpose(halfsteps));
		this.updateCategory();
	}

	transposeFlat(halfsteps: number): void {
		this.key = Chord.transposeKeyFlat(this.key, halfsteps);
		this.chords.forEach((chord) => chord.transposeFlat(halfsteps));
		this.updateCategory();
	}

	transposeSharp(halfsteps: number): void {
		this.key = Chord.transposeKeySharp(this.key, halfsteps);
		this.chords.forEach((chord) => chord.transposeSharp(halfsteps));
		this.updateCategory();
	}

	isSameCategory(prog: Progression): boolean {
		return JSON.stringify(this.category) === JSON.stringify(prog.category);
	}

	categoryToString(): string {
		return this.category.join('-');
	}

	toString(): string {
		return this.chords.map((c) => c.toString()).join(' ');
	}

	copy(): Progression {
		const copiedChords = this.chords.map((c) => c.copy());
		return new Progression(copiedChords, this.key);
	}
}
