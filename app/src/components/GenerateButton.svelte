<script lang="ts">
	import trumpet from "$assets/trumpet.svg";

	export let size: number = 70;
	export let onClick: () => void;
</script>

<button
	class="generate-button"
	onclick={onClick}
	title="Generate"
	style="--button-size: {size}px"
>
	<img
		src={trumpet}
		alt="Generate"
		class="generate-icon"
		style="width: {size * 0.65}px; height: {size * 0.65}px;"
	/>
</button>

<style>
	.generate-button {
		width: var(--button-size);
		height: var(--button-size);
		/* background-color: var(--accent-primary);
		border: none; */

		background-color: var(--btn-bg);
		border: 3px solid var(--btn-border);
		box-shadow: 0px 6px var(--btn-border);
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition:
			transform 0.2s;
		padding: 0;
		position: relative;
		overflow: hidden;
		transform: translateY(-5px);
	}

	@media (hover: hover) {
		.generate-button:hover .generate-icon {
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

	.generate-button:active {
		background-color: var(--btn-bg-hover);
		border: 3px solid var(--btn-border-hover);
		box-shadow: 0px 2px var(--btn-border-hover);
		transform: translateY(-2px) scaleX(1.02) scaleY(0.98);
		transition: transform 0.05s;
	}

	.generate-icon {
		display: block;
		object-fit: contain;
	}
</style>
