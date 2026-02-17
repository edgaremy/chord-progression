<script lang="ts">
	interface Props {
		value: number;
		min: number;
		max: number;
		defaultValue: number;
		step?: number;
		magneticThreshold?: number;
		onChange: (value: number) => void;
		showPercentage?: boolean;
	}

	let {
		value = $bindable(),
		min,
		max,
		defaultValue,
		step = 0.01,
		magneticThreshold = 0.08,
		onChange,
		showPercentage = true
	}: Props = $props();

	let isDragging = $state(false);

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		let newValue = parseFloat(target.value);

		// Apply magnetic snap to default
		if (Math.abs(newValue - defaultValue) < magneticThreshold) {
			newValue = defaultValue;
		}

		value = newValue;
		onChange(newValue);
	}

	function handleEnd() {
		isDragging = false;
		// Apply magnetic snap on release
		if (Math.abs(value - defaultValue) < magneticThreshold) {
			value = defaultValue;
			onChange(defaultValue);
		}
	}

	function handleStart() {
		isDragging = true;
	}

	// Calculate position as percentage
	let sliderPosition = $derived(((value - min) / (max - min)) * 100);
	let defaultPosition = $derived(((defaultValue - min) / (max - min)) * 100);

	// Display value as percentage (defaultValue always = 100%)
	let displayPercentage = $derived(Math.round((value / defaultValue) * 100));
</script>

<div class="slider-container">
	<div class="slider-wrapper">
		<div class="slider-rail"></div>
		<div class="slider-rail-filled" style="width: {sliderPosition}%"></div>
		<div 
			class="default-marker" 
			class:before-slider={sliderPosition >= defaultPosition}
			style="left: {defaultPosition}%"
		></div>
		<input
			type="range"
			{min}
			{max}
			{step}
			{value}
			oninput={handleInput}
			onmouseup={handleEnd}
			ontouchend={handleEnd}
			onmousedown={handleStart}
			ontouchstart={handleStart}
			class="slider-input"
		/>
	</div>
	{#if showPercentage}
		<div class="value-display">{displayPercentage}%</div>
	{/if}
</div>

<style>
	.slider-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.slider-wrapper {
		position: relative;
		width: 100%;
		height: 30px;
		display: flex;
		align-items: center;
	}

	.slider-rail {
		position: absolute;
		width: 100%;
		height: 8px;
		background-color: var(--bg-primary);
		border-radius: 5px;
		z-index: 0;
	}

	.slider-rail-filled {
		position: absolute;
		height: 8px;
		background: var(--accent-primary);
		border-radius: 5px;
		z-index: 1;
		pointer-events: none;
		transition: width 0.05s ease-out;
	}

	.default-marker {
		position: absolute;
		width: 8px;
		height: 24px;
		background-color: var(--bg-primary);
		border-radius: 4px;
		z-index: 2;
		pointer-events: none;
		transform: translateX(-50%);
		top: 50%;
		margin-top: -12px;
		/* transition: background-color 0.05s ease-out; */
	}

	.default-marker.before-slider {
		background-color: var(--accent-primary);
	}

	.slider-input {
		position: relative;
		width: 100%;
		height: 30px;
		-webkit-appearance: none;
		appearance: none;
		background: transparent;
		outline: none;
		z-index: 3;
		cursor: pointer;
	}

	.slider-input::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 30px;
		height: 30px;
		background: var(--accent-primary);
		border: 3px solid var(--accent-primary);
		border-radius: 50%;
		cursor: pointer;
		transition: transform 0.1s ease;
	}

	.slider-input::-webkit-slider-thumb:hover {
		transform: scale(1.1);
	}

	.slider-input::-webkit-slider-thumb:active {
		transform: scale(1.05);
	}

	.slider-input::-moz-range-thumb {
		width: 30px;
		height: 30px;
		background: var(--accent-primary);
		border: 3px solid var(--accent-primary);
		border-radius: 50%;
		cursor: pointer;
		transition: transform 0.1s ease;
	}

	.slider-input::-moz-range-thumb:hover {
		transform: scale(1.1);
	}

	.slider-input::-moz-range-thumb:active {
		transform: scale(1.05);
	}

	.value-display {
		text-align: center;
		font-size: 1.1rem;
		color: var(--text-primary);
		font-weight: 600;
	}
</style>
