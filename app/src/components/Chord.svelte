<script lang="ts">
	import type { Chord } from "$lib/chords/Chord";
	import { getSoundEngine } from "$lib/sound-engine";
	import StringChord from "$components/strings/StringsChord.svelte";
	import PianoChord from "$components/PianoChord.svelte";
	import { instrumentSettings } from "$lib/stores";

	interface Props {
		chord: Chord;
		baseHue?: number;
		isPlaying?: boolean;
	}

	let {
		chord,
		baseHue = 0,
		isPlaying: externalIsPlaying = false,
	}: Props = $props();

	let isPlaying = $state(false);
	let displayPlaying = $derived(isPlaying || externalIsPlaying);
	let hasInstrument = $derived($instrumentSettings.type !== "none");

	function getChordColor(
		chord: Chord,
		baseHue: number,
	): { bg: string; text: string } {
		const bgColor = chord.getColor(baseHue);
		// Parse HSL to get hue value
		const hslMatch = bgColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
		if (hslMatch) {
			const [, h] = hslMatch;
			return {
				bg: `hsl(${h}, var(--chord-bg-saturation), var(--chord-bg-luminance))`,
				text: `hsl(${h}, var(--chord-text-saturation), var(--chord-text-luminance))`,
			};
		}
		return { bg: bgColor, text: "#ffffff" };
	}

	async function playChord() {
		const soundEngine = getSoundEngine();

		isPlaying = true;
		try {
			const chordNotes = chord.getNotes();
			await soundEngine.playChord(chordNotes, 2, 0.7);

			// Wait for chord to finish playing
			setTimeout(() => {
				isPlaying = false;
			}, 2000);
		} catch (error) {
			console.error("Error playing chord:", error);
			isPlaying = false;
		}
	}

	let colors = $derived(getChordColor(chord, baseHue));
</script>

<button
	class="chord"
	class:playing={displayPlaying}
	class:has-instrument={hasInstrument}
	style="background-color: {colors.bg}; color: {colors.text}; border: 2px solid {colors.text}; box-shadow: 0 3px 0 {colors.text};"
	onclick={playChord}
	title="Click to play chord"
	type="button"
>
	<div class="chord-content">
		<span class="chord-name">
			{chord.toString()}
		</span>
		{#if $instrumentSettings.type === "piano"}
			<PianoChord {chord} textColor={colors.text} />
		{:else if $instrumentSettings.type === "guitar" || $instrumentSettings.type === "ukulele"}
			<StringChord {chord} />
		{/if}
	</div>
</button>

<style>
	.chord {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		transition:
			transform 0.12s,
			box-shadow none;
		border: none;
		cursor: pointer;
		font-family: inherit;
		position: relative;
		overflow: visible;
		padding: clamp(0.3rem, 2vmin, 1rem);
		border-radius: clamp(0.6rem, 2vmin, 2rem);
		flex-shrink: 1;
		width: fit-content;
		max-width: 100%;
		height: fit-content;
		max-height: 100%;
		box-sizing: border-box;
	}

	.chord-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: calc(var(--chord-base-font-size) * 0.3);
		white-space: nowrap;
		box-sizing: border-box;
	}

	.chord-name {
		font-size: var(--chord-base-font-size);
		line-height: 1;
	}

	@media (hover: hover) and (pointer: fine) {
		.chord:hover {
			transform: translateY(-3px);
		}
	}

	.chord:active {
		transform: translateY(5px) scaleX(1.01) scaleY(0.96);
		box-shadow: 0 5px 0 transparent !important;
	}

	.chord.playing {
		animation: jump 0.5s ease;
		z-index: 10;
	}

	@keyframes jump {
		0% {
			transform: translateY(5px);
		}
		10% {
			transform: translateY(-2rem) scaleX(0.9) scaleY(1.1);
		}
		60% {
			transform: translateY(-2rem) scaleX(0.9) scaleY(1.1);
		}
		80% {
			transform: translateY(0.1rem) scaleX(1) scaleY(0.9);
		}
		100% {
			transform: translateY(0px);
		}
	}
</style>
