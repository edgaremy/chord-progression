<script lang="ts">
	import { VolumeX, Volume2 } from 'lucide-svelte';
	import { autoPlayAudio } from '$lib/stores';

	let isAutoPlay = $state($autoPlayAudio);

	$effect(() => {
		isAutoPlay = $autoPlayAudio;
	});

	function toggleAutoPlay(enabled: boolean) {
		autoPlayAudio.set(enabled);
	}
</script>

<div class="sound-toggle">
	<button
		class="sound-option"
		class:selected={!isAutoPlay}
		onclick={() => toggleAutoPlay(false)}
		aria-label="Audio off"
	>
		<VolumeX size={20} />
	</button>
	<button
		class="sound-option"
		class:selected={isAutoPlay}
		onclick={() => toggleAutoPlay(true)}
		aria-label="Audio on"
	>
		<Volume2 size={20} />
	</button>
</div>

<style>
	.sound-toggle {
		display: flex;
		align-items: center;
		background-color: var(--bg-tertiary);
		border-radius: 9999px;
		padding: 0.25rem;
		gap: 0.25rem;
	}

	.sound-option {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		border: none;
		background: transparent;
		color: var(--text-secondary);
		cursor: pointer;
		border-radius: 9999px;
		transition: all 0.2s ease;
		min-width: 40px;
	}

	.sound-option:hover {
		background-color: var(--bg-secondary);
		color: var(--text-primary);
	}

	.sound-option.selected {
		background-color: var(--bg-primary);
		color: var(--text-primary);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
	}
</style>
