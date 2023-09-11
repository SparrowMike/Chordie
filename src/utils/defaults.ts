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
  showScales: false,
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
  e: {
    E: { active: false, octave: 'E1' },
    F: { active: false, octave: 'F1' },
    'F#': { active: false, octave: 'F#1' },
    G: { active: false, octave: 'G1' },
    'G#': { active: false, octave: 'G#1' },
    A: { active: false, octave: 'A1' },
    'A#': { active: false, octave: 'A#1' },
    B: { active: false, octave: 'B1' },
    C: { active: false, octave: 'C2' },
    'C#': { active: false, octave: 'C#2' },
    D: { active: false, octave: 'D2' },
    'D#': { active: false, octave: 'D#2' },
  },
  B: {
    B: { active: false, octave: 'B1' },
    C: { active: false, octave: 'C2' },
    'C#': { active: false, octave: 'C#2' },
    D: { active: false, octave: 'D2' },
    'D#': { active: false, octave: 'D#2' },
    E: { active: false, octave: 'E2' },
    F: { active: false, octave: 'F2' },
    'F#': { active: false, octave: 'F#2' },
    G: { active: false, octave: 'G2' },
    'G#': { active: false, octave: 'G#2' },
    A: { active: false, octave: 'A2' },
    'A#': { active: false, octave: 'A#2' },
  },
  G: {
    G: { active: false, octave: 'G2' },
    'G#': { active: false, octave: 'G#2' },
    A: { active: false, octave: 'A2' },
    'A#': { active: false, octave: 'A#2' },
    B: { active: false, octave: 'B2' },
    C: { active: false, octave: 'C3' },
    'C#': { active: false, octave: 'C#3' },
    D: { active: false, octave: 'D3' },
    'D#': { active: false, octave: 'D#3' },
    E: { active: false, octave: 'E3' },
    F: { active: false, octave: 'F3' },
    'F#': { active: false, octave: 'F#3' },
  },
  D: {
    D: { active: false, octave: 'D3' },
    'D#': { active: false, octave: 'D#3' },
    E: { active: false, octave: 'E3' },
    F: { active: false, octave: 'F3' },
    'F#': { active: false, octave: 'F#3' },
    G: { active: false, octave: 'G3' },
    'G#': { active: false, octave: 'G#3' },
    A: { active: false, octave: 'A3' },
    'A#': { active: false, octave: 'A#3' },
    B: { active: false, octave: 'B3' },
    C: { active: false, octave: 'C4' },
    'C#': { active: false, octave: 'C#4' },
  },
  A: {
    A: { active: false, octave: 'A3' },
    'A#': { active: false, octave: 'A#3' },
    B: { active: false, octave: 'B3' },
    C: { active: false, octave: 'C4' },
    'C#': { active: false, octave: 'C#4' },
    D: { active: false, octave: 'D4' },
    'D#': { active: false, octave: 'D#4' },
    E: { active: false, octave: 'E4' },
    F: { active: false, octave: 'F4' },
    'F#': { active: false, octave: 'F#4' },
    G: { active: false, octave: 'G4' },
    'G#': { active: false, octave: 'G#4' },
  },
  E: {
    E: { active: false, octave: 'E4' },
    F: { active: false, octave: 'F4' },
    'F#': { active: false, octave: 'F#4' },
    G: { active: false, octave: 'G4' },
    'G#': { active: false, octave: 'G#4' },
    A: { active: false, octave: 'A4' },
    'A#': { active: false, octave: 'A#4' },
    B: { active: false, octave: 'B4' },
    C: { active: false, octave: 'C5' },
    'C#': { active: false, octave: 'C#5' },
    D: { active: false, octave: 'D5' },
    'D#': { active: false, octave: 'D#5' },
  },
};
