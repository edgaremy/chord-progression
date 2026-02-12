<script lang="ts">
	import { filters, isDefaultFilters, resetFilters } from '$lib/stores';
	import ResetButton from '../components/ResetButton.svelte';

	let currentFilters = $state($filters);
	let isDefault = $state($isDefaultFilters);

	$effect(() => {
		currentFilters = $filters;
		isDefault = $isDefaultFilters;
	});

	const chordTypeLabels = ['minimal', 'variations only', 'seventh only', 'seventh & variations', 'any'];
	const maxChordsLabels = ['2', '3', '4', '5', '6', '7', '8', '9', 'any'];

	function updateFilters() {
		filters.set(currentFilters);
	}

	function handleChordTypeChange(e: Event) {
		const target = e.target as HTMLInputElement;
		currentFilters.chordType = parseInt(target.value);
		updateFilters();
	}

	function handleMaxChordsChange(e: Event) {
		const target = e.target as HTMLInputElement;
		currentFilters.maxChords = parseInt(target.value);
		updateFilters();
	}

	// Calculate slider progress percentage
	function getSliderProgress(value: number, max: number): number {
		return (value / max) * 100;
	}
</script>

<div class="filters-container">
	<div class="title-header">
		<h1 class="page-title">Set<br>Filters</h1>
		{#if !isDefault}
			<ResetButton onClick={resetFilters} />
		{/if}
	</div>

	<div class="filter-item">
		<div class="filter-label">Chord type: {chordTypeLabels[currentFilters.chordType]}</div>
		<div class="slider-container">
			<div class="slider-track">
				{#each Array(5) as _, i}
					<div class="slider-dot" class:filled={i <= currentFilters.chordType}></div>
				{/each}
			</div>
			<input
				type="range"
				min="0"
				max="4"
				value={currentFilters.chordType}
				oninput={handleChordTypeChange}
				class="slider"
				style="--progress: {getSliderProgress(currentFilters.chordType, 4)}%"
			/>
		</div>
	</div>

	<div class="filter-item">
		<div class="filter-label">Max number of Chords: {maxChordsLabels[currentFilters.maxChords]}</div>
		<div class="slider-container">
			<div class="slider-track">
				{#each Array(9) as _, i}
					<div class="slider-dot" class:filled={i <= currentFilters.maxChords}></div>
				{/each}
			</div>
			<input
				type="range"
				min="0"
				max="8"
				value={currentFilters.maxChords}
				oninput={handleMaxChordsChange}
				class="slider"
				style="--progress: {getSliderProgress(currentFilters.maxChords, 8)}%"
			/>
		</div>
	</div>
</div>

<style>
	.filters-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 0rem;
	}

	.title-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 3rem;
		margin-bottom: 5rem;
		gap: 1rem;
	}

	.page-title {
		font-size: 3rem;
		font-weight: 700;
		margin: 0;
		color: var(--text-primary);
		font-family: "Boleroesque", cursive;
	}

	.filter-item {
		padding: 1.5rem;
		margin-bottom: 1rem;
		background-color: var(--bg-secondary);
		border-radius: 15px;
	}

	.filter-label {
		font-size: 1rem;
		color: var(--text-primary);
		margin-bottom: 1rem;
	}

	.slider-container {
		width: 100%;
		position: relative;
	}

	.slider-track {
		position: absolute;
		top: 50%;
		left: 0;
		right: 0;
		transform: translateY(-50%);
		display: flex;
		justify-content: space-between;
		padding: 0 6px;
		pointer-events: none;
		z-index: 0;

	}

	.slider-dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background-color: var(--bg-primary);
		transform: translateY(-1rem);
	}

	.slider-dot.filled {
		background-color: var(--accent-primary);
	}

	.slider {
		width: 100%;
		height: 8px;
		border-radius: 4px;
		outline: none;
		-webkit-appearance: none;
		appearance: none;
		background: linear-gradient(
			to right,
			var(--accent-primary) 0%,
			var(--accent-primary) var(--progress),
			var(--bg-primary) var(--progress),
			var(--bg-primary) 100%
		);
		cursor: pointer;
		position: relative;
		z-index: 1;
	}

	:root[data-theme='dark'] {
		--slider-unfilled: #3a3a3a;
	}

	:root[data-theme='light'] {
		--slider-unfilled: #d0d0d0;
	}

	.slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 12px;
		height: 32px;
		border-radius: 6px;
		background: var(--accent-primary);
		cursor: pointer;
	}

	.slider::-moz-range-thumb {
		width: 12px;
		height: 32px;
		border-radius: 6px;
		background: var(--accent-primary);
		cursor: pointer;
		border: none;
	}
</style>