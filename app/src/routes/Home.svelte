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
				<span class="mobile-title">
					<span class="title-line title-line-1">C H O R D</span>
					<span class="title-line title-line-2">P R O G</span>
					<span class="title-line title-line-3">R E S S</span>
					<span class="title-line title-line-4">I O N S</span>
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
	}

	.title-container {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 80%;
		height: 100%;
		letter-spacing: -0.15rem;
		line-height: 1;
		user-select: none;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		pointer-events: none;
		padding: 2rem;
	}

	.piano-icon {
		width: clamp(8rem, 25vw, 16rem);
		height: clamp(8rem, 25vw, 16rem);
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -100%);
		z-index: 10;
		filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
		animation: float 3s ease-in-out infinite;
		object-fit: contain;
	}

	@media (min-width: 768px) {
		.piano-icon {
			width: clamp(13rem, 15vw, 16rem);
			height: clamp(13rem, 15vw, 16rem);
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
		font-family: "Boleroesque", cursive;
		font-size: clamp(3rem, 8vw, 8rem);
		font-weight: 700;
		margin: 0;
		color: var(--text-primary);
		z-index: 1;
		text-align: center;
		width: 100%;
		position: relative;
	}

	.mobile-title {
		display: flex;
		flex-direction: column;
		font-size: clamp(3rem, 14vw, 8rem);
		text-align: justify;
		text-align-last: justify;
		letter-spacing: -0.15em;
		/* Constrain width to maintain square-ish aspect ratio */
		max-width: min(90vw, calc(var(--title-height) * 1.1));
		aspect-ratio: 1 / 1;
	}

	.title-line {
		display: block;
		width: 100%;
	}

	.desktop-title {
		display: none;
		font-size: clamp(4rem, 9vw, 8rem);
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
