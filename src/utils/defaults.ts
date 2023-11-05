import { GuitarTunings, Preferences } from '../types/interfaces';

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
	showMoreChordInfo: true,
	showNotes: true,
	showChordTones: false,
	showScales: true,
	activeChord: null,
	activeScale: null,
	highlightNotes: true,
	highlightPosition: false,
	fretboardZoom: true,
	guitarTuning: 'Standard Tuning',
};

/**
 * A mapping of selected chord tones for each string.
 */
export const initialChordie = {
	'6th String': null,
	'5th String': null,
	'4th String': null,
	'3nd String': null,
	'2nd String': null,
	'1st String': null,
};

export const initialGuitarFrets = [
	{ fretNumber: 0, data: '' },
	{ fretNumber: 1, data: '' },
	{ fretNumber: 2, data: '' },
	{ fretNumber: 3, data: '' },
	{ fretNumber: 4, data: '' },
	{ fretNumber: 5, data: '' },
	{ fretNumber: 6, data: '' },
	{ fretNumber: 7, data: '' },
	{ fretNumber: 8, data: '' },
	{ fretNumber: 9, data: '' },
	{ fretNumber: 10, data: '' },
	{ fretNumber: 11, data: '' },
];

export const guitarTunings: GuitarTunings = {
	'Standard Tuning': [
		{ string: '1st String', note: 'e', octave: 4 },
		{ string: '2nd String', note: 'B', octave: 3 },
		{ string: '3rd String', note: 'G', octave: 3 },
		{ string: '4th String', note: 'D', octave: 3 },
		{ string: '5th String', note: 'A', octave: 2 },
		{ string: '6th String', note: 'E', octave: 2 },
	],
	'Drop D Tuning': [
		{ string: '1st String', note: 'e', octave: 4 },
		{ string: '2nd String', note: 'B', octave: 3 },
		{ string: '3rd String', note: 'G', octave: 3 },
		{ string: '4th String', note: 'D', octave: 3 },
		{ string: '5th String', note: 'A', octave: 2 },
		{ string: '6th String', note: 'D', octave: 2 },
	],
	'Half-Step Down Tuning (Eb Standard)': [
		{ string: '1st String', note: 'D#', octave: 4 },
		{ string: '2nd String', note: 'A#', octave: 3 },
		{ string: '3rd String', note: 'F#', octave: 3 },
		{ string: '4th String', note: 'C#', octave: 3 },
		{ string: '5th String', note: 'G#', octave: 2 },
		{ string: '6th String', note: 'D#', octave: 2 },
	],
	'Drop C Tuning': [
		{ string: '1st String', note: 'D', octave: 4 },
		{ string: '2nd String', note: 'A', octave: 3 },
		{ string: '3rd String', note: 'F', octave: 3 },
		{ string: '4th String', note: 'C', octave: 3 },
		{ string: '5th String', note: 'G', octave: 2 },
		{ string: '6th String', note: 'C', octave: 2 },
	],
	'Open G Tuning': [
		{ string: '1st String', note: 'D', octave: 4 },
		{ string: '2nd String', note: 'B', octave: 3 },
		{ string: '3rd String', note: 'G', octave: 3 },
		{ string: '4th String', note: 'D', octave: 3 },
		{ string: '5th String', note: 'G', octave: 2 },
		{ string: '6th String', note: 'D', octave: 2 },
	],
	'Open D Tuning': [
		{ string: '1st String', note: 'D', octave: 4 },
		{ string: '2nd String', note: 'A', octave: 3 },
		{ string: '3rd String', note: 'F#', octave: 3 },
		{ string: '4th String', note: 'D', octave: 3 },
		{ string: '5th String', note: 'A', octave: 2 },
		{ string: '6th String', note: 'D', octave: 2 },
	],
	'Open E Tuning': [
		{ string: '1st String', note: 'e', octave: 4 },
		{ string: '2nd String', note: 'B', octave: 3 },
		{ string: '3rd String', note: 'G#', octave: 3 },
		{ string: '4th String', note: 'E', octave: 3 },
		{ string: '5th String', note: 'B', octave: 2 },
		{ string: '6th String', note: 'E', octave: 2 },
	],
	'Custom Tuning': [
		{ string: '1st String', note: 'B', octave: 3 },
		{ string: '2nd String', note: 'F#', octave: 3 },
		{ string: '3rd String', note: 'D', octave: 3 },
		{ string: '4th String', note: 'A', octave: 2 },
		{ string: '5th String', note: 'E', octave: 2 },
		{ string: '6th String', note: 'B', octave: 1 },
	],
};

const localStorageCustomTuning = localStorage.getItem('chordieCustomTuning');
if (localStorageCustomTuning) guitarTunings['Custom Tuning'] = JSON.parse(localStorageCustomTuning);
