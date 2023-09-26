import { Preference } from './components/Preference';
import { ChordsInfo } from './components/ChordsInfo';
import { Scales } from './components/Scales';
import { Fretboard } from './components/Fretboard';

import { useAtom } from 'jotai';
import { preferencesAtom } from './controller/atoms';

function App() {
	const [preferences] = useAtom(preferencesAtom);

	return (
		<div className='App h-screen space-y-5 overflow-y-scroll bg-black p-2 text-white sm:p-5'>
			<Fretboard />
			<ChordsInfo />
			<Preference />
			{preferences.showScales && <Scales />}
		</div>
	);
}

export default App;
