import { useAtom } from 'jotai';
import {
	preferencesAtom,
	updatePreferencesAtom,
	chordsAtom,
} from './../controller/atoms';
import { ToggleOptionProps } from '../types/interfaces';

const ToggleOption: React.FC<ToggleOptionProps> = ({
	checked,
	onChange,
	label,
	type = 'checkbox',
	...props
}) => (
	<label>
		<input type={type} checked={checked} onChange={onChange} {...props} />
		{label}
	</label>
);

export const Preference = () => {
	const [preferences] = useAtom(preferencesAtom);
	const [chords] = useAtom(chordsAtom);
	const [, setPreferences] = useAtom(updatePreferencesAtom);

	const handleShowChordTones = () => {
		setPreferences({ type: 'TOGGLE_PREFERENCE', key: 'showChordTones' });
	};

	const handleShowNotes = () => {
		setPreferences({ type: 'TOGGLE_PREFERENCE', key: 'showNotes' });
	};

	return (
		<div className="options">
			<h2>Chord Options</h2>
			<ToggleOption
				checked={preferences.showNotes}
				onChange={handleShowNotes}
				label="Show notes"
				type="radio"
			/>
			<ToggleOption
				disabled={
					!Object.keys(chords).length || chords[preferences.activeChord].empty
				}
				checked={!preferences.showNotes}
				onChange={handleShowNotes}
				label="Show Intervals"
				type="radio"
			/>
			<ToggleOption
				id="show-chord-tones"
				checked={preferences.showChordTones}
				onChange={handleShowChordTones}
				label="Show chord tones"
			/>
			<ToggleOption
				id="show-scales"
				checked={preferences.showScales}
				onChange={() =>
					setPreferences({ type: 'TOGGLE_PREFERENCE', key: 'showScales' })
				}
				label="Show Scales"
			/>
		</div>
	);
};
