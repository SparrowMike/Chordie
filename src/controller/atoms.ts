import { atom } from 'jotai';

import {
	initialChordie,
	initialGuitarNotes,
	initialPreferences,
} from '../utils/defaults';

import { deepCopy, extractRelativeNotes } from '../utils/utils';
import { get as getScale } from '@tonaljs/scale'; // Or detect as detectScale

import {
	Chordie,
	ChordInfo,
	GuitarNotes,
	Preferences,
	PreferencesAction,
} from '../types/interfaces';

import { enharmonicMap } from '../utils/constants';

export const chordieAtom = atom<Chordie>(deepCopy(initialChordie));
export const chordsAtom = atom<{ [key: string]: ChordInfo }>({});
export const guitarNotesAtom = atom<{ [key: string]: GuitarNotes }>(
	deepCopy(initialGuitarNotes)
);
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
export const updateGuitarNotesWithScaleAtom = atom(
	null,
	(get, set, scale: string) => {
		const guitarNotes = get(guitarNotesAtom);
		const chords = get(chordsAtom);
		const preferences = get(preferencesAtom);

		let guitarNotesTemp = deepCopy(guitarNotes);
		const scaleData = getScale(
			`${chords[preferences.activeChord].tonic} ${scale}`
		);
		for (const string of Object.values(guitarNotesTemp)) {
			for (const note of Object.values(string)) {
				delete note.chordTone;
			}

			for (const idx in scaleData.notes) {
				const note = scaleData.notes[idx];
				if (string[note]) {
					string[note].chordTone = true;
				} else {
					string[enharmonicMap[note]].chordTone = true;
				}
			}
		}

		guitarNotesTemp = extractRelativeNotes(
			scaleData.notes,
			scaleData.intervals,
			guitarNotesTemp
		);

		set(guitarNotesAtom, guitarNotesTemp);
	}
);

/**
 * Atom that updates user preferences based on the provided action.
 * @type {(action: PreferencesAction) => void}
 * @param {import('../types/interfaces').PreferencesAction} action - The action to perform.
 */
export const updatePreferencesAtom = atom(
	null,
	(get, set, action: PreferencesAction) => {
		const preferences = get(preferencesAtom);
		const updatedPreferences: Preferences = deepCopy(preferences);

		switch (action.type) {
			case 'TOGGLE_SHOW_MORE_CHORD_INFO':
				updatedPreferences.showMoreChordInfo = !preferences.showMoreChordInfo;
				break;
			case 'SET_ACTIVE_CHORD':
				updatedPreferences.activeChord = action.index;
				break;
			case 'TOGGLE_PREFERENCE':
				const { key } = action;
				updatedPreferences[key] = !preferences[key];
				break;
			case 'SET_ACTIVE_CHORD_RESET':
				const { chordsLength } = action;
				if (!chordsLength) break;

				updatedPreferences.activeChord =
					preferences.activeChord < chordsLength ? preferences.activeChord : 0;
				break;
			default:
				console.error('updatePreferenceAtom missing action.type');
		}

		set(preferencesAtom, updatedPreferences);
	}
);
