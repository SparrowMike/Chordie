import { atom } from 'jotai';

import { initialChordie, initialPreferences, initialGuitarFrets } from '../utils/defaults';

import {
	deepCopy,
	extractRelativeNotes,
	checkChordsExists,
	handleChordToneReset,
	updateChordTones,
	deleteRelativeNoteAndInterval,
	initializeGuitarFretboard,
	extractChordInformation,
} from '../utils/utils';

import { get as getScale } from '@tonaljs/scale'; // Or detect as detectScale
import { chordScales } from '@tonaljs/chord';

import {
	Chordie,
	ChordInfo,
	GuitarNotes,
	Preferences,
	PreferencesAction,
} from '../types/interfaces';

import { enharmonicMap, guitarTunings } from '../utils/constants';
import { chromaticSharp } from '../utils/constants';

const localStoragePreference = localStorage.getItem('chordiePreferences');

export const chordieAtom = atom<Chordie>(deepCopy(initialChordie));
export const fretsAtom = atom(deepCopy(initialGuitarFrets));
export const chordsAtom = atom<{ [key: string]: ChordInfo }>({});

//!-------------- consider converting guitar notes to array to make the fretboard go pass 12
export const guitarNotesAtom = atom<{ [key: string]: GuitarNotes }>(
	initializeGuitarFretboard(
		localStoragePreference ? JSON.parse(localStoragePreference).guitarTuning : 'Standard Tuning'
	)
);
export const preferencesAtom = atom(
	localStoragePreference ? JSON.parse(localStoragePreference) : initialPreferences
);
export const scalesAtom = atom<string[] | undefined>([]);

/**
 * Atom that initializes the state with an initial Chordie object.
 *
 * This atom sets the initial state of the Chordie object, which represents the active notes on a guitar fretboard.
 * It sets the active notes on the guitar fretboard based on the provided Chordie object.
 *
 * @param {Chordie} chordie - The Chordie object representing active notes on the guitar fretboard.
 */
export const initialChordieAtom = atom(null, (get, set, chordie: Chordie) => {
	const guitarNotes = get(guitarNotesAtom);

	Object.entries(chordie).forEach(([key, val]) => {
		if (val) guitarNotes[key][val].active = true;
	});

	set(chordieAtom, chordie);
	set(guitarNotesAtom, guitarNotes);
	set(updateChordsAndScales);
});

/**
 * Atom that handles a full reset of various state atoms.
 * @type {() => void}
 */
export const handleFullResetAtom = atom(null, (get, set) => {
	const preference = get(preferencesAtom);

	set(chordieAtom, deepCopy(initialChordie));
	set(chordsAtom, {});
	set(guitarNotesAtom, initializeGuitarFretboard(preference.guitarTuning));
	set(fretsAtom, deepCopy(initialGuitarFrets));
	set(scalesAtom, []);
	localStorage.setItem('chordie', JSON.stringify(deepCopy(initialChordie)));
});

/**
 * Atom that deals with highlighting positions on the fretboard.
 *!----------------------------- experimental construction site
 */
export const updateFretsHighlighAtom = atom(null, (get, set) => {
	const chords = get(chordsAtom);
	const frets = get(fretsAtom);
	const guitarNotes = get(guitarNotesAtom);

	frets.forEach((val) => {
		val.data = '';
	});

	if (!Object.keys(chords).length) return;

	Object.entries(guitarNotes).forEach(([key, val]) => {
		Object.entries(val).forEach(([, _v], _i) => {
			if (_v.interval) {
				if (['1P', '8P'].includes(_v.interval)) {
					// console.log(_v.interval, _k, 'fret---', _i, 'string---', i, key);
					frets[_i].data = 'S' + key.split(' ')[0][0];
				}
			}
		});
	});

	let lastVal: string;
	for (let i = 0; i < 2; i++) {
		frets.forEach((val) => {
			if (val.data) lastVal = val.data;
			if (lastVal && !val.data) val.data = lastVal + 'oga';
		});
	}

	// console.log(frets, guitarNotes)

	set(fretsAtom, frets);
});

/**
 * Atom for updating the `chords` and `guitarNotes` state based on the current `chordie`.
 *
 * @param {function} updateFunction - The function to update the `chords` and `guitarNotes` state.
 */
export const updateChordsAndScales = atom(null, (get, set) => {
	const chordie = get({ ...chordieAtom });
	const preferences = get(preferencesAtom);

	let guitarNotes = get(guitarNotesAtom);
	let { activeChord } = preferences;

	if (activeChord && activeChord === null) return;

	const chordsObj = extractChordInformation(chordie);

	const chordsLenght = Object.keys(chordsObj).length;
	if (chordsLenght >= 1 || (activeChord ?? -1) >= chordsLenght) {
		activeChord = 0;
		set(updatePreferencesAtom, { type: 'SET_ACTIVE_CHORD', chordIndex: 0 });
	}

	if (activeChord !== null) {
		if (checkChordsExists(chordsObj, activeChord)) {
			const { notes, intervals } = chordsObj[activeChord];
			guitarNotes = extractRelativeNotes(notes, intervals, guitarNotes);
		} else {
			guitarNotes = deleteRelativeNoteAndInterval(guitarNotes);
		}

		set(updateScalesAtom, activeChord, chordsObj);
	}

	set(
		guitarNotesAtom,
		preferences.showChordTones ? updateChordTones(chordie, guitarNotes) : guitarNotes
	);

	set(chordsAtom, chordsObj);

	if (preferences.highlightPosition) {
		set(updateFretsHighlighAtom);
	}
});

/**
 * Atom for updating the chordie and guitarNotes state.
 *
 * @param {null} null - The initial value (null in this case, as it's not used).
 * @param {function} updateFunction - The function to update the chordie state and guitarNotes.
 * @param {string} string - The string to update.
 * @param {string} target - The target to update.
 */
export const updateChordieAtom = atom(null, (get, set, string: string, target: string) => {
	const guitarNotes = get(guitarNotesAtom);
	const chordie = deepCopy(get(chordieAtom));

	const currentTargetActiveState = guitarNotes[string][target].active;

	for (const note in guitarNotes[string]) {
		guitarNotes[string][note].active = false;
	}

	guitarNotes[string][target].active = !currentTargetActiveState;

	chordie[string] = !currentTargetActiveState ? target : null;

	set(chordieAtom, chordie);
	set(guitarNotesAtom, guitarNotes);

	set(updateChordsAndScales);
	localStorage.setItem('chordie', JSON.stringify(chordie));
});

/**
 * Atom that updates the guitar notes with a selected scale.
 *
 * @type {(scale: string) => void}
 * @param {string} scale - The selected scale.
 */
export const updateGuitarNotesWithScaleAtom = atom(null, (get, set, scale?: string) => {
	const guitarNotes = get(guitarNotesAtom);
	const chords = get(chordsAtom);
	const preferences = get(preferencesAtom);

	const { activeChord } = preferences;
	if (activeChord === null) return;

	const targetChord = chords[activeChord];
	if (targetChord === null) return;

	//? -------------- some slash chords come with no chord informations
	//? -------------- extracting tonic is required to get the scales
	let target = targetChord.tonic;
	if (!target) {
		for (const note of chromaticSharp) {
			if (targetChord.chord.split('/')[0].includes(note)) {
				target = note;
			}
		}
	}

	const scaleData = getScale(`${target} ${scale}`);
	let guitarNotesTemp = handleChordToneReset(deepCopy(guitarNotes));

	if (scale) {
		for (const string of Object.values(guitarNotesTemp)) {
			for (const idx in scaleData.notes) {
				const note = scaleData.notes[idx];
				if (string[note]) {
					string[note].chordTone = true;
				} else {
					string[enharmonicMap[note]].chordTone = true;
				}
			}
		}

		guitarNotesTemp = extractRelativeNotes(scaleData.notes, scaleData.intervals, guitarNotesTemp);
	}

	set(guitarNotesAtom, guitarNotesTemp);
});

/**
 * Atom for updating scales based on the active chord index and optional chords data.
 *
 * @param {number} activeChordIndex - The index of the active chord.
 * @param {Object.<string, ChordInfo>} [chords] - Optional chords data.
 */
export const updateScalesAtom = atom(
	null,
	(get, set, activeChordIndex: number, chords?: { [key: string]: ChordInfo }) => {
		if (!chords) chords = get(chordsAtom);

		if (checkChordsExists(chords, activeChordIndex)) {
			const scales = chordScales(chords[activeChordIndex].chord.split('/')[0]);
			set(scalesAtom, scales);
		} else {
			set(scalesAtom, []);
		}
	}
);

/**
 * Atom that updates user preferences based on the provided action.
 *
 * @type {(action: PreferencesAction) => void}
 * @param {import('../types/interfaces').PreferencesAction} action - The action to perform.
 */
export const updatePreferencesAtom = atom(null, (get, set, action: PreferencesAction) => {
	const preferences = get(preferencesAtom);
	const updatedPreferences: Preferences = deepCopy(preferences);
	const chords = get(chordsAtom);

	let guitarNotes = get(guitarNotesAtom);

	const updateGuitarNotes = (chord: ChordInfo) => {
		if (chord) {
			const { notes, intervals } = chord;
			guitarNotes = extractRelativeNotes(notes, intervals, guitarNotes);
		}
	};

	switch (action.type) {
		case 'SET_GUITAR_TUNING':
			if (typeof action.guitarTuning !== 'string') {
				//? exception for custom tuning
				const stringIndex = Number(action.guitarTuning.string.slice(0, 1)) - 1;
				updatedPreferences.guitarTuning = 'Custom Tuning';
				const customTuning = guitarTunings['Custom Tuning'][stringIndex];
				customTuning.note = action.guitarTuning.note;
				customTuning.octave = action.guitarTuning.octave;
				localStorage.setItem('chordieCustomTuning', JSON.stringify(guitarTunings['Custom Tuning']));

				// console.table(guitarTunings['Custom Tuning'])
			} else {
				updatedPreferences.guitarTuning = action.guitarTuning;
			}

			const chordie = get(chordieAtom);
			const { activeChord } = preferences;

			guitarNotes = initializeGuitarFretboard(updatedPreferences.guitarTuning, chordie);

			if (activeChord !== null && checkChordsExists(chords, activeChord)) {
				updateGuitarNotes(chords[activeChord]);
			}

			set(guitarNotesAtom, guitarNotes);
			set(updateChordsAndScales);

			break;
		case 'TOGGLE_SHOW_MORE_CHORD_INFO':
			updatedPreferences.showMoreChordInfo = !preferences.showMoreChordInfo;

			break;
		case 'SET_ACTIVE_CHORD':
			set(updateScalesAtom, action.chordIndex);
			updatedPreferences.activeChord = action.chordIndex;

			updatedPreferences.activeScale = null;

			if (checkChordsExists(chords, action.chordIndex)) {
				if (preferences.highlightPosition) {
					set(updateFretsHighlighAtom);
				}

				updateGuitarNotes(chords[action.chordIndex]);
				set(guitarNotesAtom, guitarNotes);
			}

			break;
		case 'SET_ACTIVE_SCALE':
			if (action.scaleIndex === preferences.activeScale) {
				updatedPreferences.activeScale = null;
				set(updateGuitarNotesWithScaleAtom);

				if (preferences.showChordTones) {
					set(guitarNotesAtom, updateChordTones(get(chordieAtom), guitarNotes));
				}

				break;
			}

			updatedPreferences.activeScale = action.scaleIndex;
			break;
		case 'TOGGLE_PREFERENCE':
			const { key } = action;
			updatedPreferences[key] = !preferences[key];

			switch (key) {
				case 'showChordTones':
					if (updatedPreferences[key]) {
						updatedPreferences.activeScale = null;
						set(guitarNotesAtom, updateChordTones(get(chordieAtom), guitarNotes));
					} else {
						set(guitarNotesAtom, handleChordToneReset(guitarNotes));
					}
					break;
				case 'highlightPosition':
					set(updateFretsHighlighAtom);
					break;
			}

			break;
		default:
			console.error('updatePreferenceAtom missing action.type');
	}

	localStorage.setItem('chordiePreferences', JSON.stringify(updatedPreferences));
	set(preferencesAtom, updatedPreferences);
});
