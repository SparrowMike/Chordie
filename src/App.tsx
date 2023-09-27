import { ChordsInfo } from './components/ChordsInfo';
import { Scales } from './components/Scales';
import { Fretboard } from './components/Fretboard';

import { useAtom } from 'jotai';
import { preferencesAtom } from './controller/atoms';
import { Navigation } from './components/Navigation';

function App() {
	const [preferences] = useAtom(preferencesAtom);

	return (
		<div className='App relative h-screen overflow-y-scroll bg-black text-white'>
			<Navigation />
			<div className='space-y-5 p-2 sm:p-5'>
				<Fretboard />
				<ChordsInfo />
				{preferences.showScales && <Scales />}
			</div>
		</div>
	);
}

export default App;
