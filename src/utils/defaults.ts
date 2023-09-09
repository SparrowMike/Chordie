/**
 * Initial preferences for chord visualization.
 *
 * This object holds the initial preferences for displaying chord information in the application.
 * Each property represents a specific preference setting:
 *
 * - `showMoreChordInfo`: Controls whether detailed chord information is initially visible (true) or hidden (false).
 * - `showNotes`: Determines if musical notes are initially displayed on the chord visualization (true) or hidden (false).
 * - `showChordTones`: Specifies whether chord tones are initially highlighted across the fretboard (true) or not (false) on the fretboard.
 * - `activeChord`: Represents the initial index of the selected chord among detected chords.
 */
export const initialChordPreferences = {
  showMoreChordInfo: false,
  showNotes: true,
  showChordTones: false,
  activeChord: 0,
};

/**
 * A mapping of selected chord tones for each string.
 */
export const initialChordie = {
  E: null,
  A: null,
  D: null,
  G: null,
  B: null,
  e: null,
}

/**
 * Initial state of guitar notes with active status.
 */
export const initialGuitarNotes = {
  e: { E: { active: false }, F: { active: false }, 'F#': { active: false }, G: { active: false }, 'G#': { active: false }, A: { active: false }, 'A#': { active: false }, B: { active: false }, C: { active: false }, 'C#': { active: false }, D: { active: false }, 'D#': { active: false } },
  B: { B: { active: false }, C: { active: false }, 'C#': { active: false }, D: { active: false }, 'D#': { active: false }, E: { active: false }, F: { active: false }, 'F#': { active: false }, G: { active: false }, 'G#': { active: false }, A: { active: false }, 'A#': { active: false } },
  G: { G: { active: false }, 'G#': { active: false }, A: { active: false }, 'A#': { active: false }, B: { active: false }, C: { active: false }, 'C#': { active: false }, D: { active: false }, 'D#': { active: false }, E: { active: false }, F: { active: false }, 'F#': { active: false } },
  D: { D: { active: false }, 'D#': { active: false }, E: { active: false }, F: { active: false }, 'F#': { active: false }, G: { active: false }, 'G#': { active: false }, A: { active: false }, 'A#': { active: false }, B: { active: false }, C: { active: false }, 'C#': { active: false } },
  A: { A: { active: false }, 'A#': { active: false }, B: { active: false }, C: { active: false }, 'C#': { active: false }, D: { active: false }, 'D#': { active: false }, E: { active: false }, F: { active: false }, 'F#': { active: false }, G: { active: false }, 'G#': { active: false } },
  E: { E: { active: false }, F: { active: false }, 'F#': { active: false }, G: { active: false }, 'G#': { active: false }, A: { active: false }, 'A#': { active: false }, B: { active: false }, C: { active: false }, 'C#': { active: false }, D: { active: false }, 'D#': { active: false } },
};