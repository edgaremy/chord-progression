<script lang="ts">
  import type { FingerPlacement } from "$lib/chords/Strings";
  import { instrumentSettings } from "$lib/stores";
  import String from "$components/strings/String.svelte";

  interface Props {
    fret: number;
    fingerPlacements: FingerPlacement[];
  }

  let { fingerPlacements, fret }: Props = $props();

  let isFirstFret = $derived(fret === 1);
</script>

<div class="container">
  <div class="fingerboard">
    {#if isFirstFret}
      <div class="fret fret-0"></div>
    {/if}
    <div class="fret-and-strings">
      <div class="strings">
        {#each $instrumentSettings.tuning.strings as _, string}
          <String {fret} string={string + 1} {fingerPlacements} />
        {/each}
      </div>
      <div class="fret"></div>
    </div>
  </div>
</div>

<style>
  .container {
    position: relative;
  }

  .fingerboard {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .fret-and-strings {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .strings {
    height: 100%;
    display: flex;
    height: calc(var(--ukulele-scale) * 0.6);
    position: relative;
    z-index: 1;
  }

  .fret {
    width: 100%;
    height: var(--fret-height);
    background-color: var(--fret-color);
    position: absolute;
    bottom: 0;
    z-index: 0;
  }

  .fret-0 {
    height: calc(var(--fret-height) * 2);
    position: absolute;
    bottom: calc(var(--ukulele-scale) * 0.6);
    width: 100%;
    background-color: var(--fret-color);
    z-index: 2; /* Top fret is above strings */
  }
</style>
