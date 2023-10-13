import { useAtom } from 'jotai';
import {
	scalesAtom,
	updateGuitarNotesWithScaleAtom,
	preferencesAtom,
	updatePreferencesAtom,
} from './../controller/atoms';

export const Scales = () => {
	const [scales] = useAtom(scalesAtom);
	const [, updateGuitarNotesWithScale] = useAtom(updateGuitarNotesWithScaleAtom);
	const [preferences] = useAtom(preferencesAtom);
	const [, setPreferences] = useAtom(updatePreferencesAtom);

	const handleUpdateScale = (scale: string, index: number) => {
		updateGuitarNotesWithScale(scale);
		setPreferences({ type: 'SET_ACTIVE_SCALE', scaleIndex: index });
	};

	return (
		<div className='scales flex flex-wrap gap-2'>
			{scales?.slice(0, 8)?.map((scale, idx) => (
				<div
					onClick={() => handleUpdateScale(scale, idx)}
					key={idx}
					className={`border-2 border-transparent px-2 py-1 text-xl ${
						idx === preferences.activeScale ? 'rounded-lg border-yellow-600' : ''
					}`}
				>
					{scale}
				</div>
			))}
		</div>
	);
};
