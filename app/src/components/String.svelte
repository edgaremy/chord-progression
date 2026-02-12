<script lang="ts">
  import type { FingerPlacement } from "$lib/chords/Ukulele";
  import { ukuleleSettings } from "$lib/stores";

  interface Props {
    fret: number;
    string: number;
    fingerPlacements: FingerPlacement[] | null;
  }

  let { fret, string, fingerPlacements }: Props = $props();
</script>

<div class="container">
  <div class="string">
    {#if fret === 1}
      <div class="note">
        {$ukuleleSettings.tuning[string - 1]}
      </div>
    {/if}
    {#if fingerPlacements}
      {#each fingerPlacements as fp}
        <div class="finger-placement" style="--length: {fp.barre}">
          {fp.finger}
        </div>
      {/each}
    {/if}
  </div>
  {#if string !== $ukuleleSettings.tuning.length}
    <div class="interval"></div>
  {/if}
</div>

<style>
  .container {
    position: relative;
    display: flex;
    align-items: center;
  }

  .string {
    width: var(--string-width);
    height: 100%;
    background-color: var(--string-color);
  }

  .note {
    position: absolute;
    top: -1rem;
    left: calc(var(--string-width) / 2);
    transform: translate(-50%, -50%);
    font-size: 1rem;
    color: var(--string-color);
    font-weight: bold;
  }

  .interval {
    width: 1.75rem;
  }

  .finger-placement {
    position: absolute;
    top: 50%;
    transform: translate(
      calc((var(--string-width) - var(--finger-size)) / 2),
      -50%
    );
    width: calc(var(--finger-size) + var(--length) * 100%);
    height: var(--finger-size);
    background-color: var(--string-color);
    border-radius: var(--finger-size);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    font-weight: bold;
    color: var(--string-text);
  }
</style>
