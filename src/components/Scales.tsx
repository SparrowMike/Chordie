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
		setPreferences({ type: 'SET_ACTIVE_SCALE', index: index });
	};

	return (
		<div className="scales">
			{scales?.map((scale, idx) => (
				<div
					onClick={() => handleUpdateScale(scale, idx)}
					key={idx}
					className={idx === preferences.activeScale ? 'active' : ''}
				>
					{scale}
				</div>
			))}
		</div>
	);
};
