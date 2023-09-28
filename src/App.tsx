import { ChordsInfo } from './components/ChordsInfo';
import { Scales } from './components/Scales';
import { Fretboard } from './components/Fretboard';

import { useAtom } from 'jotai';
import { preferencesAtom } from './controller/atoms';
import { Navigation } from './components/Navigation';

function App() {
	const [preferences] = useAtom(preferencesAtom);

	return (
		<div className='App relative overflow-y-scroll text-white'>
			<Navigation />
			<div className='max-w-4xl space-y-5 px-2 pb-5 pt-12 sm:px-5'>
				<Fretboard />
				<ChordsInfo />
				{preferences.showScales && <Scales />}
			</div>
		</div>
	);
}

export default App;
