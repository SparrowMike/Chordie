import { useAtom } from 'jotai';
import {
	scalesAtom,
	updateGuitarNotesWithScaleAtom,
} from './../controller/atoms';

export const Scales = () => {
	const [scales] = useAtom(scalesAtom);
	const [, updateGuitarNotesWithScale] = useAtom(
		updateGuitarNotesWithScaleAtom
	);

	const handleUpdateScale = (scale: string) => {
		updateGuitarNotesWithScale(scale);
	};

	return (
		<div className="scales">
			{scales?.map((scale, idx) => (
				<div onClick={() => handleUpdateScale(scale)} key={idx}>
					{scale}
				</div>
			))}
		</div>
	);
};
