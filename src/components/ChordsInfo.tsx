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
		<div className='notes '>
			<button className='my-2 rounded-2xl bg-yellow-600 px-2 py-1' onClick={handleFullReset}>
				Reset Notes
			</button>
			{Object.keys(chords).length ? (
				<>
					<h2 className='text-2xl'>Detected chords:</h2>
					<ul className='flex flex-wrap'>
						{Object.values(chords).map((chord, index) => (
							<li
								key={index}
								onClick={() => setPreferences({ type: 'SET_ACTIVE_CHORD', index })}
								className={`border-2 border-transparent p-2 text-xl ${
									preferences.activeChord === index ? 'rounded-lg border-yellow-600' : ''
								}`}
							>
								<div className='chord'>{chord.chord || chord.name}</div>
								{preferences.showMoreChordInfo ? (
									<div className='ml-4'>
										{chord.empty ? (
											<p className=''>No available data</p>
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
				</>
			) : (
				<div className='text-l'>Interact with the fretboard to detect chords.</div>
			)}
		</div>
	);
};
