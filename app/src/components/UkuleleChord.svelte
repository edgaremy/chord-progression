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
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .error {
    white-space: nowrap;
    padding: 100%;
    position: absolute;
    text-align: center;
    font-size: 0.9rem;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: radial-gradient(
      circle at center,
      #0005 0%,
      #0005 20%,
      transparent 30%
    );
  }
</style>
