import { atom } from 'jotai';

import { initialChordie, initialPreferences, initialGuitarFrets } from '../utils/defaults';

import {
	deepCopy,
	extractRelativeNotes,
	checkChords,
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

import { enharmonicMap } from '../utils/constants';

import { chromaticSharp } from '../utils/constants';

export const chordieAtom = atom<Chordie>(deepCopy(initialChordie));
export const fretsAtom = atom(deepCopy(initialGuitarFrets));
export const chordsAtom = atom<{ [key: string]: ChordInfo }>({});
export const guitarNotesAtom = atom<{ [key: string]: GuitarNotes }>(
	initializeGuitarFretboard('Standard Tuning')
);
export const preferencesAtom = atom(initialPreferences);
export const scalesAtom = atom<string[] | undefined>([]);

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
});

/**
 * Atom that deals with highlighting positions on the fretboard.
 */
export const updateFretsAtom = atom(null, (get, set) => {
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
					frets[_i].data = key;
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
		set(updatePreferencesAtom, { type: 'SET_ACTIVE_CHORD', index: 0 });
	}

	if (activeChord !== null) {
		if (checkChords(chordsObj, activeChord)) {
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
		set(updateFretsAtom);
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
	const chordie = get({ ...chordieAtom });

	if (guitarNotes[string][target].chordTone) return;

	const currentTargetActiveState = guitarNotes[string][target].active;

	for (const note in guitarNotes[string]) {
		guitarNotes[string][note].active = false;
	}

	guitarNotes[string][target].active = !currentTargetActiveState;

	chordie[string] = !currentTargetActiveState ? target : null;

	set(chordieAtom, chordie);
	set(guitarNotesAtom, guitarNotes);

	set(updateChordsAndScales);
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

		if (checkChords(chords, activeChordIndex)) {
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

	switch (action.type) {
		case 'SET_GUITAR_TUNING':
			updatedPreferences.guitarTuning = action.guitarTuning;

			set(guitarNotesAtom, initializeGuitarFretboard(action.guitarTuning, get(chordieAtom)));
			break;
		case 'TOGGLE_SHOW_MORE_CHORD_INFO':
			updatedPreferences.showMoreChordInfo = !preferences.showMoreChordInfo;
			break;
		case 'SET_ACTIVE_CHORD':
			const guitarNotes = get(guitarNotesAtom);
			const chords = get(chordsAtom);

			set(updateScalesAtom, action.index);
			updatedPreferences.activeChord = action.index;

			updatedPreferences.activeScale = null; //? toggle on/off active scale

			// if (Object.keys(chords).length && chords[action.index].empty) {
			// 	updatedPreferences.showNotes = true; //!------- force change when no intervals?
			// }

			if (Object.keys(chords).length) {
				const { notes, intervals } = chords[action.index];
				set(guitarNotesAtom, extractRelativeNotes(notes, intervals, guitarNotes));

				if (preferences.highlightPosition) {
					set(updateFretsAtom);
				}
			}
			break;
		case 'SET_ACTIVE_SCALE':
			if (action.index === preferences.activeScale) {
				updatedPreferences.activeScale = null;
				set(updateGuitarNotesWithScaleAtom);
				break;
			}

			updatedPreferences.activeScale = action.index;
			break;
		case 'TOGGLE_PREFERENCE':
			const { key } = action;
			updatedPreferences[key] = !preferences[key];

			switch (key) {
				case 'showChordTones':
					if (updatedPreferences[key]) {
						updatedPreferences.activeScale = null;
						set(guitarNotesAtom, updateChordTones(get(chordieAtom), get(guitarNotesAtom)));
					} else {
						set(guitarNotesAtom, handleChordToneReset(get(guitarNotesAtom)));
					}
					break;
				case 'highlightPosition':
					set(updateFretsAtom);
					break;
			}

			break;
		default:
			console.error('updatePreferenceAtom missing action.type');
	}

	set(preferencesAtom, updatedPreferences);
});
