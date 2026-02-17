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
	<div class="content-container">
		<div class="title-container">
			<img src={piano} alt="Piano" class="piano-icon" />
			<h1 class="home-title">
				<span class="mobile-title">CHORD<br/>PROGRESSIONS
				</span>
				<span class="desktop-title">CHORD PROGRESSIONS</span>
			</h1>
		</div>
	</div>
	<div class="button-container">
		<button
			class="btn btn-primary btn-generate-home"
			onclick={navigateToRandomizer}
		>
			<span class="start-text">Start Generating</span>
		</button>
	</div>
</div>

<style>
	.home-page {
		display: flex;
		flex-direction: column;
		height: calc(100vh - 140px);
		overflow: hidden;
	}

	@media (min-width: 768px) {
		.home-page {
			height: 83vh;
		}
	}

	.content-container {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		min-height: 0;
		position: relative;
	}

	.button-container {
		height: 120px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		padding-bottom: 2rem;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}

	.title-container {
		position: relative;
		display: flex;
		width: 100%;
		height: 50%;
		letter-spacing: -0.15rem;
		line-height: 1;
		user-select: none;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		pointer-events: none;
		border-bottom: clamp(0.8rem, 3.5vw, 1.5rem) solid var(--text-primary);
		padding: 0 1rem;
	}

	/* @media (min-width: 768px) {
		.title-container {
			align-items: center;
		}
	} */

	.piano-icon {
		width: clamp(12rem, 25vw, 15rem);
		position: relative;
		bottom: -95%;
		left: 70%;
		z-index: 10;
		filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
		animation: float 3s ease-in-out infinite;
		object-fit: contain;
	}

	@media (min-width: 768px) {
		.piano-icon {
			width: clamp(12rem, 18vw, 18rem);
			bottom: -100%;
			left: 50%;
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
		font-family: "Boleroesque", cursive;
		font-weight: 700;
		margin: 0;
		position: absolute;
		bottom: 0%;
		color: var(--text-primary);
		z-index: 1;
		font-size: clamp(2rem, 11.5vw, 9rem);
	}

	.mobile-title {
		display: flex;
		flex-direction: column;
	}

	.desktop-title {
		display: none;
		text-align: center;
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
