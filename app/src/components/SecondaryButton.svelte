<script lang="ts">
	import type { Component } from 'svelte';

	export let onClick: () => void;
	export let title: string = '';
	export let children: any = undefined;
	export let icon: string | Component | any = undefined;
	export let size: number = 66;
</script>

<button class="secondary-button" onclick={onClick} title={title} style="width: {size}px; height: {size}px;">
	{#if icon && typeof icon === 'string'}
		<img src={icon} alt={title} class="icon-svg" />
	{:else if icon && typeof icon !== 'string'}
		<svelte:component this={icon} size={size * 0.5} />
	{:else}
		<slot>{children}</slot>
	{/if}
</button>

<style>
	.secondary-button {
		background-color: var(--bg-tertiary);
		border: none;
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.2s;
		padding: 0;
		color: var(--text-accent-secondary);
		font-size: 2.5rem;
	}

	.icon-svg {
		width: 50%;
		height: 50%;
	}

	:global([data-theme="dark"]) .icon-svg {
		filter: invert(43%) sepia(89%) saturate(329%) hue-rotate(106deg) brightness(85%) contrast(88%);
	}

	:global([data-theme="light"]) .icon-svg {
		width: 55%;
		height: 55%;
		filter: invert(33%) sepia(49%) saturate(368%) hue-rotate(104deg) brightness(93%) contrast(96%);
	}

	@media (hover: hover) {
		.secondary-button:hover {
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

	.secondary-button:active {
		/* background-color: var(--bg-tertiary); */
		transform: scaleX(1.1) scaleY(0.95);
		transition:
			transform 0.05s,
			background-color 0.05s ease-in;
	}
</style>