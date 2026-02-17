<script lang="ts">
  import { Chord } from "$lib/chords/Chord";
  import { chordToFingerPlacements } from "$lib/chords/Ukulele";
  import { ukuleleSettings } from "$lib/stores";
  import Fingerboard from "./Fingerboard.svelte";

  interface Props {
    chord: Chord;
  }

  let { chord }: Props = $props();

  let fingerPlacements = $derived(chordToFingerPlacements(chord, $ukuleleSettings.tuning));
</script>

<div class="neck">
  {#each Array(5) as _, fret}
    <Fingerboard
      fret={fret + 1}
      fingerPlacements={fingerPlacements
        ? fingerPlacements.filter((fp) => fp.fret === fret + 1)
        : []}
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
