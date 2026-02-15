<script lang="ts">
  import { instrumentSettings, ukuleleTunings, type InstrumentType } from '$lib/stores';

  let isAnimating = $state(false);

  // Check if current tuning is GCEA (default)
  let isDefaultTuning = $derived(
    $instrumentSettings.ukuleleTuning.length === 4 &&
    $instrumentSettings.ukuleleTuning[0] === 'G' &&
    $instrumentSettings.ukuleleTuning[1] === 'C' &&
    $instrumentSettings.ukuleleTuning[2] === 'E' &&
    $instrumentSettings.ukuleleTuning[3] === 'A'
  );

  function setInstrument(type: InstrumentType) {
    $instrumentSettings.type = type;
  }

  function rollTuning() {
    const index = ukuleleTunings.findIndex(tuning => {
      return tuning.every((note, string) => note === $instrumentSettings.ukuleleTuning[string]);
    });
    const nextIndex = (index + 1) % ukuleleTunings.length;
    $instrumentSettings.ukuleleTuning = ukuleleTunings[nextIndex];
  }

  function handleMouseDown() {
    isAnimating = true;
  }

  function handleMouseUp() {
    isAnimating = false;
  }
</script>

<div class="container">
  <div class="instrument-buttons">
    <button 
      class="instrument-btn {$instrumentSettings.type === 'piano' ? 'active' : ''}" 
      onclick={() => setInstrument('piano')}
    >
      Piano
    </button>
    <button 
      class="instrument-btn {$instrumentSettings.type === 'guitar' ? 'active' : ''}" 
      onclick={() => setInstrument('guitar')}
    >
      Guitar
    </button>
    <button 
      class="instrument-btn {$instrumentSettings.type === 'ukulele' ? 'active' : ''}" 
      onclick={() => setInstrument('ukulele')}
    >
      Ukulele
    </button>
    <button 
      class="instrument-btn {$instrumentSettings.type === 'none' ? 'active' : ''}" 
      onclick={() => setInstrument('none')}
    >
      None
    </button>
  </div>

  {#if $instrumentSettings.type === 'ukulele'}
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
          {#each $instrumentSettings.ukuleleTuning as note}
          <div class="tuning-note">{note}</div>
          {/each}
        </div>
      </button>
    </div>
  {/if}
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.75rem;
  }

  .instrument-buttons {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .instrument-btn {
    padding: 0.5rem 1rem;
    border-radius: 9999px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    background-color: transparent;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .instrument-btn:hover {
    color: var(--text-primary);
  }

  .instrument-btn.active {
    background-color: var(--bg-primary);
    color: var(--text-primary);
  }

  .instrument-btn:focus-visible {
    outline: 2px solid var(--accent-primary);
    outline-offset: 2px;
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
</style>
