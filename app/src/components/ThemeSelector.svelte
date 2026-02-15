<script lang="ts">
	import { Sun, Moon, MonitorSmartphone } from 'lucide-svelte';
	import { theme } from '$lib/stores';

	let currentTheme = $state($theme);

	$effect(() => {
		currentTheme = $theme;
	});

	function selectTheme(newTheme: 'light' | 'dark' | 'system') {
		theme.set(newTheme);
	}
</script>

<div class="theme-selector">
	<button
		class="theme-option"
		class:selected={currentTheme === 'light'}
		onclick={() => selectTheme('light')}
		aria-label="Light theme"
	>
		<Sun size={20} />
	</button>
	<button
		class="theme-option"
		class:selected={currentTheme === 'system'}
		onclick={() => selectTheme('system')}
		aria-label="System theme"
	>
		<MonitorSmartphone size={20} />
	</button>
	<button
		class="theme-option"
		class:selected={currentTheme === 'dark'}
		onclick={() => selectTheme('dark')}
		aria-label="Dark theme"
	>
		<Moon size={20} />
	</button>
</div>

<style>
	.theme-selector {
		display: flex;
		align-items: center;
		background-color: var(--bg-tertiary);
		border-radius: 50%;
		padding: 0.25rem;
		/* gap: 0.25rem; */
	}

	.theme-option {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 9999px;
		border: none;
		background-color: transparent;
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.3s ease;
		z-index: 1;
	}

	.theme-option:hover {
		color: var(--text-primary);
	}

	.theme-option.selected {
		background-color: var(--bg-primary);
		color: var(--text-primary);
	}

	.theme-option:focus {
		outline: none;
	}

	.theme-option:focus-visible {
		outline: 2px solid var(--accent-primary);
		outline-offset: 2px;
	}
</style>
