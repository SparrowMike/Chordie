import { ChordsInfo } from './components/ChordsInfo';
import { Scales } from './components/Scales';
import { Fretboard } from './components/Fretboard';

import { useAtom } from 'jotai';
import { preferencesAtom, initialChordieAtom } from './controller/atoms';
import { Navigation } from './components/Navigation';

import { useEffect } from 'react';
import ReactGA from 'react-ga4';

function App() {
	const [preferences] = useAtom(preferencesAtom);
	const [, trigger] = useAtom(initialChordieAtom);
	const localStorageChordie = localStorage.getItem('chordie');

	useEffect(() => {
		ReactGA.initialize('G-T8JLT44E6N');

		if (localStorageChordie) trigger(JSON.parse(localStorageChordie)); //! --- will cause double log on boot
	}, []);

	return (
		<div className='App overflow-hidden text-white'>
			<div className='app-navbar-notch'></div>
			<Navigation />
			<div className='m-auto max-w-4xl space-y-2 pb-5 pt-11 sm:px-5 sm:pt-14'>
				<Fretboard />
				<div className='space-y-2 px-2 sm:px-0'>
					<ChordsInfo />
					{preferences.showScales && <Scales />}
				</div>
			</div>
		</div>
	);
}

export default App;
