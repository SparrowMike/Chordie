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

import {
	checkChords,
	deepCopy,
	extractRelativeNotes,
	updateChordTones,
	extractChordQuality,
} from '../utils/utils';

import { ChordInfo } from '../types/interfaces';

export const Fretboard = () => {
	const [chordie, setChordie] = useAtom(chordieAtom);
	const [chords, setChords] = useAtom(chordsAtom);
	const [guitarNotes, setGuitarNotes] = useAtom(guitarNotesAtom);
	const [preferences] = useAtom(preferencesAtom);
	const [, setPreferences] = useAtom(updatePreferencesAtom);
	const [, setScale] = useAtom(updateScalesAtom);

	/**
	 * Handles the update of chord selection on the guitar fretboard.
	 * @param {string} string - The string on the guitar.
	 * @param {string} target - The target note on the string.
	 */
	const handleChordUpdate = (string: string, target: string) => {
		let guitarNotesTemp = deepCopy(guitarNotes);

		const chordieTemp = deepCopy(chordie);
		const currentTargetActiveState = guitarNotesTemp[string][target].active;

		let { activeChord } = preferences;
		if (activeChord && activeChord === null) return;

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
				: getChordData(detectedChords[idx]);
			//! ------ getChordDataSymbol('madd9', 'F5', 'A#4') ------- some chords just won't work

			//! alternative to above would be to ignore slash chords ?
			// const [ alias, root, bassNote ] = extractChordQuality(detectedChords[idx]);
			// console.log(getChordData(root+ alias))

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

		const chordsLenght = Object.keys(chordsObj).length;
		if (chordsLenght === 1 || (activeChord ?? -1) >= chordsLenght) {
			activeChord = 0;
			setPreferences({ type: 'SET_ACTIVE_CHORD', index: 0 });
		}

		if (activeChord !== null) {
			if (checkChords(chordsObj, activeChord)) {
				const { notes, intervals } = chordsObj[activeChord];
				guitarNotesTemp = extractRelativeNotes(notes, intervals, guitarNotesTemp);
			}

			setScale(activeChord, chordsObj);
		}

		setChordie(chordieTemp);
		setGuitarNotes(guitarNotesTemp);
		setChords(chordsObj);
	};

	useEffect(() => {
		if (Object.keys(chords).length) {
			if (preferences.activeChord === null) return;
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
