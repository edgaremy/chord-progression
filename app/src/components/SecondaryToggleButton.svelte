<script lang="ts">
	import type { Component } from "svelte";

	export let onClick: () => void;
	export let title: string = "";
	export let icon: Component | any = undefined;
	export let size: number = 66;
	export let toggled: boolean = false;
</script>

<button
	class="secondary-toggle-button"
	class:toggled
	onclick={onClick}
	{title}
	style="width: {size}px; height: {size}px;"
>
	{#if icon}
		<svelte:component this={icon} size={size * 0.5} />
	{/if}
</button>

<style>
	.secondary-toggle-button {
		background-color: var(--bg-tertiary);
		border: none;
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: none;
		padding: 0;
		color: var(--text-accent-secondary);
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}

	.secondary-toggle-button.toggled {
		background-color: var(--bg-secondary);
		color: var(--btn-border-hover);
	}

	@media (hover: hover) {
		.secondary-toggle-button:hover {
			animation: jump 0.2s linear;
		}
	}

	@keyframes jump {
		0% {
			transform: translateY(0);
		}
		10% {
			transform: translateY(-6px) scaleX(0.9) scaleY(1.1);
		}
		80% {
			transform: translateY(4px) scaleX(1.1) scaleY(0.9);
		}
		100% {
			transform: translateY(0);
		}
	}

	.secondary-toggle-button:active {
		transform: scaleX(1.05) scaleY(0.96);
		transition:
			transform 0.04s,
			background-color 0.02s ease-in;
		background-color: var(--btn-bg-hover);
		border: 3px solid var(--btn-border-hover);
	}
</style>
