import { Chordie, GuitarNotes } from "../types/interfaces";
import { enharmonicMap, chromaticSharp } from "./constants";

/**
 * Creates a deep copy of an object or array using JSON serialization and parsing.
 *
 * @template T
 * @param {T} obj - The object or array to be deep copied.
 * @returns {T} A new object or array that is a deep copy of the input.
 */
export const deepCopy = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

/**
 * Handles updating the notes state based on chord tones.
 * @param {boolean} show - Whether to show chord tones.
 */
export const updateChordTones = (chordie: Chordie, guitarNotes: { [key: string]: GuitarNotes }, show?: boolean) => {
  const guitarNotesTemp = deepCopy(guitarNotes);

  for (const string of Object.values(guitarNotesTemp)) {
    for (const note of Object.values(string)) {
      delete note.chordTone;
    }

    if (show) {
      for (const note of Object.values(chordie)) {
        if (note && !string[note].active) {
          string[note].chordTone = true;
        }
      }
    }
  }

  return guitarNotesTemp;
}

/**
 * Extracts and updates relativeNote properties for guitarNotesTemp.
 * @param { [key: string]: ChordInfo } detectedChords - An array of detected chords.
 * @param { [key: string]: GuitarNotes } guitarNotesTemp - The current state of guitarNotesTemp.
 * @returns { [key: string]: GuitarNotes } The updated guitarNotesTemp with relativeNote properties.
 */
export const extractRelativeNotes = (notes: string[], intervals: string[], guitarNotes: { [key: string]: GuitarNotes }) => {
  const guitarNotesTemp = deepCopy(guitarNotes);

  // Convert a note to its equivalent with a different accidental (e.g., C## to D)
  const convertDouble = (note: string, type: string) => {
    const target = note.replace(type, '');
    return chromaticSharp[(chromaticSharp.indexOf(target) + 2) % chromaticSharp.length];
  }

  for (const stringNotes of Object.values(guitarNotesTemp)) {
    // Clear previous relative notes and intervals
    for (const note of Object.values(stringNotes)) {
      delete note.relativeNote;
      delete note.interval;
    }

    notes.forEach((relNote, idx) => {
      // Add relativeNote properties based on detected chord's notes
      const interval = intervals[idx];

      if (enharmonicMap[relNote]) {
        const convertedNote = enharmonicMap[relNote];
        stringNotes[convertedNote].relativeNote = relNote;
        stringNotes[convertedNote].interval = interval;
      } else if (relNote.includes('##')) {
        const convertedNote = convertDouble(relNote, '##');
        stringNotes[convertedNote].relativeNote = relNote;
        stringNotes[convertedNote].interval = interval;
      } else if (relNote.includes('bb')) {
        const convertedNote = convertDouble(relNote, 'bb'); //? ------- confirm compatibility
        stringNotes[convertedNote].relativeNote = relNote;
        stringNotes[convertedNote].interval = interval;
      } else {
        stringNotes[relNote].interval = interval;
      }
    });
  }

  return guitarNotesTemp;
};