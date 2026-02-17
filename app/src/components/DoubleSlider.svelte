<script lang="ts">
	interface Props {
		min: number;
		max: number;
		onChange: (min: number, max: number) => void;
	}

	let { min, max, onChange }: Props = $props();

	// Slider values (0-6 representing 2-8+)
	// Note: slider1 and slider2 are independent - they can cross freely
	let slider1Value = $state(0);
	let slider2Value = $state(6);
	let showSlider1Label = $state(false);
	let showSlider2Label = $state(false);

	const labels = ['2', '3', '4', '5', '6', '7', '8+'];

	// Initialize from props
	$effect(() => {
		slider1Value = min;
		slider2Value = max;
	});

	function handleSlider1Input(e: Event) {
		const target = e.target as HTMLInputElement;
		slider1Value = parseInt(target.value);
		showSlider1Label = true;
	}

	function handleSlider2Input(e: Event) {
		const target = e.target as HTMLInputElement;
		slider2Value = parseInt(target.value);
		showSlider2Label = true;
	}

	function handleSlider1MouseDown() {
		showSlider1Label = true;
	}

	function handleSlider2MouseDown() {
		showSlider2Label = true;
	}

	function handleSlider1End() {
		showSlider1Label = false;
		// Always order the values properly before calling onChange
		const orderedMin = Math.min(slider1Value, slider2Value);
		const orderedMax = Math.max(slider1Value, slider2Value);
		onChange(orderedMin, orderedMax);
	}

	function handleSlider2End() {
		showSlider2Label = false;
		// Always order the values properly before calling onChange
		const orderedMin = Math.min(slider1Value, slider2Value);
		const orderedMax = Math.max(slider1Value, slider2Value);
		onChange(orderedMin, orderedMax);
	}

	// Calculate position for labels and filled rail
	function getPosition(value: number): number {
		return (value / 6) * 100;
	}

	// Get the left and right positions for the rail highlight
	// This ensures the highlight is always between the two sliders regardless of order
	function getRailLeft(): number {
		return Math.min(getPosition(slider1Value), getPosition(slider2Value));
	}

	function getRailRight(): number {
		return 100 - Math.max(getPosition(slider1Value), getPosition(slider2Value));
	}
</script>

<div class="double-slider">
	<div class="slider-labels">
		{#each labels as label, i}
			<span class="label" style="--pos: {(i / 6) * 100}%">{label}</span>
		{/each}
	</div>

	<div class="slider-container">
		<!-- Rail tracks (base background) -->
		<div class="slider-rail"></div>
		
		<!-- Filled rail between slider1 and slider2 -->
		<div
			class="slider-rail-filled"
			style="left: {getRailLeft()}%; right: {getRailRight()}%"
		></div>

		<!-- Slider 1 (arrow pointing down) -->
		{#if showSlider1Label}
			<div class="value-label slider1-label" style="left: {getPosition(slider1Value)}%">
				{labels[slider1Value]}
			</div>
		{/if}
		<input
			type="range"
			min="0"
			max="6"
			step="1"
			value={slider1Value}
			oninput={handleSlider1Input}
			onchange={handleSlider1End}
			onmousedown={handleSlider1MouseDown}
			ontouchstart={handleSlider1MouseDown}
			onmouseup={handleSlider1End}
			ontouchend={handleSlider1End}
			class="slider slider1"
			style="--value: {getPosition(slider1Value)}%"
		/>

		<!-- Slider 2 (arrow pointing up) -->
		{#if showSlider2Label}
			<div class="value-label slider2-label" style="left: {getPosition(slider2Value)}%">
				{labels[slider2Value]}
			</div>
		{/if}
		<input
			type="range"
			min="0"
			max="6"
			step="1"
			value={slider2Value}
			oninput={handleSlider2Input}
			onchange={handleSlider2End}
			onmousedown={handleSlider2MouseDown}
			ontouchstart={handleSlider2MouseDown}
			onmouseup={handleSlider2End}
			ontouchend={handleSlider2End}
			class="slider slider2"
			style="--value: {getPosition(slider2Value)}%"
		/>
	</div>
</div>

<style>
	.double-slider {
		width: 100%;
		padding: 0.5rem 0;
	}

	.slider-labels {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.5rem;
		position: relative;
		padding: 0 6px;
	}

	.label {
		font-size: 1rem;
		font-weight: bold;
		color: var(--text-secondary);
		position: absolute;
		left: var(--pos);
		transform: translateX(-50%) translateY(-50%);
	}

	.slider-container {
		position: relative;
		height: 60px;
		display: flex;
		align-items: center;
	}

	/* Base rail track */
	.slider-rail {
		position: absolute;
		width: 100%;
		height: 10px;
		background: var(--bg-primary);
		border-radius: 4px;
		z-index: 0;
	}

	/* Filled rail between the two sliders */
	.slider-rail-filled {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		height: 10px;
		background: var(--accent-primary);
		border-radius: 4px;
		pointer-events: none;
		z-index: 1;
	}

	.slider {
		position: absolute;
		width: 100%;
		height: 8px;
		border-radius: 4px;
		outline: none;
		-webkit-appearance: none;
		appearance: none;
		background: transparent;
		cursor: pointer;
		pointer-events: none;
	}

	.slider::-webkit-slider-runnable-track {
		width: 100%;
		height: 8px;
		background: transparent;
		border-radius: 4px;
	}

	.slider::-moz-range-track {
		width: 100%;
		height: 8px;
		background: transparent;
		border-radius: 4px;
	}

	.slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		pointer-events: all;
		cursor: pointer;
		border: none;
	}

	.slider::-moz-range-thumb {
		pointer-events: all;
		cursor: pointer;
		border: none;
	}

	/* Slider 1 thumb (house pointing down - reversed house) */
	.slider1 {
		z-index: 3;
	}

	.slider1::-webkit-slider-thumb {
		width: 12px;
		height: 24px;
		background: var(--accent-primary);
		clip-path: polygon(0% 0%, 100% 0%, 100% 60%, 50% 100%, 0% 60%);
		transform: translateY(-8px);
	}

	.slider1::-moz-range-thumb {
		width: 12px;
		height: 24px;
		background: var(--accent-primary);
		clip-path: polygon(0% 0%, 100% 0%, 100% 60%, 50% 100%, 0% 60%);
		transform: translateY(-8px);
	}

	/* Slider 2 thumb (house pointing up) */
	.slider2 {
		z-index: 2;
	}

	.slider2::-webkit-slider-thumb {
		width: 12px;
		height: 24px;
		background: var(--accent-primary);
		clip-path: polygon(50% 0%, 100% 40%, 100% 100%, 0% 100%, 0% 40%);
		transform: translateY(8px);
	}

	.slider2::-moz-range-thumb {
		width: 12px;
		height: 24px;
		background: var(--accent-primary);
		clip-path: polygon(50% 0%, 100% 40%, 100% 100%, 0% 100%, 0% 40%);
		transform: translateY(8px);
	}

	.value-label {
		position: absolute;
		padding: 0.25rem 0.5rem;
		background: var(--bg-primary);
		border-radius: 15px;
		font-size: 2rem;
		color: var(--text-primary);
		font-weight: 500;
		transform: translateX(-50%);
		pointer-events: none;
		white-space: nowrap;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	}

	.slider1-label {
		top: -2rem;
		z-index: 4;
	}

	.slider2-label {
		top: -2rem;
		z-index: 4;
	}
</style>
