import os
import subprocess
import pretty_midi
from pydub import AudioSegment
from pydub.effects import normalize

def midi_to_note_name(note_number):
    """Convert MIDI note number to note name (e.g., 66 -> F#2)."""
    notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    note_name = notes[note_number % 12]
    octave = note_number // 12 - 1
    return f"{note_name}{octave}"

def export_sf2_notes(
    sf2_path: str,
    output_folder: str,
    format: str = "wav",
    velocity: int = 100,
    max_sec_length: float = 0,
    normalize_audio: bool = True,
):
    """
    Export all notes from an SF2 file as individual audio files.
    Requires:
        fluidsynth (command-line tool): install via your package manager
        pretty_midi and pydub - install via pip: pip install pretty_midi pydub

    Args:
        sf2_path (str): Path to the SF2 file.
        output_folder (str): Folder to save the exported audio files.
        format (str): Output format ("wav" or "mp3").
        velocity (int): MIDI velocity (0-127, 64=default, 100=loud).
        max_sec_length (float): If > 0, trim output to this length (in seconds).
        normalize_audio (bool): If True, normalize audio volume for all notes.
    """
    sf2_path = os.path.abspath(sf2_path)
    output_folder = os.path.abspath(output_folder)

    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    if not os.path.exists(sf2_path):
        raise FileNotFoundError(f"SF2 file not found: {sf2_path}")

    if not 0 <= velocity <= 127:
        raise ValueError("Velocity must be between 0 and 127 (MIDI standard).")

    for note in range(24, 109):  # C1 (24) to C8 (108)
        # Calculate gain scaling: progressively less gain for higher notes
        # Map note range to gain range: low notes get ~1.0, high notes get ~0.3
        note_ratio = (note - 24) / (108 - 24)  # 0.0 to 1.0
        gain_multiplier = 1.0 - (note_ratio * 0.7)  # 1.0 down to 0.3
        
        midi = pretty_midi.PrettyMIDI()
        instrument = pretty_midi.Instrument(program=0)
        midi.instruments.append(instrument)

        note_obj = pretty_midi.Note(
            velocity=velocity,
            pitch=note,
            start=0,
            end=2,
        )
        instrument.notes.append(note_obj)

        midi_path = os.path.join(output_folder, f"note_{note}.mid")
        midi.write(midi_path)

        note_name = midi_to_note_name(note)
        # Replace # with 's' in filename for web compatibility (e.g., C#4 becomes Cs4)
        file_note_name = note_name.replace('#', 's')
        output_path = os.path.join(output_folder, f"{note}_{file_note_name}.wav")

        # Debug print
        print(f"Rendering {note_name} ({note}/108)...")

        try:
            subprocess.run(
                [
                    "fluidsynth",
                    "-ni",
                    "-R", "0",  # Disable reverb for clean samples
                    "-C", "0",  # Disable chorus for clean samples
                    "-g", str(gain_multiplier),  # Variable gain level
                    "-F", output_path,
                    sf2_path,
                    midi_path,
                ],
                check=True,
                stderr=subprocess.PIPE,
                stdout=subprocess.PIPE,
                text=True,
                timeout=10,  # Prevent hanging
            )
        except subprocess.TimeoutExpired:
            print(f"Timeout rendering {note_name}, skipping...")
            if os.path.exists(midi_path):
                os.remove(midi_path)
            continue
        except subprocess.CalledProcessError as e:
            print(f"Error running FluidSynth for {note_name}: {e.stderr}")
            if os.path.exists(midi_path):
                os.remove(midi_path)
            continue

        # Verify the WAV file was created
        if not os.path.exists(output_path):
            print(f"Failed to create {note_name}.wav, skipping...")
            if os.path.exists(midi_path):
                os.remove(midi_path)
            continue

        audio = AudioSegment.from_wav(output_path)

        if max_sec_length > 0:
            audio = audio[: int(max_sec_length * 1000)]

        # Note: Normalizing will equalize all samples to the same peak level,
        # which will undo the gain scaling applied above. If you want to preserve
        # the relative volume differences between notes, set normalize_audio=False.
        if normalize_audio:
            audio = normalize(audio)

        if format.lower() == "ogg":
            ogg_path = os.path.join(output_folder, f"{note}_{file_note_name}.ogg")
            # OGG Vorbis format - widely supported and Web Audio API compatible
            audio.export(ogg_path, format="ogg")
            os.remove(output_path)
        elif format.lower() == "mp3":
            mp3_path = os.path.join(output_folder, f"{note}_{file_note_name}.mp3")
            # Force integer MP3 codec for Web Audio API compatibility (not mp3float)
            audio.export(mp3_path, format="mp3", bitrate="128k", parameters=["-codec:a", "libmp3lame", "-sample_fmt", "s16p"])
            os.remove(output_path)
        else:
            audio.export(output_path, format="wav")

        # Clean up temporary MIDI file
        if os.path.exists(midi_path):
            os.remove(midi_path)

    print(f"Exported notes to {output_folder} as {format} files.")

# Example usage:
export_sf2_notes(
    "prepare_samples/jRhodes3.sf2",
    "app/static/samples/Rhodes",
    format="ogg",
    velocity=80,
    max_sec_length=4.0,
    normalize_audio=False,  # Preserve gain scaling for different note ranges
)
