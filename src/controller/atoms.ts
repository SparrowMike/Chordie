import { atom } from 'jotai';

import { initialChordie, initialGuitarNotes, initialPreferences } from '../utils/defaults';

import { deepCopy, extractRelativeNotes, checkChords, handleChordToneReset } from '../utils/utils';

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
	set(chordieAtom, initialChordie);
	set(chordsAtom, {});
	set(guitarNotesAtom, initialGuitarNotes);
	set(scalesAtom, []);
});

/**
 * Atom that updates the guitar notes with a selected scale.
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

	//! -------------- some slash chords come with blank chord informations
	//! -------------- extracting tonic is required to get the scales
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
	}

	if (scaleData) {
		guitarNotesTemp = extractRelativeNotes(scaleData.notes, scaleData.intervals, guitarNotesTemp);
	}

	set(guitarNotesAtom, guitarNotesTemp);
});

/**
 * Atom for updating scales based on the active chord index and optional chords data.
 *
 * @param {number} activeChordIndex - The index of the active chord.
 * @param {Object.<string, ChordInfo>} [chords] - Optional chords data.
 * @returns {void}
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
			set(updateScalesAtom, action.index);
			updatedPreferences.activeChord = action.index;
			set(guitarNotesAtom, handleChordToneReset(get(guitarNotesAtom))); //? clear the fretboard from non chord notes
			updatedPreferences.activeScale = null;
			break;
		case 'SET_ACTIVE_SCALE':
			if (action.index === preferences.activeScale) {
				updatedPreferences.activeScale = null; //? toggle on/off active scale
				set(updateGuitarNotesWithScaleAtom);
				break;
			}

			updatedPreferences.activeScale = action.index;
			break;
		case 'TOGGLE_PREFERENCE':
			const { key } = action;
			updatedPreferences[key] = !preferences[key];
			break;
		default:
			console.error('updatePreferenceAtom missing action.type');
	}

	set(preferencesAtom, updatedPreferences);
});
