<script lang="ts">
  import type { FingerPlacement, Tuning } from "$lib/chords/Strings";
  import { X } from "lucide-svelte";

  interface Props {
    tuning: Tuning;
    fret: number;
    string: number;
    fingerPlacements: FingerPlacement[];
    offset: number;
  }

  let { tuning, fret, string, fingerPlacements, offset }: Props = $props();

  let stringFingerPlacements = $derived(
    fingerPlacements.filter((fp) => fp.string === string),
  );
  let stringFretFingerPlacements = $derived(
    stringFingerPlacements.filter((fp) => fp.fret === fret + offset),
  );

  // Check if this is the first fret
  let isFirstFret = $derived(fret === 1);

  // Check if this string is muted
  let isMuted = $derived(
    stringFingerPlacements.some((fp) => fp.muted) || false,
  );

  // Check if this string is played open (check all placements)
  let isOpen = $derived(
    stringFingerPlacements.every((fp) => fp.fret === 0 && !fp.muted) &&
      !isMuted,
  );
</script>

<div class="container">
  <div class="string">
    {#if isFirstFret}
      <div class="note">
        {#if isMuted}
          <span class="muted">
            <X />
          </span>
        {:else if isOpen}
          <span class="open">
            {tuning.strings[string - 1]}
          </span>
        {:else}
          {tuning.strings[string - 1]}
        {/if}
      </div>
    {/if}
    {#each stringFretFingerPlacements as fp}
      {#if !fp.muted}
        <div class="finger-placement" style="--length: {fp.barre}">
          {fp.finger}
        </div>
      {/if}
    {/each}
  </div>
  {#if string !== tuning.strings.length}
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
    height: calc(var(--ukulele-scale) * 0.5);
    transform: translate(-50%, -50%);
    font-size: calc(var(--ukulele-scale) * 0.35);
    color: var(--string-color);
    font-weight: bold;
  }

  .muted {
    color: var(--fret-color);
  }

  .open {
    color: var(--string-color);
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
