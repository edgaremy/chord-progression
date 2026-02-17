<script lang="ts">
	import { filters, isDefaultFilters, resetFilters } from '$lib/stores';
	import ResetButton from '../components/ResetButton.svelte';
	import DoubleSlider from '../components/DoubleSlider.svelte';

	let currentFilters = $state($filters);
	let isDefault = $state($isDefaultFilters);

	$effect(() => {
		currentFilters = $filters;
		isDefault = $isDefaultFilters;
	});

	// Chord type constants: 0=minimal, 1=variations only, 2=seventh only, 3=seventh & variations, 4=any
	type ChordTypeMode = 'simple' | 'seventh' | 'variations' | 'all';

	// Get current mode from filter value
	function getCurrentMode(): ChordTypeMode {
		switch (currentFilters.chordType) {
			case 0:
				return 'simple';
			case 1:
				return 'variations';
			case 2:
				return 'seventh';
			case 3:
				return 'all'; // both seventh and variations
			case 4:
				return 'all';
			default:
				return 'all';
		}
	}

	// Get filter value from mode
	function getFilterValue(mode: ChordTypeMode): number {
		switch (mode) {
			case 'simple':
				return 0;
			case 'variations':
				return 1;
			case 'seventh':
				return 2;
			case 'all':
				return 4;
			default:
				return 4;
		}
	}

	function setChordType(mode: ChordTypeMode) {
		const currentMode = getCurrentMode();
		
		// Handle special case: if clicking seventh when variations is on, or vice versa
		if (mode === 'seventh' && currentMode === 'variations') {
			// Enable both (seventh & variations)
			currentFilters.chordType = 3;
		} else if (mode === 'variations' && currentMode === 'seventh') {
			// Enable both (seventh & variations)
			currentFilters.chordType = 3;
		} else {
			// Normal toggle behavior
			currentFilters.chordType = getFilterValue(mode);
		}
		
		filters.set(currentFilters);
	}

	function isChordTypeActive(mode: ChordTypeMode): boolean {
		const currentType = currentFilters.chordType;
		
		switch (mode) {
			case 'simple':
				return currentType === 0;
			case 'seventh':
				return currentType === 2 || currentType === 3;
			case 'variations':
				return currentType === 1 || currentType === 3;
			case 'all':
				return currentType === 4;
			default:
				return false;
		}
	}

	function updateFilters() {
		filters.set(currentFilters);
	}

	function handleRangeChange(min: number, max: number) {
		currentFilters.minChords = min;
		currentFilters.maxChords = max;
		updateFilters();
	}

	function toggleTrulyRandom() {
		currentFilters.trulyRandom = !currentFilters.trulyRandom;
		updateFilters();
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
		<div class="filter-label">Chord type</div>
		<div class="chord-type-buttons">
			<button
				class="chord-type-btn"
				class:active={isChordTypeActive('simple')}
				onclick={() => setChordType('simple')}
			>
				Simple
			</button>
			<button
				class="chord-type-btn"
				class:active={isChordTypeActive('seventh')}
				onclick={() => setChordType('seventh')}
			>
				Seventh
			</button>
			<button
				class="chord-type-btn"
				class:active={isChordTypeActive('variations')}
				onclick={() => setChordType('variations')}
			>
				Variations
			</button>
			<button
				class="chord-type-btn"
				class:active={isChordTypeActive('all')}
				onclick={() => setChordType('all')}
			>
				All
			</button>
		</div>
	</div>

	<div class="filter-item">
		<div class="filter-label">Number of Chords</div>
		<DoubleSlider 
			min={currentFilters.minChords} 
			max={currentFilters.maxChords} 
			onChange={handleRangeChange} 
		/>
	</div>

	<div class="filter-item inline">
		<div class="filter-label">Truly RANDOM Chords</div>
		<button
			class="random-toggle"
			class:active={currentFilters.trulyRandom}
			onclick={toggleTrulyRandom}
		>
			{currentFilters.trulyRandom ? 'ON' : 'OFF'}
		</button>
	</div>
</div>

<style>
	.filters-container {
		flex-direction: column;
		align-items: center;
		justify-content: center;
		justify-content: flex-start;
		padding-left: 1rem;
		padding-right: 1rem;
		margin-top: 0;
		margin-left: auto;
		margin-right: auto;
		width: 100%;
		max-width: 600px;
		margin-bottom: 10rem;
	}

	.title-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 5rem;
		margin-bottom: 4.5rem;
		gap: 1rem;
	}

	.page-title {
		font-size: 3rem;
		font-weight: 700;
		line-height: 1;
		margin: 0;
		color: var(--text-primary);
		font-family: "Boleroesque", cursive;
		letter-spacing: -0.02em;
	}

	.filter-item {
		padding: 1rem;
		margin-bottom: 0.9rem;
		background-color: var(--bg-secondary);
		border-radius: 15px;
	}

	.filter-item.inline {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.filter-label {
		font-size: 1rem;
		color: var(--text-primary);
		margin-bottom: 1rem;
	}

	.filter-item.inline .filter-label {
		margin-bottom: 0;
	}

	.chord-type-buttons {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		justify-content: center;
	}

	.chord-type-btn {
		padding: 0.5rem 1rem;
		border-radius: 9999px;
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.3s ease;
		border: none;
		background-color: transparent;
		font-size: 0.9rem;
		font-weight: 500;
	}

	.chord-type-btn:hover {
		color: var(--text-primary);
	}

	.chord-type-btn.active {
		background-color: var(--bg-primary);
		color: var(--text-primary);
	}

	.chord-type-btn:focus-visible {
		outline: 2px solid var(--accent-primary);
		outline-offset: 2px;
	}

	.random-toggle {
		padding: 0.5rem 1rem;
		border-radius: 9999px;
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.3s ease;
		border: none;
		background-color: transparent;
		font-size: 0.9rem;
		font-weight: 500;
		min-width: 4rem;
	}

	.random-toggle:hover {
		color: var(--text-primary);
	}

	.random-toggle.active {
		background-color: var(--btn-bg-hover);
		color: var(--btn-border-hover);
		font-weight: 800;
	}

	.random-toggle:focus-visible {
		outline: 2px solid var(--accent-primary);
		outline-offset: 2px;
	}
</style>