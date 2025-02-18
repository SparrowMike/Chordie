import { isMobile } from 'react-device-detect';
import { useAtom } from 'jotai';
import {
	chordsAtom,
	fretsAtom,
	guitarNotesAtom,
	preferencesAtom,
	updateChordieAtom,
} from './../controller/atoms';
import { musicalColorsClasses } from '../utils/constants';

export const Fretboard = () => {
	const [chords] = useAtom(chordsAtom);
	const [frets] = useAtom(fretsAtom);
	const [guitarNotes] = useAtom(guitarNotesAtom);
	const [preferences] = useAtom(preferencesAtom);
	const [, setChordie] = useAtom(updateChordieAtom);

	const FRET_SIZE = preferences.fretboardZoom
		? 'relative flex w-[3.25rem] first:w-[2.5rem] sm:w-[4.55rem] sm:first:w-[3.25rem]'
		: 'relative flex w-full';

	return (
		<div className='overflow-x-auto'>
			<div
				className={`guitar relative bg-cover p-0 ${preferences.fretboardZoom ? 'w-fit' : 'w-full'}`}
			>
				<div className='frets pointer-events-none absolute flex h-full w-full'>
					{frets.map((val) => (
						<div
							className={`fret ${FRET_SIZE} ${preferences.highlightPosition && val.data}`}
							key={val.fretNumber}
							data-fret={val.fretNumber}
						>
							<div
								className={`${
									val.fretNumber === 0
										? 'w-2 bg-slate-200'
										: 'w-[2.5px] rounded-3xl bg-black sm:w-[3px]'
								} fret-silver absolute right-0 z-10 h-full translate-x-1/2 ${
									val.fretNumber === 11 ? 'hidden' : ''
								}`}
							></div>
						</div>
					))}
				</div>

				<div className='strings'>
					{Object.entries(guitarNotes).map(([string, v], i) => (
						<div
							className={`string relative flex ${
								preferences.fretboardZoom ? 'h-10 sm:h-12' : 'sm:h-12'
							}`}
							key={i}
							data-string={string}
						>
							{Object.entries(v).map(([note, _v], fretIdx) => {
								const intervalsAvailable =
									!chords[preferences.activeChord ?? -1]?.intervals?.length;
								const chordNote =
									preferences.showNotes || intervalsAvailable || !Object.values(chords).length
										? _v?.relativeNote || note
										: _v?.interval;
								const noteBackground = preferences.highlightNotes
									? `${musicalColorsClasses[note]}`
									: _v.active
									? 'bg-orange-500/90'
									: 'bg-orange-800/90';
								return (
									<div
										className={`note relative z-30 flex cursor-pointer items-center justify-center text-black opacity-0 ${FRET_SIZE} ${
											!preferences.fretboardZoom && 'aspect-square'
										}${isMobile ? '' : 'hover:opacity-100'} ${
											_v.active || _v.chordTone || fretIdx === 0 ? 'opacity-100' : ''
										}`}
										key={fretIdx}
										onClick={() => setChordie(string, note)}
										data-note={chordNote}
									>
										<h4
											className={`z-30 flex aspect-square items-center justify-center rounded-3xl border-[3px] border-neutral-800 font-medium text-neutral-900 shadow-sm shadow-neutral-500/60 
										${fretIdx === 0 && !_v.active && !_v.chordTone ? '!bg-transparent !text-white !backdrop-blur' : ''} 
										${fretIdx === 0 ? 'h-[80%] sm:h-[85%]' : 'h-[90%] sm:h-[95%]'} ${noteBackground}`}
										>
											{chordNote}
										</h4>
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
