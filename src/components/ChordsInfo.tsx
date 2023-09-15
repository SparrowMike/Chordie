import { useAtom } from 'jotai';
import {
	chordieAtom,
	chordsAtom,
	guitarNotesAtom,
	preferencesAtom,
	scalesAtom,
} from './../controller/atoms';
import { initialGuitarNotes, initialChordie } from './../utils/defaults';

export const ChordsInfo = () => {
	const [, setChordie] = useAtom(chordieAtom);
	const [chords, setChords] = useAtom(chordsAtom);
	const [, setGuitarNotes] = useAtom(guitarNotesAtom);
	const [preferences, setPreferences] = useAtom(preferencesAtom);
	const [, setScales] = useAtom(scalesAtom);

	const handleActiveChord = (index: number) => {
		setPreferences((prevPreferences) => ({
			...prevPreferences,
			activeChord: index,
		}));
	};

	const handleFullReset = () => {
		setChordie(initialChordie);
		setChords({});
		setGuitarNotes(initialGuitarNotes);
		setScales([]);
	};

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
							setPreferences((prevPreferences) => ({
								...prevPreferences,
								showMoreChordInfo: !prevPreferences.showMoreChordInfo,
							}))
						}
					/>
					More chord information
				</label>
			</div>
			{Object.keys(chords).length ? (
				<ul>
					{Object.values(chords).map((chord, i) => (
						<li
							key={i}
							onClick={() => handleActiveChord(i)}
							className={`${preferences.activeChord === i ? 'active' : ''}`}
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
