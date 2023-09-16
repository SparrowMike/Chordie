import { useAtom } from 'jotai';
import {
	chordsAtom,
	preferencesAtom,
	handleFullResetAtom,
	updatePreferencesAtom,
} from './../controller/atoms';

export const ChordsInfo = () => {
	const [chords] = useAtom(chordsAtom);
	const [preferences] = useAtom(preferencesAtom);
	const [, setPreferences] = useAtom(updatePreferencesAtom);
	const [, handleFullReset] = useAtom(handleFullResetAtom);

	return (
		<div className="notes">
			<button onClick={handleFullReset}>Reset Notes</button>
			<div style={{ padding: '10px 0' }}>
				<label>
					<input
						type="checkbox"
						className="checkbox"
						id="chord-information"
						checked={preferences.showMoreChordInfo}
						onChange={() =>
							setPreferences({ type: 'TOGGLE_SHOW_MORE_CHORD_INFO' })
						}
					/>
					More chord information
				</label>
			</div>
			{Object.keys(chords).length ? (
				<ul>
					{Object.values(chords).map((chord, index) => (
						<li
							key={index}
							onClick={() =>
								setPreferences({ type: 'SET_ACTIVE_CHORD', index })
							}
							className={`${preferences.activeChord === index ? 'active' : ''}`}
						>
							Detected chord: {chord.chord}{' '}
							{preferences.showMoreChordInfo ? (
								<div style={{ paddingLeft: '25px' }}>
									{chord.empty ? (
										<p>No available data</p>
									) : (
										<>
											<p>Name: {chord.name}</p>
											<p>Aliases: {chord.aliases.join(' / ')}</p>
											<p>Intervals: {chord.intervals.join(' / ')}</p>
											<p>Notes: {chord.notes.join(' / ')}</p>
										</>
									)}
								</div>
							) : (
								''
							)}
						</li>
					))}
				</ul>
			) : (
				<div>No chords available.</div>
			)}
		</div>
	);
};
