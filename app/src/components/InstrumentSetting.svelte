<script lang="ts">
  import { allInstruments, type Instrument, type InstrumentInstance } from "$lib/chords/Instrument";
  import { isStringedInstrument, isStringedInstrumentInstance, type StringedInstrumentInstance } from "$lib/chords/Strings";
  import { instrumentInstance } from "$lib/stores";
  import TuningSetting from "./strings/TuningSetting.svelte";

  function setInstrument(newInstrument: Instrument | null) {
    if (newInstrument === null) {
      instrumentInstance.set(null);
      return;
    }

    if (isStringedInstrument(newInstrument)) {
      // If it's a stringed instrument, set it with the first tuning by default
      const defaultTuning = newInstrument.tunings[0];
      const newInstance: StringedInstrumentInstance = {
        instrument: newInstrument,
        tuning: defaultTuning,
      };
      instrumentInstance.set(newInstance);
      return;
    }

    // For other instruments, just set the instrument without additional settings.
    const newInstance: InstrumentInstance<Instrument> = {
      instrument: newInstrument,
    };
    instrumentInstance.set(newInstance);
  }
</script>

<div class="container">
  <div class="instrument-buttons">
    {#each allInstruments as instr}
      <button
        class="instrument-btn {$instrumentInstance?.instrument?.name === instr.name ? 'active' : ''}"
        onclick={() => setInstrument(instr)}
      >
        {instr.name}
      </button>
    {/each}
    <button
      class="instrument-btn {$instrumentInstance === null ? 'active' : ''}"
      onclick={() => setInstrument(null)}
    >
      None
    </button>
  </div>

  {#if isStringedInstrumentInstance($instrumentInstance)}
    <TuningSetting instrumentInstance={$instrumentInstance} />
  {/if}
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
    width: 100%;
  }

  .instrument-buttons {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
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
</style>
