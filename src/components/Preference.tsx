import { useAtom } from 'jotai';
import { preferencesAtom, updatePreferencesAtom, chordsAtom } from './../controller/atoms';
import { PreferencesAction, ToggleOptionProps } from '../types/interfaces';
import { checkChords } from '../utils/utils';

const ToggleOption: React.FC<ToggleOptionProps> = ({
	checked,
	onChange,
	label,
	type = 'checkbox',
	...props
}) => (
	<label className='flex items-center gap-2 text-xl accent-yellow-600'>
		<input className='h-4 w-4' type={type} checked={checked} onChange={onChange} {...props} />
		<p>{label}</p>
	</label>
);

export const Preference = () => {
	const [preferences] = useAtom(preferencesAtom);
	const [chords] = useAtom(chordsAtom);
	const [, setPreferences] = useAtom(updatePreferencesAtom);

	const handleSetPreferences = <T extends PreferencesAction>(pref: T) => {
		setPreferences(pref);
	};

	return (
		<div className='options flex flex-col p-4 pt-0'>
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
					!checkChords(chords, preferences.activeChord ?? -1) ||
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
				id='show-scales'
				checked={preferences.highlightRoot}
				onChange={() => handleSetPreferences({ type: 'TOGGLE_PREFERENCE', key: 'highlightRoot' })}
				label='Highlight Root'
			/>
			<ToggleOption
				id='highlightPosition'
				checked={preferences.highlightPosition}
				onChange={() =>
					handleSetPreferences({ type: 'TOGGLE_PREFERENCE', key: 'highlightPosition' })
				}
				label='Highlight Position (experimental)'
			/>
		</div>
	);
};
