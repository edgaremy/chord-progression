<script lang="ts">
	import { get } from 'svelte/store';
	import {
		allProgressions,
		currentProgression,
		previousProgression,
		filters,
		baseHue,
		previousBaseHue,
		generateRandomProgression,
		autoPlayAudio
	} from '$lib/stores';
	import { getSoundEngine } from '$lib/sound-engine';
	import GenerateButton from '../components/GenerateButton.svelte';
	import SecondaryButton from '../components/SecondaryButton.svelte';
	import RollbackButton from '../components/RollbackButton.svelte';
	import Chord from '../components/Chord.svelte';

	let currentProg = $derived($currentProgression);
	let prevProg = $derived($previousProgression);
	let showRollback = $derived(prevProg !== null);
	let currentBaseHue = $derived($baseHue);
	let isMobile = $state(false);
	let isAutoPlay = $derived($autoPlayAudio);

	$effect(() => {
		if (typeof window !== "undefined") {
			const checkMobile = () => {
				isMobile = window.innerWidth <= 768;
			};

			checkMobile();
			window.addEventListener("resize", checkMobile);

			return () => {
				window.removeEventListener("resize", checkMobile);
			};
		}
	});

	async function generateProgression() {
		if (currentProg) {
			previousProgression.set(currentProg.copy());
			// Save current base hue
			previousBaseHue.set(currentBaseHue);
		}

		const newProg = generateRandomProgression(get(allProgressions), get(filters));
		if (newProg) {
			currentProgression.set(newProg);
			// Generate new base hue for color variation
			baseHue.set(Math.floor(Math.random() * 360));

			// Play progression if auto-play is enabled
			if (isAutoPlay) {
				try {
					const soundEngine = getSoundEngine();
					const chordsNotes = newProg.chords.map(chord => chord.getNotes());
					// Play in background, don't await to not block UI
					soundEngine.playProgression(chordsNotes, 1.5, 0.3, 0.7).catch(error => {
						console.error('Error playing progression:', error);
					});
				} catch (error) {
					console.error('Error starting progression playback:', error);
				}
			}
		}
	}

	function transposeUp() {
		if (currentProg) {
			const newProg = currentProg.copy();
			newProg.transpose(1);
			currentProgression.set(newProg);
			// Rotate base hue by 30 degrees (one semitone)
			baseHue.set((currentBaseHue + 30) % 360);
		}
	}

	function transposeDown() {
		if (currentProg) {
			const newProg = currentProg.copy();
			newProg.transpose(-1);
			currentProgression.set(newProg);
			// Rotate base hue by -30 degrees (one semitone down)
			baseHue.set((currentBaseHue - 30 + 360) % 360);
		}
	}

	function rollback() {
		if (prevProg) {
			currentProgression.set(prevProg.copy());
			// Restore previous base hue
			const prevHue = get(previousBaseHue);
			if (prevHue !== null) {
				baseHue.set(prevHue);
			}
			previousProgression.set(null);
			previousBaseHue.set(null);
		}
	}

	// Determine chord layout based on count and screen size
	function getChordLayout(count: number, mobile: boolean): { chordSize: string; maxPerRow: number } {
		if (mobile) {
			// Mobile sizes (original)
			if (count <= 2) return { chordSize: '2.5rem', maxPerRow: 2 };
			if (count <= 4) return { chordSize: '2rem', maxPerRow: 4 };
			if (count <= 6) return { chordSize: '1.8rem', maxPerRow: 3 };
			if (count <= 8) return { chordSize: '1.5rem', maxPerRow: 4 };
			return { chordSize: '1.3rem', maxPerRow: 5 };
		} else {
			// Desktop sizes (much bigger)
			if (count <= 2) return { chordSize: '5.5rem', maxPerRow: 2 };
			if (count <= 4) return { chordSize: '4.5rem', maxPerRow: 4 };
			if (count <= 6) return { chordSize: '4rem', maxPerRow: 3 };
			if (count <= 8) return { chordSize: '3.5rem', maxPerRow: 4 };
			return { chordSize: '2.5rem', maxPerRow: 5 };
		}
	}
</script>

<div class="randomizer-page">
	<div class="chords-area">
		{#if !currentProg}
			<h2 class="placeholder-text">Tap to get some chords</h2>
		{:else}
			{@const layout = getChordLayout(currentProg.chords.length, isMobile)}
			<div class="chords-display">
				{#each currentProg.chords as chord}
					<Chord {chord} baseHue={currentBaseHue} size={layout.chordSize} />
				{/each}
			</div>
		{/if}
	</div>

	<div class="controls-fixed">
		<div class="controls-container">
			<SecondaryButton onClick={transposeDown} title="Transpose down (♭)">
				♭
			</SecondaryButton>

			<GenerateButton onClick={generateProgression} size={90} />

			<SecondaryButton onClick={transposeUp} title="Transpose up (♯)">
				♯
			</SecondaryButton>
		</div>

		<div class="rollback-container">
			<RollbackButton onClick={rollback} visible={showRollback} />
		</div>
	</div>
</div>

<style>
	.randomizer-page {
		display: flex;
		flex-direction: column;
		height: calc(100vh - 140px);
		justify-content: space-between;
		/* padding: 2rem 1rem 2rem; */
	}

	@media (min-width: 768px) {
		.randomizer-page {
			height: calc(100vh - 140px);
		}
	}

	.chords-area {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow:-moz-hidden-unscrollable;
		padding: 0;
	}

	.placeholder-text {
		color: var(--text-tertiary);
		font-family: "Boleroesque", cursive;
		font-weight: 600;
		font-style: italic;
		font-size: 4rem;
		text-align: center;
	}

	.chords-display {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;
		max-width: 100%;
	}

	.controls-fixed {
		position: sticky;
		bottom: 0;
		padding: 1rem 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.controls-container {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.rollback-container {
		min-height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding-bottom: 2rem;
	}
</style>