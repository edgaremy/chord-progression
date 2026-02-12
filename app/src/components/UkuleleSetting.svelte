<script lang="ts">
  import { ukuleleSettings, ukuleleTunings } from '$lib/stores';

  let isAnimating = $state(false);

  // Check if current tuning is GCEA (default)
  let isDefaultTuning = $derived(
    $ukuleleSettings.tuning.length === 4 &&
    $ukuleleSettings.tuning[0] === 'G' &&
    $ukuleleSettings.tuning[1] === 'C' &&
    $ukuleleSettings.tuning[2] === 'E' &&
    $ukuleleSettings.tuning[3] === 'A'
  );

  function toggleUkuleleDiagrams() {
    $ukuleleSettings.enabled = !$ukuleleSettings.enabled;
  }

  function rollTuning() {
    const index = ukuleleTunings.findIndex(tuning => {
      return tuning.every((note, string) => note === $ukuleleSettings.tuning[string]);
    });
    const nextIndex = (index + 1) % ukuleleTunings.length;
    $ukuleleSettings.tuning = ukuleleTunings[nextIndex];
  }

  function handleMouseDown() {
    isAnimating = true;
  }

  function handleMouseUp() {
    isAnimating = false;
  }
</script>

<div class="container">
  {#if $ukuleleSettings.enabled}
    <div class="tuning-container">
      {#if isDefaultTuning}
        <span class="default-label">default tuning</span>
      {/if}
      <button
        class="tuning {isAnimating ? 'rolling' : ''}"
        onmousedown={handleMouseDown}
        onmouseup={handleMouseUp}
        onclick={rollTuning}
      >
        <div class="tune">
          {#each $ukuleleSettings.tuning as note}
          <div class="tuning-note">{note}</div>
          {/each}
        </div>
      </button>
    </div>
  {/if}
  <button class="ukulele-toggle {$ukuleleSettings.enabled ? 'enabled' : 'disabled'}" onclick={toggleUkuleleDiagrams}>
    {$ukuleleSettings.enabled ? 'Enabled' : 'Disabled'}
  </button>
</div>

<style>
  .container {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .tuning-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .default-label {
    font-size: 0.875rem;
    color: var(--text-secondary);
    opacity: 0.7;
    font-style: italic;
  }

  .tuning {
    min-width: 6rem;
    background: transparent;
    color: var(--text-secondary);
    border: none;
    border-radius: 9999px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    transition: all 0.3s ease;
    overflow: hidden;
  }

  .tune {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    justify-content: center;
    animation: tuneUp 0.2s ease-out forwards;
  }

  .tuning:hover {
		color: var(--text-primary);
  }

  .tuning:focus-visible {
    outline: 2px solid var(--accent-primary);
    outline-offset: 2px;
  }

  @keyframes tuneDown {
    from {
      transform: translateY(0);
    }
    to {
      transform: translateY(2rem);
    }
  }

  @keyframes tuneUp {
    from {
      transform: translateY(-2rem);
    }
    to {
      transform: translateY(0);
    }
  }

  .tuning.rolling {
    background-color: var(--bg-primary);
  }

  .tuning.rolling .tune {
    animation: tuneDown 0.2s ease-in forwards;
  }

	.ukulele-toggle {
		min-width: 6rem;
		padding: 0.5rem 1rem;
		border-radius: 9999px;
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.3s ease;
		border: none;
		background-color: transparent;
		font-size: 1rem;
		font-weight: 500;
	}

	.ukulele-toggle:hover {
		color: var(--text-primary);
	}

	.ukulele-toggle.enabled {
		background-color: var(--bg-primary);
		color: var(--text-primary);
	}

	.ukulele-toggle:focus-visible {
		outline: 2px solid var(--accent-primary);
		outline-offset: 2px;
	}
</style>
