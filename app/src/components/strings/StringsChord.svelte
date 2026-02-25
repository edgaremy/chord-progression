<script lang="ts">
  import { Chord } from "$lib/chords/Chord";
  import { chordToFingerPlacements } from "$lib/chords/Strings";
  import type { StringedInstrumentInstance } from "$lib/chords/Strings";
  import Fingerboard from "$components/strings/Fingerboard.svelte";

  interface Props {
    instrument: StringedInstrumentInstance;
    chord: Chord;
  }

  let { instrument, chord }: Props = $props();

  let tuning = $derived(instrument.tuning);

  let fingerPlacements = $derived(
    chordToFingerPlacements(chord, tuning),
  );
</script>

<div class="neck">
  {#if fingerPlacements === null}
    <div class="error">
      No voicings found for this chord.<br />
      You should set chord type to<br />
      "seventh & variations" or lower.
    </div>
  {:else}
    {#each Array(5) as _, fret}
      <Fingerboard tuning={tuning} fret={fret + 1} fingerPlacements={fingerPlacements || []} />
    {/each}
  {/if}
</div>

<style>
  .neck {
    padding-top: calc(var(--ukulele-scale) * 0.25);
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    --string-width: calc(var(--ukulele-scale) * 0.08);
    --fret-height: calc(var(--ukulele-scale) * 0.08);
    --finger-size: calc(var(--ukulele-scale) * 0.5);
  }

  .error {
    white-space: nowrap;
    padding: calc(var(--ukulele-scale) * 0.2);
    text-align: center;
    font-size: calc(var(--ukulele-scale) * 0.25);
    background-color: var(--string-color);
    color: var(--string-text);
    border-radius: calc(var(--ukulele-scale) * 0.15);
    box-shadow: 0px calc(var(--ukulele-scale) * 0.15) 0px var(--fret-color);
    border: calc(var(--ukulele-scale) * 0.08) solid var(--fret-color);
    z-index: 3;
  }
</style>
