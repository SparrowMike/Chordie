/**
 * An array representing the chromatic scale with sharp notation.
 */

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
