<script lang="ts">
  import type { Chord } from "$lib/chords/Chord";
  import { Piano, type PianoKey } from "$lib/chords/Piano";

  interface Props {
    chord: Chord;
    textColor: string;
  }

  let { chord, textColor }: Props = $props();

  let pianoKeys: PianoKey[] = $derived(
    Piano.generatePianoKeys(chord.getNotes()),
  );
</script>

<div class="piano">
  {#if pianoKeys.length === 0}
    <div class="error">Unable to render piano for this chord.</div>
  {:else}
    <div class="keys">
      {#each pianoKeys as key}
        {#if !key.isBlack}
          <div class="key-container">
            <div
              class="key white"
              class:played={key.isPlayed}
              style="--played-color: {textColor}"
            >
              {#if key.isPlayed}
                <div class="highlight"></div>
              {/if}
            </div>
            {#if key.blackKeyAfter}
              <div
                class="key black"
                class:played={key.blackKeyAfter.isPlayed}
                style="--played-color: {textColor}"
              >
                {#if key.blackKeyAfter.isPlayed}
                  <div class="highlight"></div>
                {/if}
              </div>
            {/if}
          </div>
        {/if}
      {/each}
    </div>
  {/if}
</div>

<style>
  .piano {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    --key-width: calc(var(--ukulele-scale) * 0.32);
    --white-key-height: calc(var(--ukulele-scale) * 1.02);
    --black-key-height: calc(var(--ukulele-scale) * 0.6);
    --black-key-width: calc(var(--ukulele-scale) * 0.24);
  }

  .keys {
    display: flex;
    position: relative;
    height: var(--white-key-height);
  }

  .key-container {
    position: relative;
    display: flex;
  }

  .key {
    position: relative;
  }

  .key.white {
    width: var(--key-width);
    height: var(--white-key-height);
    background-color: white;
    border: calc(var(--ukulele-scale) * 0.03) solid
      color-mix(in srgb, var(--played-color), black 40%);
    border-radius: 0 0 calc(var(--ukulele-scale) * 0.1)
      calc(var(--ukulele-scale) * 0.1);
    border-bottom: calc(var(--ukulele-scale) * 0.05) solid
      color-mix(in srgb, var(--played-color), black 30%);
    margin-right: calc(var(--ukulele-scale) * -0.025);
  }

  :global([data-theme="dark"]) .key.white {
    background-color: rgba(255, 255, 255, 0.9);
    border: calc(var(--ukulele-scale) * 0.03) solid
      color-mix(in srgb, var(--played-color), black 90%);
    border-bottom: calc(var(--ukulele-scale) * 0.05) solid
      color-mix(in srgb, var(--played-color), black 80%);
  }

  .key.black {
    width: var(--black-key-width);
    height: var(--black-key-height);
    background-color: color-mix(in srgb, var(--played-color), black 65%);
    border-radius: 0 0 calc(var(--ukulele-scale) * 0.08)
      calc(var(--ukulele-scale) * 0.08);
    position: absolute;
    left: calc(
      var(--key-width) - var(--black-key-width) / 2 - var(--ukulele-scale) *
        0.025
    );
    top: 0;
    z-index: 2;
  }

  :global([data-theme="dark"]) .key.black {
    background-color: color-mix(in srgb, var(--played-color), black 85%);
  }

  .highlight {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: color-mix(in srgb, var(--played-color), white 15%);
    opacity: 0.55;
    pointer-events: none;
    border-radius: 0 0 calc(var(--ukulele-scale) * 0.07)
      calc(var(--ukulele-scale) * 0.075);
  }

  .key.black .highlight {
    opacity: 1;
  }

  :global([data-theme="dark"]) .highlight {
    background-color: color-mix(in srgb, var(--played-color), black 15%);
    opacity: 0.9;
  }
  :global([data-theme="dark"]) .key.black .highlight {
    opacity: 0.75;
  }

  .error {
    padding: calc(var(--ukulele-scale) * 0.3);
    text-align: center;
    font-size: calc(var(--ukulele-scale) * 0.25);
    background-color: var(--string-color);
    color: var(--string-text);
    border-radius: calc(var(--ukulele-scale) * 0.15);
    border: calc(var(--ukulele-scale) * 0.08) solid var(--fret-color);
  }
</style>
