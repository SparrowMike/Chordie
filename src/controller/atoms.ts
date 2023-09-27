import { atom } from 'jotai';

import { initialChordie, initialGuitarNotes, initialPreferences } from '../utils/defaults';

import {
	deepCopy,
	extractRelativeNotes,
	checkChords,
	handleChordToneReset,
	extractChordQuality,
	updateChordTones,
} from '../utils/utils';

import { get as getChordData, getChord as getChordDataSymbol } from '@tonaljs/chord'; //? ----- tbc { chordScales }
import { detect as detectChord } from '@tonaljs/chord-detect';

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
export const chordsAtom = atom<{ [key: string]: ChordInfo }>({});
export const guitarNotesAtom = atom<{ [key: string]: GuitarNotes }>(deepCopy(initialGuitarNotes));
export const preferencesAtom = atom(initialPreferences);
export const scalesAtom = atom<string[] | undefined>([]);

/**
 * Atom that handles a full reset of various state atoms.
 * @type {() => void}
 */
export const handleFullResetAtom = atom(null, (_, set) => {
	set(chordieAtom, deepCopy(initialChordie));
	set(chordsAtom, {});
	set(guitarNotesAtom, deepCopy(initialGuitarNotes));
	set(scalesAtom, []);
});

/**
 * Atom for updating the `chords` and `guitarNotes` state based on the current `chordie`.
 *
 * @param {function} updateFunction - The function to update the `chords` and `guitarNotes` state.
 */

export const updateChordsAndScales = atom(null, (get, set) => {
	const chordie = get(chordieAtom);
	const preferences = get(preferencesAtom);

	let guitarNotes = get(guitarNotesAtom);
	let { activeChord } = preferences;

	if (activeChord && activeChord === null) return;

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
		const triggered = detectedChords[idx].includes('/')
			? getChordDataSymbol(...extractChordQuality(detectedChords[idx]))
			: getChordData(detectedChords[idx]);
		//! ------ getChordDataSymbol('madd9', 'F5', 'A#4') ------- some chords just won't work

		//! alternative to above would be to ignore slash chords ?
		// const [ alias, root, bassNote ] = extractChordQuality(detectedChords[idx]);
		// console.log(getChordData(root+ alias))

		// Store the extracted chord information in chordsObj
		chordsObj[idx] = {
			chord: detectedChords[idx],
			...triggered,
		};
	}
	const chordsLenght = Object.keys(chordsObj).length;
	if (chordsLenght >= 1 || (activeChord ?? -1) >= chordsLenght) {
		activeChord = 0;
		set(updatePreferencesAtom, { type: 'SET_ACTIVE_CHORD', index: 0 });
	}

	if (activeChord !== null) {
		if (checkChords(chordsObj, activeChord)) {
			const { notes, intervals } = chordsObj[activeChord];
			guitarNotes = extractRelativeNotes(notes, intervals, guitarNotes);
		}

		set(updateScalesAtom, activeChord, chordsObj);
	}

	set(
		guitarNotesAtom,
		preferences.showChordTones ? updateChordTones(chordie, guitarNotes) : guitarNotes
	);
	set(chordsAtom, chordsObj);
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

			if (key === 'showChordTones') {
				if (updatedPreferences[key]) {
					updatedPreferences.activeScale = null;
					set(guitarNotesAtom, updateChordTones(get(chordieAtom), get(guitarNotesAtom)));
				} else {
					set(guitarNotesAtom, handleChordToneReset(get(guitarNotesAtom)));
				}
			}

			break;
		default:
			console.error('updatePreferenceAtom missing action.type');
	}

	set(preferencesAtom, updatedPreferences);
});
