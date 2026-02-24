<script lang="ts">
  import { instrumentSettings, type InstrumentType } from "$lib/stores";
  import { stringedInstruments } from "$lib/chords/Strings";

  let isAnimating = $state(false);

  let instrumentTunings = $derived(
    $instrumentSettings.type === "ukulele"
      ? ukuleleTunings
      : $instrumentSettings.type === "guitar"
        ? guitarTunings
        : [],
  );

  let isDefaultTuning = $derived(
    $instrumentSettings.tuning === instrumentTunings[0]
  );

  function setInstrument(type: InstrumentType) {
    $instrumentSettings.type = type;
  }

  function setInstrumentUkulele() {
    setInstrument("ukulele");
    $instrumentSettings.tuning = ukuleleTunings[0];
  }

  function setInstrumentGuitar() {
    setInstrument("guitar");
    $instrumentSettings.tuning = guitarTunings[0];
  }

  function setInstrumentNone() {
    setInstrument("none");
  }

  function setInstrumentPiano() {
    setInstrument("piano");
  }

  function rollTuning() {
    const index = instrumentTunings.findIndex(tuning => tuning === $instrumentSettings.tuning);
    const nextIndex = (index + 1) % instrumentTunings.length;
    $instrumentSettings.tuning = instrumentTunings[nextIndex];
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
      class="instrument-btn {$instrumentSettings.type === 'piano'
        ? 'active'
        : ''}"
      onclick={setInstrumentPiano}
    >
      Piano
    </button>
    <button
      class="instrument-btn {$instrumentSettings.type === 'guitar'
        ? 'active'
        : ''}"
      onclick={setInstrumentGuitar}
    >
      Guitar
    </button>
    <button
      class="instrument-btn {$instrumentSettings.type === 'ukulele'
        ? 'active'
        : ''}"
      onclick={setInstrumentUkulele}
    >
      Ukulele
    </button>
    <button
      class="instrument-btn {$instrumentSettings.type === 'none'
        ? 'active'
        : ''}"
      onclick={setInstrumentNone}
    >
      None
    </button>
  </div>

  {#if $instrumentSettings.type === "ukulele" || $instrumentSettings.type === "guitar"}
    <div class="tuning-container">
      <button
        class="tuning {isAnimating ? 'rolling' : ''}"
        onmousedown={handleMouseDown}
        onmouseup={handleMouseUp}
        onclick={rollTuning}
      >
        <div class="tune">
          {#each $instrumentSettings.tuning.strings as note}
            <div class="tuning-note">{note}</div>
          {/each}
        </div>
      </button>
      <span class="tuning-name">{$instrumentSettings.tuning.name}</span>
    </div>
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
