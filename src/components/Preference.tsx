import { useAtom } from 'jotai';
import { preferencesAtom, updatePreferencesAtom, chordsAtom } from './../controller/atoms';
import { PreferencesAction, ToggleOptionProps } from '../types/interfaces';
import { checkChordsExists } from '../utils/utils';
import { chromaticSharp } from '../utils/constants';
import { guitarTunings } from '../utils/defaults';

const ToggleOption: React.FC<ToggleOptionProps> = ({
	checked,
	onChange,
	label,
	type = 'checkbox',
	...props
}) => (
	<label className='flex items-center gap-2 text-xl accent-yellow-600'>
		<input className='h-4 w-4' type={type} checked={checked} onChange={onChange} {...props} />
		<p className='whitespace-nowrap'>{label}</p>
	</label>
);

export const Preference = () => {
	const [preferences] = useAtom(preferencesAtom);
	const [chords] = useAtom(chordsAtom);
	const [, setPreferences] = useAtom(updatePreferencesAtom);

	const handleSetPreferences = <T extends PreferencesAction>(pref: T) => {
		setPreferences(pref);
	};

	const GuitarTuning = () => {
		return (
			<label className='flex items-center gap-2 text-xl text-white'>
				<select
					value={preferences.guitarTuning}
					onChange={(event) =>
						handleSetPreferences({ type: 'SET_GUITAR_TUNING', guitarTuning: event.target.value })
					}
					className='h-8 w-full rounded-md border border-gray-600 bg-gray-800'
				>
					{Object.keys(guitarTunings).map((val, idx) => {
						return (
							<option key={idx} value={val}>
								{val}
							</option>
						);
					})}
				</select>
			</label>
		);
	};

	const CustomTuning = () => {
		const notes = Array.from({ length: 3 }, () => [...chromaticSharp]).flat();
		const semiToneOffSet = 4;

		const dropDown: { [key: string]: { note: string; octave: number }[] } = {};

		guitarTunings['Standard Tuning'].forEach((el) => {
			const noteIdx = notes.indexOf(el.note.toUpperCase());

			dropDown[el.string] = [];

			let octave = el.octave;
			for (let i = 0; i <= 9; i++) {
				const note = notes[noteIdx + chromaticSharp.length - semiToneOffSet + i];
				if (i !== 0 && note === 'C') octave++;
				dropDown[el.string].push({ note: note, octave: octave });
			}
		});

		return (
			<div className='my-1 flex justify-between'>
				{Object.entries(dropDown).map(([string, value], idx) => {
					return (
						<label className='text-xl text-white' key={idx}>
							{/* {string.split(' ')[0]}	 */}
							<select
								value={guitarTunings['Custom Tuning'][idx].note}
								onChange={(event) => {
									const octaveAttribute =
										event.target.selectedOptions[0].getAttribute('data-octave');

									handleSetPreferences({
										type: 'SET_GUITAR_TUNING',
										guitarTuning: {
											string: string,
											note: event.target.value,
											octave: Number(octaveAttribute),
										},
									});
								}}
								className='h-8 w-14 rounded-md border border-gray-600 bg-gray-800'
							>
								{Object.values(value).map((val, idx) => {
									return (
										<option key={idx} value={val.note} data-octave={val.octave}>
											{val.note}
										</option>
									);
								})}
							</select>
						</label>
					);
				})}
			</div>
		);
	};

	return (
		<div className='options m-auto flex flex-col p-4 pt-0'>
			<h2 className='text-2xl'>Chord Options</h2>

			<ToggleOption
				checked={
					preferences.showNotes ||
					(Object.keys(chords).length && !chords[preferences.activeChord ?? -1].intervals.length)
						? true
						: false
				}
				onChange={() => handleSetPreferences({ type: 'TOGGLE_PREFERENCE', key: 'showNotes' })}
				label='Show notes'
				type='radio'
			/>
			<ToggleOption
				disabled={
					!checkChordsExists(chords, preferences.activeChord ?? -1) ||
					chords[preferences.activeChord ?? -1]?.empty ||
					false
				}
				checked={!preferences.showNotes}
				onChange={() => handleSetPreferences({ type: 'TOGGLE_PREFERENCE', key: 'showNotes' })}
				label='Show Intervals'
				type='radio'
			/>
			<ToggleOption
				id='show-chord-tones'
				checked={preferences.showChordTones}
				onChange={() => handleSetPreferences({ type: 'TOGGLE_PREFERENCE', key: 'showChordTones' })}
				label='Show chord tones'
			/>
			<ToggleOption
				id='zoom-fretboard'
				checked={preferences.fretboardZoom}
				onChange={() => handleSetPreferences({ type: 'TOGGLE_PREFERENCE', key: 'fretboardZoom' })}
				label='Zoom In fretboard'
			/>
			<ToggleOption
				id='chord-information'
				checked={preferences.showMoreChordInfo}
				onChange={() => handleSetPreferences({ type: 'TOGGLE_SHOW_MORE_CHORD_INFO' })}
				label='More chord information'
			/>
			<ToggleOption
				id='show-scales'
				checked={preferences.showScales}
				onChange={() => handleSetPreferences({ type: 'TOGGLE_PREFERENCE', key: 'showScales' })}
				label='Show Scales'
			/>
			<ToggleOption
				id='highlight-notes'
				checked={preferences.highlightNotes}
				onChange={() => handleSetPreferences({ type: 'TOGGLE_PREFERENCE', key: 'highlightNotes' })}
				label='Highlight Notes'
			/>
			<ToggleOption
				id='highlightPosition'
				checked={preferences.highlightPosition}
				onChange={() =>
					handleSetPreferences({ type: 'TOGGLE_PREFERENCE', key: 'highlightPosition' })
				}
				label='Highlight Position (experimental)'
			/>
			<GuitarTuning />
			{preferences.guitarTuning.includes('Custom') && <CustomTuning />}
		</div>
	);
};
