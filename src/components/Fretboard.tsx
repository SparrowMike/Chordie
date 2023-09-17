import { useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { useAtom } from 'jotai';
import {
	chordieAtom,
	chordsAtom,
	guitarNotesAtom,
	preferencesAtom,
	updatePreferencesAtom,
	updateScalesAtom,
} from './../controller/atoms';

import { get as getChordData, getChord as getChordDataSymbol } from '@tonaljs/chord'; //? ----- tbc { chordScales }
import { detect as detectChord } from '@tonaljs/chord-detect';

// import { majorKey, minorKey } from '@tonaljs/key';

import { checkChords, deepCopy, extractRelativeNotes, updateChordTones } from '../utils/utils';
import { chromaticSharp } from '../utils/constants';

import { ChordInfo } from '../types/interfaces';

export const Fretboard = () => {
	const [chordie, setChordie] = useAtom(chordieAtom);
	const [chords, setChords] = useAtom(chordsAtom);
	const [guitarNotes, setGuitarNotes] = useAtom(guitarNotesAtom);
	const [preferences] = useAtom(preferencesAtom);
	const [, setPreferences] = useAtom(updatePreferencesAtom);
	const [, setScale] = useAtom(updateScalesAtom);

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
	const extractChordQuality = (chordData: string): [string, string, string] => {
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

	/**
	 * Handles the update of chord selection on the guitar fretboard.
	 * @param {string} string - The string on the guitar.
	 * @param {string} target - The target note on the string.
	 */
	const handleChordUpdate = (string: string, target: string) => {
		let guitarNotesTemp = deepCopy(guitarNotes);

		const chordieTemp = deepCopy(chordie);
		const currentTargetActiveState = guitarNotesTemp[string][target].active;

		const { activeChord } = preferences;
		if (guitarNotesTemp[string][target].chordTone) return;

		// Reset all the notes on the selected string to be inactive
		for (const note in guitarNotesTemp[string]) {
			guitarNotesTemp[string][note].active = false;
		}

		// Toggle the activity status of the target note
		guitarNotesTemp[string][target].active = !currentTargetActiveState;

		// Update chordie with the selected or deselected chord tone
		chordieTemp[string] = !currentTargetActiveState ? target : null;

		// Filter out null values from chordie and detect chords based on selected chord tones
		const nonNullStringChordie: string[] = Object.values(chordieTemp).filter(
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
			const { tonic, empty, name, aliases, intervals, notes, quality, type } = detectedChords[
				idx
			].includes('/')
				? getChordDataSymbol(...extractChordQuality(detectedChords[idx]))
				: getChordData(detectedChords[idx]); //! ------ getChordDataSymbol('madd9', 'F5', 'A#4') ------- some chords just won't work

			const intervalsObj: { [key: string]: string } = notes.reduce(
				(obj, key, index) => {
					obj[key] = intervals[index];
					return obj;
				},
				{} as { [key: string]: string }
			);

			// Store the extracted chord information in chordsObj
			chordsObj[idx] = {
				chord: detectedChords[idx],
				tonic,
				empty,
				name,
				aliases,
				intervals,
				notes,
				quality,
				type,
				intervalsObj,
			};
		}

		if (checkChords(chordsObj, activeChord)) {
			const { notes, intervals } = chordsObj[activeChord];
			guitarNotesTemp = extractRelativeNotes(notes, intervals, guitarNotesTemp);
		}

		if (activeChord >= Object.keys(chordsObj).length) {
			setPreferences({ type: 'SET_ACTIVE_CHORD', index: 0 });
		}

		setScale(activeChord, chordsObj);

		setChordie(chordieTemp);
		setGuitarNotes(guitarNotesTemp);
		setChords(chordsObj);
	};

	useEffect(() => {
		if (Object.keys(chords).length) {
			const { notes, intervals } = chords[preferences.activeChord];
			setGuitarNotes(extractRelativeNotes(notes, intervals, guitarNotes));
		}
	}, [preferences.activeChord]);

	useEffect(() => {
		setGuitarNotes(updateChordTones(chordie, guitarNotes, preferences.showChordTones));
	}, [chordie, preferences.showChordTones]);

	return (
		<div className="guitar">
			<div className="frets">
				{Array(12)
					.fill(0)
					.map((_, i) => (
						<div className="fret" key={i} data-fret={i}>
							<div className="fret-silver"></div>
						</div>
					))}
			</div>
			<div className="strings">
				{Object.entries(guitarNotes).map(([string, v], i) => (
					<div className="string" key={i} data-string={string}>
						{Object.entries(v).map(([note, _v], _i) => {
							const chordNote =
								preferences.showNotes || !Object.values(chords).length
									? _v?.relativeNote || note
									: _v?.interval;

							return (
								<div
									className={`note ${_v.active || _v.chordTone ? 'active' : ''} ${
										isMobile ? 'mobile' : ''
									}`}
									key={_i}
									onClick={() => handleChordUpdate(string, note)}
									data-note={chordNote}
								>
									<h4>{chordNote}</h4>
								</div>
							);
						})}
					</div>
				))}
			</div>
		</div>
	);
};
