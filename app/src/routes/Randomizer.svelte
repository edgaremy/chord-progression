<script lang="ts">
	import { get } from "svelte/store";
	import {
		allProgressions,
		currentProgression,
		previousProgression,
		memorizedProgression,
		filters,
		baseHue,
		previousBaseHue,
		memorizedBaseHue,
		generateRandomProgression,
		autoPlayAudio,
		loopPlayback,
		instrumentSettings,
	} from "$lib/stores";
	import { getSoundEngine } from "$lib/sound-engine";
	import GenerateButton from "../components/GenerateButton.svelte";
	import SecondaryButton from "../components/SecondaryButton.svelte";
	import SecondaryToggleButton from "../components/SecondaryToggleButton.svelte";
	import RollbackButton from "../components/RollbackButton.svelte";
	import Chord from "../components/Chord.svelte";
	import { Play, Repeat2 } from "lucide-svelte";
	import bemolIcon from "$assets/bemol.svg";
	import sharpIcon from "$assets/sharp.svg";

	let currentProg = $derived($currentProgression);
	let prevProg = $derived($previousProgression);
	let showRollback = $derived(prevProg !== null);
	let currentBaseHue = $derived($baseHue);
	let isAutoPlay = $derived($autoPlayAudio);
	let isLooping = $state($loopPlayback);
	let playingChordIndex = $state<number | null>(null);
	let hasInstrument = $derived($instrumentSettings.type !== 'none');

	async function generateProgression() {
		// Check if we have a memorized prog to retrieve
		const memProg = get(memorizedProgression);
		if (memProg) {
			// Stop any current playback including loops
			const soundEngine = getSoundEngine();
			soundEngine.stopLooping();
			playingChordIndex = null;

			// Store current as previous before switching to memorized
			if (currentProg) {
				previousProgression.set(currentProg.copy());
				previousBaseHue.set(currentBaseHue);
			}

			// Retrieve memorized prog
			currentProgression.set(memProg.copy());
			const memHue = get(memorizedBaseHue);
			if (memHue !== null) {
				baseHue.set(memHue);
			}

			// Clear memorization
			memorizedProgression.set(null);
			memorizedBaseHue.set(null);

			// Play if auto-play is enabled
			if (isAutoPlay) {
				await playFullProgression();
			}
			return;
		}

		// Normal generation path
		if (currentProg) {
			previousProgression.set(currentProg.copy());
			previousBaseHue.set(currentBaseHue);
		}

		const newProg = generateRandomProgression(
			get(allProgressions),
			get(filters),
		);
		if (newProg) {
			currentProgression.set(newProg);
			baseHue.set(Math.floor(Math.random() * 360));

			// Play progression if auto-play is enabled
			if (isAutoPlay) {
				await playFullProgression();
			}
		}
	}

	async function playFullProgression() {
		if (!currentProg) return;

		try {
			const soundEngine = getSoundEngine();
			// Preserve loop state or use current isLooping value
			const shouldLoop = isLooping;
			soundEngine.stopAll();
			const chordsNotes = currentProg.chords.map((chord) =>
				chord.getNotes(),
			);
			playingChordIndex = null;

			await soundEngine.playProgressionWithLoop(
				chordsNotes,
				1.5,
				undefined,
				0.7,
				(chordIndex) => {
					playingChordIndex = chordIndex;
					setTimeout(() => {
						if (playingChordIndex === chordIndex) {
							playingChordIndex = null;
						}
					}, 500);
				},
				shouldLoop,
			);
		} catch (error) {
			console.error("Error playing progression:", error);
			playingChordIndex = null;
		}
	}

	function transposeUp() {
		if (currentProg) {
			// Stop playback including loops
			const soundEngine = getSoundEngine();
			soundEngine.stopLooping();
			playingChordIndex = null;

			const newProg = currentProg.copy();
			newProg.transposeSharp(1);
			currentProgression.set(newProg);
			baseHue.set((currentBaseHue + 30) % 360);

			// Play if auto-play is enabled
			if (isAutoPlay) {
				playFullProgression();
			}
		}
	}

	function transposeDown() {
		if (currentProg) {
			// Stop playback including loops
			const soundEngine = getSoundEngine();
			soundEngine.stopLooping();
			playingChordIndex = null;

			const newProg = currentProg.copy();
			newProg.transposeFlat(-1);
			currentProgression.set(newProg);
			baseHue.set((currentBaseHue - 30 + 360) % 360);

			// Play if auto-play is enabled
			if (isAutoPlay) {
				playFullProgression();
			}
		}
	}

	function rollback() {
		if (prevProg) {
			// Stop playback including loops
			const soundEngine = getSoundEngine();
			soundEngine.stopLooping();
			playingChordIndex = null;

			// Memorize current prog before rolling back
			memorizedProgression.set(currentProg!.copy());
			memorizedBaseHue.set(currentBaseHue);

			// Restore previous prog
			currentProgression.set(prevProg.copy());
			const prevHue = get(previousBaseHue);
			if (prevHue !== null) {
				baseHue.set(prevHue);
			}
			previousProgression.set(null);
			previousBaseHue.set(null);
		}
	}

	function toggleLoop() {
		isLooping = !isLooping;
		loopPlayback.set(isLooping);

		// If toggling on while playing, restart with loop
		// If toggling off while playing, let current playthrough finish
		if (isLooping && playingChordIndex !== null) {
			playFullProgression();
		}
	}

	// Determine chord layout based on count and screen size
	// function getChordLayout(
	// 	count: number,
	// 	mobile: boolean,
	// ): { chordSize: string; maxPerRow: number } {
	// 	if (mobile) {
	// 		// Mobile sizes (original)
	// 		if (count <= 2) return { chordSize: "2.5rem", maxPerRow: 2 };
	// 		if (count <= 4) return { chordSize: "2rem", maxPerRow: 4 };
	// 		if (count <= 6) return { chordSize: "1.8rem", maxPerRow: 3 };
	// 		if (count <= 8) return { chordSize: "1.5rem", maxPerRow: 4 };
	// 		return { chordSize: "1.3rem", maxPerRow: 5 };
	// 	} else {
	// 		// Desktop sizes (much bigger)
	// 		if (count <= 2) return { chordSize: "5.5rem", maxPerRow: 2 };
	// 		if (count <= 4) return { chordSize: "4.5rem", maxPerRow: 4 };
	// 		if (count <= 6) return { chordSize: "4rem", maxPerRow: 3 };
	// 		if (count <= 8) return { chordSize: "3.5rem", maxPerRow: 4 };
	// 		return { chordSize: "2.5rem", maxPerRow: 5 };
	// 	}
	// }
</script>

<div class="randomizer-page">
	<div class="chords-area">
		{#if !currentProg}
			<h2 class="placeholder-text">Tap to get some<br/>chords</h2>
		{:else}
			<div 
				class="chords-display" 
				class:with-instrument={hasInstrument}
				style="--chord-count: {currentProg.chords.length}"
			>
				{#each currentProg.chords as chord, index}
					<Chord
						{chord}
						isPlaying={playingChordIndex === index}
						baseHue={currentBaseHue}
					/>
				{/each}
			</div>
		{/if}
	</div>

	<div class="controls-fixed">
		<div class="controls-container">
			<SecondaryButton
				onClick={transposeDown}
				title="Transpose down (♭)"
				icon={bemolIcon}
			/>

			<GenerateButton onClick={generateProgression} size={90} />

			<SecondaryButton
				onClick={transposeUp}
				title="Transpose up (♯)"
				icon={sharpIcon}
			/>
		</div>

		<div class="rollback-container">
			<SecondaryToggleButton
				onClick={toggleLoop}
				icon={Repeat2}
				size={42}
				toggled={isLooping}
				title="Toggle loop playback"
			/>
			<RollbackButton onClick={rollback} visible={showRollback} />
			<SecondaryButton
				onClick={playFullProgression}
				icon={Play}
				size={42}
				title="Play progression"
			/>
		</div>
	</div>
</div>

<style>
	.randomizer-page {
		display: flex;
		flex-direction: column;
		height: 70vh;
	}

	.chords-area {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 0;
		overflow: hidden;
		width: 100%;
		box-sizing: border-box;
	}

	.placeholder-text {
		top: 30%;
		position: absolute;
		color: var(--text-tertiary);
		font-family: "Boleroesque", cursive;
		font-weight: 600;
		font-style: italic;
		font-size: clamp(2rem, 8vw, 4rem);
		text-align: center;
	}

	.chords-display {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-content: center;
		align-items: flex-start;
		gap: clamp(0.3rem, 1vmin, 1rem);
		width: 100%;
		height: 100%;
		padding: 0.5rem;
		box-sizing: border-box;
		container-type: size;
		--chord-base-font-size: clamp(1.6rem, 12cqmin, 12rem);
		--ukulele-scale: clamp(1rem, 8cqmin, 8rem);
	}
	.chords-display.with-instrument {
		--chord-base-font-size: clamp(0.6rem, 6cqmin, 4.5rem);
		--ukulele-scale: clamp(0.6rem, 7cqmin, 3.5rem);
	}
	.controls-fixed {
		height: fit-content;
		flex-shrink: 0;
		display: flex;
		position: fixed;
		bottom: 2%;
		left: 0%;
		width: 100%;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		padding: 1rem 0;
	}
	/* if on mobile */
	@media (max-width: 768px) {
		.controls-fixed {
			margin-bottom: -2rem;
			position: fixed;
			bottom: 12%;
			left: 0;
			width: 100%;
			padding: 0.75rem 0;
			background-color: var(--bg-primary);
			z-index: 10;
		}
	}

	.controls-container {
		display: flex;
		gap: 0.8rem;
		align-items: center;
	}

	.rollback-container {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.95rem;
		padding-bottom: 1rem;
	}
</style>
