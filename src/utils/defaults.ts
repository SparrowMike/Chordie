
/**
 * An array representing the chromatic scale with sharp notation.
 */
// const chromaticScale = ['C', ['C#', 'Db'], 'D', ['D#', 'Eb'], 'E', 'F', ['F#', 'Gb'], 'G', ['G#', 'Ab'], 'A', ['A#', 'Bb'], 'B']; //? --- ['B#', 'C'] ?
export const chromaticSharp = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];


/**
 * A mapping of selected chord tones for each string.
 */
export const chordie: { [key: string]: string | null } = {
  E: null,
  A: null,
  D: null,
  G: null,
  B: null,
  e: null,
}

/**
 * A mapping of enharmonic equivalents.
 */
export const enharmonicMap: { [key: string]: string } = {
  "E#": "F",
  "B#": "C",
  "Ab": "G#",
  "Bb": "A#",
  "Db": "C#",
  "Eb": "D#",
  "Gb": "F#",
}

/**
 * Initial state of guitar notes with active status.
 */
export const initialNotes = {
  e: { E: { active: false }, F: { active: false }, 'F#': { active: false }, G: { active: false }, 'G#': { active: false }, A: { active: false }, 'A#': { active: false }, B: { active: false }, C: { active: false }, 'C#': { active: false }, D: { active: false }, 'D#': { active: false } },
  B: { B: { active: false }, C: { active: false }, 'C#': { active: false }, D: { active: false }, 'D#': { active: false }, E: { active: false }, F: { active: false }, 'F#': { active: false }, G: { active: false }, 'G#': { active: false }, A: { active: false }, 'A#': { active: false } },
  G: { G: { active: false }, 'G#': { active: false }, A: { active: false }, 'A#': { active: false }, B: { active: false }, C: { active: false }, 'C#': { active: false }, D: { active: false }, 'D#': { active: false }, E: { active: false }, F: { active: false }, 'F#': { active: false } },
  D: { D: { active: false }, 'D#': { active: false }, E: { active: false }, F: { active: false }, 'F#': { active: false }, G: { active: false }, 'G#': { active: false }, A: { active: false }, 'A#': { active: false }, B: { active: false }, C: { active: false }, 'C#': { active: false } },
  A: { A: { active: false }, 'A#': { active: false }, B: { active: false }, C: { active: false }, 'C#': { active: false }, D: { active: false }, 'D#': { active: false }, E: { active: false }, F: { active: false }, 'F#': { active: false }, G: { active: false }, 'G#': { active: false } },
  E: { E: { active: false }, F: { active: false }, 'F#': { active: false }, G: { active: false }, 'G#': { active: false }, A: { active: false }, 'A#': { active: false }, B: { active: false }, C: { active: false }, 'C#': { active: false }, D: { active: false }, 'D#': { active: false } },
};