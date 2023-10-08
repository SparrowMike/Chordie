import { ChordInfo, Chordie, GuitarNotes } from '../types/interfaces';
import { guitarTunings, enharmonicMap, chromaticSharp } from './constants';
import { get as getChordData, getChord as getChordDataSymbol } from '@tonaljs/chord'; //? ----- tbc { chordScales }
import { detect as detectChord } from '@tonaljs/chord-detect';

/**
 * Creates a deep copy of an object or array using JSON serialization and parsing.
 *
 * @template T
 * @param {T} obj - The object or array to be deep copied.
 * @returns {T} A new object or array that is a deep copy of the input.
 */
export const deepCopy = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

/**
 * Retrieves available chords from a chord dictionary and extracts chord information.
 *
 * @param {Object} chordDictionary - A dictionary containing chord data with keys and values.
 * @returns {Object} An object containing information about the detected chords.
 */
export const extractChordInformation = (chordie: { [key: string]: null | string }) => {
	const nonNullStringChordie: string[] = Object.values(chordie).filter(
		(v): v is string => v !== null
	);

	const toneJsDetectChord = detectChord(nonNullStringChordie);
	const detectedChords = toneJsDetectChord.length
		? toneJsDetectChord
		: detectChord(nonNullStringChordie, { assumePerfectFifth: true });

	// Initialize an object to store detected chord information
	const chordsObj: { [key: string]: ChordInfo } = {};

	// Iterate through detected chords and extract chord information
	for (const idx in detectedChords) {
		const [alias, root, bassNote] = extractChordQuality(detectedChords[idx]);

		let chordInfo = detectedChords[idx].includes('/')
			? getChordDataSymbol(alias, root, bassNote)
			: getChordData(detectedChords[idx]);

		if (chordInfo.empty) {
			//? ------ getChordDataSymbol('madd9', 'F5', 'A#4') ------- some chords just won't work
			chordInfo = getChordDataSymbol(alias, root);
		}

		chordsObj[idx] = {
			chord: detectedChords[idx],
			...chordInfo,
		};
	}

	return chordsObj;
};

/**
 * Initializes a guitar fretboard for a given tuning.
 *
 * @param {string} tuning - The name of the guitar tuning.
 * @returns {Object} An object representing the initialized fretboard.
 */
export const initializeGuitarFretboard = (
	tuning: string,
	chordie?: { [key: string]: string | null }
) => {
	const fretboard: { [key: string]: GuitarNotes } = {};
	const fretboardLength = 12; //? should probably be a global var, similar approach also used in freatbord component

	const notes = chromaticSharp.concat(chromaticSharp);

	guitarTunings[tuning].forEach((value) => {
		const startingNote = notes.indexOf(value.note.toUpperCase());
		const stringNotes = notes.slice(startingNote, startingNote + fretboardLength);
		let octave = value.octave;
		stringNotes.forEach((note, idx) => {
			if (note.toUpperCase() === 'C' && idx >= 1) {
				octave++;
			}
			fretboard[value.string] = {
				...fretboard[value.string],
				[note]: { active: false, octave: octave },
			};
		});
	});

	if (chordie) {
		Object.entries(chordie).forEach(([key, val]) => {
			if (val) {
				console.log(key, val, fretboard[key]);
				Object.entries(fretboard[key]).forEach(([_k, _v]) => {
					if (_k === val) {
						_v.active = true;
					}
				});
			}
		});
	}

	return fretboard;
};

/**
 * Resets the chordTone property for each note in the provided guitar notes object.
 *
 * @param {{ [key: string]: GuitarNotes }} guitarNotes - An object representing guitar notes by string.
 * @returns {{ [key: string]: GuitarNotes }} - Updated guitar notes object with chordTone properties removed.
 */
export const handleChordToneReset = (guitarNotes: { [key: string]: GuitarNotes }) => {
	for (const string of Object.values(guitarNotes)) {
		for (const note of Object.values(string)) {
			delete note.chordTone;
		}
	}

	return guitarNotes;
};

/**
 * Handles updating the guitar notes state based on chord tones.
 *
 * @param {Chordie} chordie - The chord data.
 * @param {{ [key: string]: GuitarNotes }} guitarNotes - An object representing guitar notes by string.
 * @returns {{ [key: string]: GuitarNotes }} - Updated guitar notes state with chord tones adjusted.
 */
export const updateChordTones = (chordie: Chordie, guitarNotes: { [key: string]: GuitarNotes }) => {
	const guitarNotesTemp = handleChordToneReset({ ...guitarNotes });

	for (const string of Object.values(guitarNotesTemp)) {
		for (const note of Object.values(chordie)) {
			if (note && !string[note].active) {
				string[note].chordTone = true;
			}
		}
	}

	return guitarNotesTemp;
};

/**
 * Deletes relativeNote and interval properties from a given GuitarNotes object.
 * @param {Object.<string, GuitarNotes>} guitarNotes - The GuitarNotes object to update.
 * @returns {Object.<string, GuitarNotes>} The updated GuitarNotes object with properties removed.
 */
export const deleteRelativeNoteAndInterval = (guitarNotes: { [key: string]: GuitarNotes }) => {
	const guitarNotesTemp = { ...guitarNotes };

	for (const stringNotes of Object.values(guitarNotesTemp)) {
		for (const note of Object.values(stringNotes)) {
			delete note.relativeNote;
			delete note.interval;
		}
	}

	return guitarNotesTemp;
};

/**
 * Adds relativeNote and interval properties based on detected chords.
 * @param {string[]} notes - An array of detected chords.
 * @param {string[]} intervals - An array of intervals.
 * @param {Object.<string, GuitarNotes>} guitarNotes - The current state of guitarNotesTemp.
 * @returns {Object.<string, GuitarNotes>} The updated guitarNotesTemp with relativeNote properties.
 */
export const extractRelativeNotes = (
	notes: string[],
	intervals: string[],
	guitarNotes: { [key: string]: GuitarNotes }
) => {
	const guitarNotesTemp = { ...guitarNotes };

	// Clear previous relative notes and intervals using the separate function
	deleteRelativeNoteAndInterval(guitarNotesTemp);

	notes.forEach((relNote, idx) => {
		for (const stringNotes of Object.values(guitarNotesTemp)) {
			const interval = intervals[idx];

			if (enharmonicMap[relNote]) {
				const convertedNote = enharmonicMap[relNote];
				stringNotes[convertedNote].relativeNote = relNote;
				stringNotes[convertedNote].interval = interval;
			} else {
				stringNotes[relNote].interval = interval;
			}
		}
	});

	return guitarNotesTemp;
};

/**
 * Checks if a chord with the specified activeChord exists in the chords object.
 *
 * @param {Object.<string, ChordInfo>} chords - The object containing chord information, where keys are chord names.
 * @param {number} activeChord - The index of the active chord to check.
 * @returns {boolean} `true` if the activeChord exists in the chords object; otherwise, `false`.
 */
export const checkChords = (chords: { [key: string]: ChordInfo }, activeChord: number) => {
	if (!Object.keys(chords).length) return false;
	if (!chords[activeChord]) return false;
	return true;
};

/**
 * Extracts chord properties from chord data.
 *
 * @param {string} chordData - The chord data string to extract properties from.
 * @param {number} overChord - The index at which the chord is "over" (splitting point).
 * @param {string[]} chromaticSharp - An array of chromatic sharp notes (e.g., ["C", "C#", "D", ...]).
 *
 * @returns {[string, string, string]} - An array containing three strings:
 *   - The extracted alias (between the root and overChord).
 *   - The extracted root note (determined based on the chromaticSharp notes).
 *   - The extracted bass note (after the splitting point).
 */
export const extractChordQuality = (chordData: string): [string, string, string] => {
	const overChord = chordData.indexOf('/');
	const chord = chordData.slice(0, overChord);
	const bassNote = chordData.slice(overChord + 1);

	let root = '';

	for (const note of chromaticSharp) {
		if (chord.includes(note)) {
			root = note;
		}
	}

	const alias = chordData.slice(root.length, overChord);

	return [alias, root, bassNote];
};
