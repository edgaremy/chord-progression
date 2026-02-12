<script lang="ts">
	import piano from "$assets/piano.svg";
	import {
		allProgressions,
		generateRandomProgression,
		currentProgression,
		filters,
		baseHue,
		previousBaseHue,
	} from "$lib/stores";
	import { get } from "svelte/store";

	function navigateToRandomizer() {
		// Generate a progression before navigating
		const progs = get(allProgressions);
		const currentFilters = get(filters);
		const newProg = generateRandomProgression(progs, currentFilters);
		if (newProg) {
			const currentProg = get(currentProgression);
			if (currentProg) {
				previousBaseHue.set(get(baseHue));
			}
			currentProgression.set(newProg);
			baseHue.set(Math.floor(Math.random() * 360));
		}

		// Navigate to randomizer
		window.history.pushState({}, "", "/randomizer");
		const event = new CustomEvent("navigate", {
			detail: { path: "/randomizer" },
		});
		window.dispatchEvent(event);
	}
</script>

<div class="home-page">
	<div class="title-container">
		<img src={piano} alt="Piano" class="piano-icon" />
		<h1 class="home-title">
			<span class="mobile-title">
				<span class="title-line title-line-1">C H O R D</span>
				<span class="title-line title-line-2">P R O G</span>
				<span class="title-line title-line-3">R E S S</span>
				<span class="title-line title-line-4">I O N S</span>
			</span>
			<span class="desktop-title">CHORD PROGRESSIONS</span>
		</h1>
	</div>
	<button
		class="btn btn-primary btn-generate-home"
		onclick={navigateToRandomizer}
	>
		<span class="start-text">Start Generating</span>
	</button>
</div>

<style>
	.home-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
		min-height: calc(100vh - 140px);
		padding: 4rem 5% 3rem 5%;
		text-align: center;
	}

	@media (min-width: 768px) {
		.home-page {
			justify-content: center;
			gap: 3rem;
		}
	}

	.title-container {
		position: relative;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		min-height: 150px;
		margin-top: 8rem;
		letter-spacing: -0.15rem;
		line-height: 1;
		user-select: none;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		pointer-events: none;
	}

	@media (min-width: 768px) {
		.title-container {
			margin-top: 0rem;
		}
	}

	.piano-icon {
		width: clamp(13rem, 8vw, 16rem);
		height: clamp(13rem, 8vw, 16rem);
		position: absolute;
		top: 15%;
		left: 50%;
		transform: translate(-50%, -100%);
		z-index: 10;
		filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
		animation: float 3s ease-in-out infinite;
	}

	@media (min-width: 768px) {
		.piano-icon {
			top: 70%;
		}
	}

	@keyframes float {
		0%,
		100% {
			transform: translate(-50%, -100%);
		}
		50% {
			transform: translate(-50%, calc(-100% - 10px));
		}
	}

	.home-title {
		font-weight: 100;
		color: var(--text-primary);
		margin: 0;
		font-family: "Boleroesque", cursive;
		text-justify:inter-ideograph;
		width: 100%;
		position: relative;
		z-index: 1;
	}

	.mobile-title {
		display: flex;
		flex-direction: column;
		font-size: 16vw;
		display:inline-block;
		text-align: justify;
		text-align-last: justify;
		letter-spacing: -0.15em;
	}

	.title-line {
		display: block;
		width: 100%;
	}

	.desktop-title {
		display: none;
		font-size: 11vw;
	}

	@media (min-width: 768px) {
		.mobile-title {
			display: none;
		}

		.desktop-title {
			display: block;
		}
	}

	.btn-generate-home {
		font-size: 1.2rem;
		font-weight: 600;
		padding: 1rem 2rem;
		background-color: var(--btn-bg);
		border: 4px solid var(--btn-border);
		color: var(--btn-text);
		border-radius: 50px;
		cursor: pointer;
		box-shadow: 0px 6px var(--btn-border);
		z-index: 2;
		margin-top: 5rem;

	}

	@media (hover: hover) {
		.btn-generate-home:hover {
			background-color: var(--btn-bg-hover);
			border-color: var(--btn-border-hover);
			box-shadow: 0px 6px var(--btn-border-hover);
		}
	}

	.btn-generate-home:active {
		background-color: var(--btn-bg-hover);
		border: 4px solid var(--btn-border-hover);
		box-shadow: 0px 2px var(--btn-border-hover);
		transform: translateY(4px) scaleX(1.02) scaleY(0.98);
		transition: transform 0.05s;
	}

	.start-text {
		font-size: 1.3rem;
	}
</style>
