<script lang="ts">
	import type { Chord } from "$lib/chords/Chord";
	import { getSoundEngine } from "$lib/sound-engine";
	import UkuleleChord from "./UkuleleChord.svelte";
	import { ukuleleSettings } from "$lib/stores";

	interface Props {
		chord: Chord;
		baseHue?: number;
		size?: string;
	}

	let { chord, baseHue = 0, size = "2rem" }: Props = $props();

	let isPlaying = $state(false);

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
		if (isPlaying) return;

		isPlaying = true;
		try {
			const soundEngine = getSoundEngine();
			const notes = chord.getNotes();
			await soundEngine.playChord(notes, 2, 0.7);

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
	class:playing={isPlaying}
	style="background-color: {colors.bg}; color: {colors.text}; font-size: {size};"
	onclick={playChord}
	title="Click to play chord"
	type="button"
>
	<span class="chord-name">
		{chord.toString()}
	</span>
	{#if $ukuleleSettings.enabled}
		<UkuleleChord {chord} />
	{/if}
</button>

<style>
	.chord {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		border-radius: 1rem;
		padding: 0.5rem 1rem;
		font-weight: bold;
		transition:
			transform 0.1s,
			box-shadow 0.2s;
		white-space: nowrap;
		border: none;
		cursor: pointer;
		font-family: inherit;
	}

	@media (hover: hover) and (pointer: fine) {
		.chord:hover {
			transform: translateY(-4px);
		}
	}

	.chord:active {
		transform: scaleX(1.02) scaleY(0.94);
	}

	.chord.playing {
		/* box-shadow: 0 0 20px rgba(255, 255, 255, 0.5); */
		animation: jump 0.5s linear;
	}

	@keyframes jump {
		0%,
		100% {
			transform: translateY(0);
		}
		10% {
			transform: translateY(-35px) scaleX(0.9) scaleY(1.1);
		}
		70% {
			transform: translateY(-35px) scaleX(0.9) scaleY(1.1);
		}

		/* 80% {
			transform: translateY(0) scaleX(0.9) scaleY(1);
		} */
		90% {
			transform: translateY(1px) scaleX(1.1) scaleY(0.9);
		}
	}
</style>
