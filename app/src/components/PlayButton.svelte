<script lang="ts">
	import { Play, Square } from 'lucide-svelte';

	interface Props {
		isPlaying: boolean;
		onClick: () => void;
		size?: number;
		title?: string;
	}

	let { isPlaying, onClick, size = 66, title = "" }: Props = $props();
</script>

<button 
	class="play-button" 
	class:playing={isPlaying}
	onclick={onClick}
	{title}
	style="width: {size}px; height: {size}px;"
>
	{#if isPlaying}
		<Square size={size * 0.5} strokeWidth={2.5} fill="currentColor" />
	{:else}
		<Play size={size * 0.5} strokeWidth={2.5} fill="currentColor" />
	{/if}
</button>

<style>
	.play-button {
		background-color: var(--bg-tertiary);
		border: none;
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: none;
		padding: 0;
		color: var(--text-accent-secondary);
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}

	.play-button.playing {
		background-color: var(--bg-secondary);
		color: var(--btn-border-hover);
	}

	.play-button:active {
		transform: scaleX(1.05) scaleY(0.96);
		transition:
			transform 0.04s,
			background-color 0.02s ease-in;
		background-color: var(--btn-bg-hover);
		border: 3px solid var(--btn-border-hover);
	}
</style>
