<script lang="ts">
  import type { StringedInstrumentInstance } from "$lib/chords/Strings";
  import { stringedInstruments } from "$lib/chords/Strings";
  import { instrumentInstance as instrumentInstanceStore } from "$lib/stores";

  interface Props {
    instrumentInstance: StringedInstrumentInstance;
  }

  let { instrumentInstance }: Props = $props();

  let isAnimating = $state(false);

  function rollTuning() {
    const instrumentData = stringedInstruments.find(
      (inst) => inst.name === instrumentInstance.instrument.name,
    );
    if (!instrumentData) return;

    const currentIndex = instrumentData.tunings.findIndex(
      (t) => t.name === instrumentInstance.tuning.name,
    );
    const nextIndex = (currentIndex + 1) % instrumentData.tunings.length;
    const nextTuning = instrumentData.tunings[nextIndex];
    const newInstrumentInstance: StringedInstrumentInstance = {
      instrument: instrumentInstance.instrument,
      tuning: nextTuning,
    };
    instrumentInstanceStore.set(newInstrumentInstance);
  }

  function handleMouseDown() {
    isAnimating = true;
  }

  function handleMouseUp() {
    isAnimating = false;
  }
</script>

<div class="tuning-container">
  <button
    class="tuning {isAnimating ? 'rolling' : ''}"
    onmousedown={handleMouseDown}
    onmouseup={handleMouseUp}
    onclick={rollTuning}
  >
    <div class="tune">
      {#each instrumentInstance.tuning.strings as note}
        <div class="tuning-note">{note}</div>
      {/each}
    </div>
  </button>
  <span class="tuning-name">{instrumentInstance.tuning.name}</span>
</div>

<style>
  .tuning-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .tuning-name {
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
