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
	Fb: 'D#',
	Eb: 'D#',
	Gb: 'F#',
	Cb: 'B',
};
