<script lang="ts">
	import { allProgressions } from '$lib/stores';
	import ThemeSelector from '../components/ThemeSelector.svelte';
  import UkuleleSetting from '../components/UkuleleSetting.svelte';
	import SoundToggle from '../components/SoundToggle.svelte';

	const APP_VERSION = '5.0';

	let progCount = $derived($allProgressions.length);
</script>

<div class="settings-container">
	<div class="title-header">
		<h1 class="page-title">Settings</h1>
	</div>

	<div class="setting-item">
		<div class="setting-label">Theme</div>
		<ThemeSelector />
	</div>

	<div class="setting-item">
		<div class="setting-label">Auto-play Audio</div>
		<SoundToggle />
	</div>

	<div class="setting-item">
		<div class="setting-label">Ukulele Hint</div>
		<UkuleleSetting />
	</div>

	<div class="setting-item">
		<div class="setting-label">Version</div>
		<div class="setting-value">{APP_VERSION}</div>
	</div>

	<div class="setting-item">
		<div class="setting-label">Progressions in Database</div>
		<div class="setting-value">{progCount}</div>
	</div>

	<div class="setting-item">
		<div class="setting-label">Made by</div>
		<div class="setting-value">Edgar Remy</div>
	</div>

	<div class="setting-item">
		<div class="setting-label">Repo</div>
		<a href="https://github.com/edgarremy/chord-progression/" target="_blank" rel="noopener noreferrer" class="setting-link">
			edgarremy/chord-progression
		</a>
	</div>
</div>

<style>
	.settings-container {
		flex-direction: column;
		align-items: center;
		justify-content: center;
		justify-content: flex-start;
		padding-left: 1rem;
		padding-right: 1rem;
		margin-top: 0;
		margin-left: auto;
		margin-right: auto;
		width: 100%;
		max-width: 600px;
		margin-bottom: 10rem;
	}

	.page-title {
		font-size: 3rem;
		font-weight: 700;
		margin: 0;
		color: var(--text-primary);
		font-family: "Boleroesque", cursive;
	}

	.title-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 5rem;
		margin-bottom: 4.5rem;
		gap: 1rem;
	}

	.setting-item {
		padding: 1.1rem;
		margin-bottom: 0.75rem;
		background-color: var(--bg-secondary);
		border-radius: 15px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.setting-label {
		font-size: 1rem;
		color: var(--text-primary);
		font-weight: 500;
	}

	.setting-value {
		font-size: 1rem;
		color: var(--text-secondary);
	}

	.setting-link {
		font-size: 1rem;
		color: var(--text-accent-secondary);
		text-decoration: none;
		transition: color 0.2s;
	}

	.setting-link:hover {
		color: var(--text-primary);
		text-decoration: underline;
	}
</style>