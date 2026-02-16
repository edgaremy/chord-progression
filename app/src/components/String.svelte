<script lang="ts">
  import type { FingerPlacement } from "$lib/chords/Ukulele";
  import { ukuleleSettings } from "$lib/stores";

  interface Props {
    fret: number;
    string: number;
    fingerPlacements: FingerPlacement[] | null;
  }

  let { fret, string, fingerPlacements }: Props = $props();
  
  // Check if this string is muted
  let isMuted = $derived(
    fingerPlacements?.some(fp => fp.string === string && fp.muted) || false
  );
</script>

<div class="container">
  <div class="string">
    {#if fret === 1}
      <div class="note">
        {#if isMuted}
          <span class="muted">X</span>
        {:else}
          {$ukuleleSettings.tuning[string - 1]}
        {/if}
      </div>
    {/if}
    {#if fingerPlacements}
      {#each fingerPlacements as fp}
        {#if !fp.muted}
          <div class="finger-placement" style="--length: {fp.barre}">
            {fp.finger}
          </div>
        {/if}
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
    top: calc(var(--ukulele-scale) * -0.3);
    left: calc(var(--string-width) / 2);
    transform: translate(-50%, -50%);
    font-size: calc(var(--ukulele-scale) * 0.35);
    color: var(--string-color);
    font-weight: bold;
  }

  .muted {
    color: var(--fret-color);
  }

  .interval {
    width: calc(var(--ukulele-scale) * 0.55);
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
    font-size: calc(var(--ukulele-scale) * 0.3);
    font-weight: bold;
    color: var(--string-text);
  }
</style>
