/**
 * An array representing the chromatic scale with sharp notation.
 */

import { GuitarTunings } from '../types/interfaces';

// const chromaticScale = ['C', ['C#', 'Db'], 'D', ['D#', 'Eb'], 'E', 'F', ['F#', 'Gb'], 'G', ['G#', 'Ab'], 'A', ['A#', 'Bb'], 'B']; //? --- ['B#', 'C'] ?
export const chromaticSharp = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * A mapping of enharmonic equivalents.
 */
export const enharmonicMap: { [key: string]: string } = {
	'E#': 'F',
	'B#': 'C',
	Ab: 'G#',
	Bb: 'A#',
	Db: 'C#',
	Fb: 'E',
	Eb: 'D#',
	Gb: 'F#',
	Cb: 'B',
	'F##': 'G',
	'C##': 'D',
	'G##': 'A',
	'D##': 'E',
	'A##': 'B',
	'E##': 'F#',
	'B##': 'C#',
	Fbb: 'E',
	Cbb: 'B',
	Gbb: 'F#',
	Dbb: 'C#',
	Abb: 'G#',
};

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
};

export const musicalColorsClasses: { [key: string]: string } = {
	C: `bg-C/[.9]`,
	'C#': `bg-C#/[.9]`,
	D: `bg-D/[.9]`,
	'D#': `bg-D#/[.9]`,
	E: `bg-E/[.9]`,
	F: `bg-F/[.9]`,
	'F#': `bg-F#/[.9]`,
	G: `bg-G/[.9]`,
	'G#': `bg-G#/[.9]`,
	A: `bg-A/[.9]`,
	'A#': `bg-A#/[.9]`,
	B: `bg-B/[.9]`,
};
