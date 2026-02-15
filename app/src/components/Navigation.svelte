<script lang="ts">
	import { House, Dices, FlaskConical, Settings } from "lucide-svelte";

	const routes = [
		{ path: "/", label: "Home", icon: House },
		{ path: "/randomizer", label: "Randomizer", icon: Dices },
		{ path: "/filters", label: "Filters", icon: FlaskConical },
		{ path: "/settings", label: "Settings", icon: Settings },
	];

	let currentPath = $state("/");

	$effect(() => {
		if (typeof window !== "undefined") {
			currentPath = window.location.pathname;

			// Listen for navigation events
			const handleNavigation = () => {
				currentPath = window.location.pathname;
			};

			const handleCustomNavigate = (e: Event) => {
				currentPath = window.location.pathname;
			};

			window.addEventListener("popstate", handleNavigation);
			window.addEventListener("navigate", handleCustomNavigate);

			return () => {
				window.removeEventListener("popstate", handleNavigation);
				window.removeEventListener("navigate", handleCustomNavigate);
			};
		}
	});

	function navigate(path: string) {
		if (path !== currentPath) {
			window.history.pushState({}, "", path);
			currentPath = path;

			// Dispatch a custom event to notify the router
			const event = new CustomEvent("navigate", { detail: { path } });
			window.dispatchEvent(event);
		}
	}
</script>

<nav class="nav-container">
	<div class="nav-content">
		{#each routes as route}
			{@const IconComponent = route.icon}
			{@const isActive = currentPath === route.path}
			<button
				class="nav-item"
				class:active={isActive}
				onclick={() => navigate(route.path)}
				title={route.label}
			>
				<div class="nav-icon-container">
					<IconComponent size={24} />
				</div>
				<span class="nav-item-label" class:active={isActive}
					>{route.label}</span
				>
			</button>
		{/each}
	</div>
</nav>

<style>
	.nav-container {
		background-color: var(--bg-secondary);
		padding: 0.4rem 0;
		position: sticky;
		top: 0;
		z-index: 100;
		width: 100%;
		border: none;
		box-shadow: none;
	}

	.nav-content {
		display: flex;
		justify-content: space-around;
		max-width: 800px;
		margin: 0 auto;
		width: 100%;
	}

	.nav-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		padding: 0.5rem 0;
		background: none;
		border: none;
		color: var(--text-accent-secondary);
		cursor: pointer;
		transition: color 0.2s ease;
		flex: 1;
		min-width: 50px;
		border-radius: 50px;
		margin: 0 0.4rem;
	}

	.nav-item:hover {
		color: var(--text-accent-primary);
	}

	.nav-item.active {
		color: var(--text-accent-primary);
	}

	.nav-icon-container {
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		transform: translateY(6px);
		transition: transform 0.3s ease;
	}

	.nav-item.active .nav-icon-container {
		transform: translateY(-2px);
		animation: iconRaise 0.4s ease;
	}

	@keyframes iconRaise {
		0% {
			transform: translateY(6px);
		}
		100% {
			transform: translateY(-2px);
		}
	}

	.nav-item-label {
		font-size: 0.75rem;
		text-align: center;
		white-space: nowrap;
		/* overflow: hidden; */
		/* text-overflow: ellipsis; */
		width: 100%;
		opacity: 0;
		transition:
			opacity 0.3s ease,
			transform 0.3s ease;
		max-height: 0;
	}

	.nav-item:hover:not(.active) .nav-item-label {
		opacity: 0;
	}

	.nav-item-label.active {
		opacity: 1;
		/* transform: translateY(-5px); */
		max-height: 20px;
		/* animation: labelPop 0.3s ease; */
	}

	@keyframes labelPop {
		0% {
			opacity: 0;
			transform: translateY(-5px);
		}
		100% {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Mobile styles */
	@media (max-width: 768px) {
		.nav-container {
			position: fixed;
			bottom: 0;
			top: auto;
			left: 0;
			right: 0;
			border: none;
		}

		.nav-content {
			max-width: 100%;
			padding: 0;
		}
	}
</style>
