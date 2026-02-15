<script lang="ts">
	import { Undo } from 'lucide-svelte';
	export let onClick: () => void;
	export let visible: boolean = true;
</script>

<button 
	class="rollback-button" 
	onclick={onClick}
	style="visibility: {visible ? 'visible' : 'hidden'};">
	<Undo class="rollback-icon" size={18} />
	<span class="rollback-text">Rollback</span>
</button>

<style>
	.rollback-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
		padding: 0.2rem 0.7rem;
		background-color: var(--bg-tertiary);
		border: none;
		border-radius: 8px;
		cursor: pointer;
		transition: transform 0.2s, opacity 0.3s;
		color: var(--text-primary);
		font-size: 1rem;
		animation: fadeIn 0.3s ease-out;
	}

	.rollback-button:hover {
		transform: translateY(-1px);
		background-color: var(--bg-secondary);
	}

	.rollback-button:active {
		transform: translateY(0);
	}

	.rollback-text {
		font-weight: 500;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
