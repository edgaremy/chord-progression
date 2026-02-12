<script lang="ts">
  import type { FingerPlacement } from "$lib/chords/Ukulele";
  import String from "./String.svelte";
  import { ukuleleSettings } from "$lib/stores";

  interface Props {
    fret: number;
    fingerPlacements: FingerPlacement[];
  }

  let { fingerPlacements, fret }: Props = $props();
</script>

<div class="container">
  <div class="fingerboard">
    {#if fret === 1}
      <div class="fret fret-0"></div>
    {/if}
    <div class="strings">
      {#each $ukuleleSettings.tuning as _, string}
        <String
          {fret}
          string={string + 1}
          fingerPlacements={fingerPlacements.filter(
            (fp) => fp.string === string + 1,
          )}
        />
      {/each}
    </div>
    <div class="fret"></div>
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

  .strings {
    height: 100%;
    display: flex;
    height: 1.9rem;
  }

  .fret {
    width: 100%;
    height: var(--fret-height);
    background-color: var(--fret-color);
  }

  .fret-0 {
    height: calc(var(--fret-height) * 2);
  }
</style>
