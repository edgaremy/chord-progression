<script lang="ts">
	import type { Component } from 'svelte';

	export let onClick: () => void;
	export let title: string = '';
	export let icon: Component | any = undefined;
	export let size: number = 66;
	export let toggled: boolean = false;
</script>

<button 
	class="secondary-toggle-button" 
	class:toggled
	onclick={onClick} 
	title={title} 
	style="width: {size}px; height: {size}px;">
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
	}

	.secondary-toggle-button.toggled {
		background-color: var(--bg-secondary);
		color: var(--text-accent-primary);
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
		transform: scaleX(1.1) scaleY(0.95);
	}
</style>
