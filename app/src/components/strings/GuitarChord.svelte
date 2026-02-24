<script lang="ts">
  import type { Chord } from "$lib/chords/Chord";
  import { Guitar, type GuitarFingerPlacement } from "$lib/chords/Guitar";
  import GuitarFingerboard from "./GuitarFingerboard.svelte";

  interface Props {
    chord: Chord;
  }

  let { chord }: Props = $props();

  let fingerPlacements = $derived(Guitar.chordToFingerPlacements(chord));
  
  // Get the minimum non-zero fret to determine where to start the display
  let minFret = $derived(
    fingerPlacements && fingerPlacements.length > 0
      ? Math.min(...fingerPlacements.filter(fp => fp.fret > 0 && !fp.muted).map(fp => fp.fret))
      : 1
  );
  
  // Determine the starting fret for display
  // If all fingers are in the first 5 frets (or open), start from 1
  // Otherwise, start from minFret to show the chord position
  let startFret = $derived(minFret > 5 ? minFret : 1);
  
  // Only show fret number if not starting from fret 1
  let showFretNumber = $derived(startFret > 1);
</script>

<div class="neck">
  {#if showFretNumber}
    <div class="fret-number">{startFret}</div>
  {/if}
  {#each Array(5) as _, fret}
    <GuitarFingerboard
      fret={startFret + fret}
      allFingerPlacements={fingerPlacements || []}
      isFirstFret={fret === 0}
    />
  {/each}
  {#if fingerPlacements === null}
    <div class="error">
      No voicings found for this chord.<br />
      You should set chord type to<br />
      "seventh & variations" or lower.
    </div>
  {/if}
</div>

<style>
  .neck {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    --string-width: calc(var(--ukulele-scale) * 0.08);
    --fret-height: calc(var(--ukulele-scale) * 0.08);
    --finger-size: calc(var(--ukulele-scale) * 0.5);
  }

  .fret-number {
    position: absolute;
    left: calc(var(--ukulele-scale) * -0.6);
    top: calc(var(--ukulele-scale) * 0.6);
    font-size: calc(var(--ukulele-scale) * 0.35);
    color: var(--string-color);
    font-weight: bold;
    z-index: 5;
  }

  .error {
    white-space: nowrap;
    padding: calc(var(--ukulele-scale) * 0.3);
    position: absolute;
    text-align: center;
    font-size: calc(var(--ukulele-scale) * 0.25);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--string-color);
    color: var(--string-text);
    border-radius: calc(var(--ukulele-scale) * 0.15);
    box-shadow: 0px calc(var(--ukulele-scale) * 0.25) 0px var(--fret-color);
    border: calc(var(--ukulele-scale) * 0.08) solid var(--fret-color);
    z-index: 3;
  }
</style>
