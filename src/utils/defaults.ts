import { Preferences } from '../types/interfaces';

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
export const initialPreferences: Preferences = {
	showMoreChordInfo: false,
	showNotes: true,
	showChordTones: false,
	showScales: false,
	activeChord: null,
	activeScale: null,
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
};

/**
 * Initial state of guitar notes with active status.
 */
export const initialGuitarNotes = {
	e: {
		E: { active: false, octave: 1 },
		F: { active: false, octave: 1 },
		'F#': { active: false, octave: 1 },
		G: { active: false, octave: 1 },
		'G#': { active: false, octave: 1 },
		A: { active: false, octave: 1 },
		'A#': { active: false, octave: 1 },
		B: { active: false, octave: 1 },
		C: { active: false, octave: 2 },
		'C#': { active: false, octave: 2 },
		D: { active: false, octave: 2 },
		'D#': { active: false, octave: 2 },
	},
	B: {
		B: { active: false, octave: 1 },
		C: { active: false, octave: 2 },
		'C#': { active: false, octave: 2 },
		D: { active: false, octave: 2 },
		'D#': { active: false, octave: 2 },
		E: { active: false, octave: 2 },
		F: { active: false, octave: 2 },
		'F#': { active: false, octave: 2 },
		G: { active: false, octave: 2 },
		'G#': { active: false, octave: 2 },
		A: { active: false, octave: 2 },
		'A#': { active: false, octave: 2 },
	},
	G: {
		G: { active: false, octave: 2 },
		'G#': { active: false, octave: 2 },
		A: { active: false, octave: 2 },
		'A#': { active: false, octave: 2 },
		B: { active: false, octave: 2 },
		C: { active: false, octave: 3 },
		'C#': { active: false, octave: 3 },
		D: { active: false, octave: 3 },
		'D#': { active: false, octave: 3 },
		E: { active: false, octave: 3 },
		F: { active: false, octave: 3 },
		'F#': { active: false, octave: 3 },
	},
	D: {
		D: { active: false, octave: 3 },
		'D#': { active: false, octave: 3 },
		E: { active: false, octave: 3 },
		F: { active: false, octave: 3 },
		'F#': { active: false, octave: 3 },
		G: { active: false, octave: 3 },
		'G#': { active: false, octave: 3 },
		A: { active: false, octave: 3 },
		'A#': { active: false, octave: 3 },
		B: { active: false, octave: 3 },
		C: { active: false, octave: 4 },
		'C#': { active: false, octave: 4 },
	},
	A: {
		A: { active: false, octave: 3 },
		'A#': { active: false, octave: 3 },
		B: { active: false, octave: 3 },
		C: { active: false, octave: 4 },
		'C#': { active: false, octave: 4 },
		D: { active: false, octave: 4 },
		'D#': { active: false, octave: 4 },
		E: { active: false, octave: 4 },
		F: { active: false, octave: 4 },
		'F#': { active: false, octave: 4 },
		G: { active: false, octave: 4 },
		'G#': { active: false, octave: 4 },
	},
	E: {
		E: { active: false, octave: 4 },
		F: { active: false, octave: 4 },
		'F#': { active: false, octave: 4 },
		G: { active: false, octave: 4 },
		'G#': { active: false, octave: 4 },
		A: { active: false, octave: 4 },
		'A#': { active: false, octave: 4 },
		B: { active: false, octave: 4 },
		C: { active: false, octave: 5 },
		'C#': { active: false, octave: 5 },
		D: { active: false, octave: 5 },
		'D#': { active: false, octave: 5 },
	},
};
