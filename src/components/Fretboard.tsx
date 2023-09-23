import { useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { useAtom } from 'jotai';
import {
	chordieAtom,
	chordsAtom,
	guitarNotesAtom,
	preferencesAtom,
	updateChordieAtom,
} from './../controller/atoms';

// import { majorKey, minorKey } from '@tonaljs/key';

import { updateChordTones } from '../utils/utils';

export const Fretboard = () => {
	const [chordie] = useAtom(chordieAtom);
	const [chords] = useAtom(chordsAtom);
	const [guitarNotes, setGuitarNotes] = useAtom(guitarNotesAtom);
	const [preferences] = useAtom(preferencesAtom);
	const [, setChordie] = useAtom(updateChordieAtom);

	useEffect(() => {
		//! --------- this should be moved
		setGuitarNotes(updateChordTones(chordie, guitarNotes, preferences.showChordTones));
	}, [chordie, preferences.showChordTones]);

	return (
		<div className='guitar'>
			<div className='frets'>
				{Array(12)
					.fill(0)
					.map((_, i) => (
						<div className='fret' key={i} data-fret={i}>
							<div className='fret-silver'></div>
						</div>
					))}
			</div>
			<div className='strings'>
				{Object.entries(guitarNotes).map(([string, v], i) => (
					<div className='string' key={i} data-string={string}>
						{Object.entries(v).map(([note, _v], _i) => {
							const intervalsAvailable = !chords[preferences.activeChord ?? -1]?.intervals?.length;
							const chordNote =
								preferences.showNotes || intervalsAvailable || !Object.values(chords).length
									? _v?.relativeNote || note
									: _v?.interval;

							return (
								<div
									className={`note ${_v.active || _v.chordTone ? 'active' : ''} ${
										isMobile ? 'mobile' : ''
									}`}
									key={_i}
									onClick={() => setChordie(string, note)}
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
