import { isMobile } from 'react-device-detect';
import { useAtom } from 'jotai';
import {
	chordsAtom,
	guitarNotesAtom,
	preferencesAtom,
	updateChordieAtom,
} from './../controller/atoms';

// import { majorKey, minorKey } from '@tonaljs/key';

export const Fretboard = () => {
	const [chords] = useAtom(chordsAtom);
	const [guitarNotes] = useAtom(guitarNotesAtom);
	const [preferences] = useAtom(preferencesAtom);
	const [, setChordie] = useAtom(updateChordieAtom);

	// const FRET_SIZE = 'w-12'
	// const FRET_ZERO_SIZE = 'w-12'

	return (
		<div className='overflow-x-auto'>
			<div className='guitar relative w-fit bg-cover p-0'>
				<div className='frets pointer-events-none absolute flex h-full w-full'>
					{Array(12)
						.fill(0)
						.map((_, index) => (
							<div
								className='fret relative flex w-12 min-w-[3rem] first:min-w-[2.25rem]'
								key={index}
								data-fret={index}
							>
								<div
									className={`${
										index === 0 ? 'w-2 bg-slate-200' : 'w-[2px] rounded-3xl bg-black'
									} fret-silver absolute right-0 z-10 h-full translate-x-1/2 ${
										index === 11 ? 'hidden' : ''
									}`}
								></div>
							</div>
						))}
				</div>
				<div className='strings'>
					{Object.entries(guitarNotes).map(([string, v], i) => (
						<div className='string relative flex h-10 w-fit' key={i} data-string={string}>
							{Object.entries(v).map(([note, _v], _i) => {
								const intervalsAvailable =
									!chords[preferences.activeChord ?? -1]?.intervals?.length;
								const chordNote =
									preferences.showNotes || intervalsAvailable || !Object.values(chords).length
										? _v?.relativeNote || note
										: _v?.interval;

								return (
									<div
										className={`note group relative z-30 flex min-w-[3rem] cursor-pointer items-center justify-center text-black first:min-w-[2.25rem] ${
											_v.active || _v.chordTone ? 'active' : ''
										} ${isMobile ? 'mobile' : ''} ${_i === 0 ? '' : ''}`}
										key={_i}
										onClick={() => setChordie(string, note)}
										data-note={chordNote}
									>
										<h4 className={`z-30 font-medium opacity-0`}>{chordNote}</h4>
									</div>
								);
							})}
						</div>
					))}
				</div>
			</div>
		</div>
	);
};
