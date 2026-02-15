<script lang="ts">
	import { Router } from "@mateothegreat/svelte5-router";
	import { onMount } from 'svelte';
	import { loadProgressions } from '$lib/stores';
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

	// Load progressions on mount
	onMount(async () => {
		await loadProgressions();
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

	<main class="main-content">
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

	.main-content {
		padding: 0rem;
	}

	.router-container {
		height: 100%;
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 0;
		transition: background-color 0.3s ease;
	}
</style>