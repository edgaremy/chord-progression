<script lang="ts">
	import { Router } from "@mateothegreat/svelte5-router";
	import { onMount } from 'svelte';
	import { loadProgressions } from '$lib/stores';
	import { getSoundEngine } from '$lib/sound-engine';
	import Navigation from './components/Navigation.svelte';
	import Home from "./routes/Home.svelte";
	import Randomizer from "./routes/Randomizer.svelte";
	import Filters from "./routes/Filters.svelte";
	import SettingsPage from "./routes/Settings.svelte";

	let isMobile = $state(false);
	let currentRoute = $state('/');

	$effect(() => {
		if (typeof window !== "undefined") {
			const checkMobile = () => {
				isMobile = window.innerWidth <= 768;
			};

			checkMobile();
			window.addEventListener("resize", checkMobile);

			// Handle custom navigation events
			const handleNavigate = (event: CustomEvent) => {
				currentRoute = event.detail.path;
			};

			window.addEventListener('navigate', handleNavigate as EventListener);

			return () => {
				window.removeEventListener("resize", checkMobile);
				window.removeEventListener('navigate', handleNavigate as EventListener);
			};
		}
	});

	// Load progressions and initialize sound engine on mount
	onMount(async () => {
		await loadProgressions();
		
		// Pre-create sound engine instance (but don't load samples yet)
		// Samples will load on first user interaction to satisfy browser autoplay policies
		getSoundEngine();
	});

	const routes = [
		{ path: "/", component: Home },
		{ path: "/randomizer", component: Randomizer },
		{ path: "/filters", component: Filters },
		{ path: "/settings", component: SettingsPage },
	];
</script>

<div id="app">
	<Navigation />

	<main style="padding-bottom: {isMobile ? '70px' : '0'}">
		<div class="router-container">
			<Router {routes} />
		</div>
	</main>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
		min-height: 100vh;
		background-color: var(--bg-primary);
		color: var(--text-primary);
		transition: background-color 0.3s ease;
	}

	#app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.router-container {
		flex: 1;
		padding: 1rem;
		transition: background-color 0.3s ease;
	}
</style>