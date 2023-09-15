import { atom } from 'jotai';

import {
	initialChordie,
	initialGuitarNotes,
	initialPreferences,
} from '../utils/defaults';
import { deepCopy, extractRelativeNotes } from '../utils/utils';
import { get as getScale } from '@tonaljs/scale'; // Or detect as detectScale

import { Chordie, ChordInfo, GuitarNotes } from '../types/interfaces';
import { enharmonicMap } from '../utils/constants';

export const chordieAtom = atom<Chordie>(deepCopy(initialChordie));
export const chordsAtom = atom<{ [key: string]: ChordInfo }>({});
export const guitarNotesAtom = atom<{ [key: string]: GuitarNotes }>(
	deepCopy(initialGuitarNotes)
);
export const preferencesAtom = atom(initialPreferences);
export const scalesAtom = atom<string[] | undefined>([]);

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
