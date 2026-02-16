<script lang="ts">
  import type { Chord } from "$lib/chords/Chord";
  import { Piano, type PianoKey } from "$lib/chords/Piano";

  interface Props {
    chord: Chord;
    textColor: string;
  }

  let { chord, textColor }: Props = $props();

  let pianoKeys: PianoKey[] = $derived(Piano.generatePianoKeys(chord.getNotes()));
</script>

<div class="piano">
  {#if pianoKeys.length === 0}
    <div class="error">
      Unable to render piano for this chord.
    </div>
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
    --key-width: calc(var(--ukulele-scale) * 0.35);
    --white-key-height: calc(var(--ukulele-scale) * 1.2);
    --black-key-height: calc(var(--ukulele-scale) * 0.75);
    --black-key-width: calc(var(--ukulele-scale) * 0.25);
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
    border: calc(var(--ukulele-scale) * 0.025) solid black;
    border-radius: 0 0 calc(var(--ukulele-scale) * 0.08) calc(var(--ukulele-scale) * 0.08);
    margin-right: calc(var(--ukulele-scale) * -0.025);
  }

  .key.black {
    width: var(--black-key-width);
    height: var(--black-key-height);
    background-color: black;
    border-radius: 0 0 calc(var(--ukulele-scale) * 0.05) calc(var(--ukulele-scale) * 0.05);
    position: absolute;
    left: calc(var(--key-width) - var(--black-key-width) / 2 - var(--ukulele-scale) * 0.025);
    top: 0;
    z-index: 2;
  }

  .highlight {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--played-color);
    opacity: 0.9;
    pointer-events: none;
    border-radius: inherit;
  }

  .key.black .highlight {
    /* Black keys show color overlay with higher opacity */
    opacity: 0.7;
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
