import { useState } from 'react';
import { useAtom } from 'jotai';
import { handleFullResetAtom, chordieAtom } from './../controller/atoms';
import { Preference } from './Preference';

export const Navigation = () => {
	const [activeOptions, setActiveOptions] = useState(false);
	const [, handleFullReset] = useAtom(handleFullResetAtom);
	const [chordie] = useAtom(chordieAtom);

	const handleDropDown = (e: React.MouseEvent) => {
		e.stopPropagation();
		setActiveOptions(!activeOptions);
	};

	return (
		<div className='navigation fixed top-0 z-50 w-full bg-neutral-900'>
			<div className='flex h-10 items-center justify-between px-4 py-2'>
				{Object.values(chordie).filter((el) => el).length > 0 && (
					<button
						className='rounded-2xl bg-neutral-500 px-2 shadow-sm shadow-neutral-200/60 active:translate-y-0.5 active:shadow-transparent'
						onClick={handleFullReset}
					>
						Reset Notes
					</button>
				)}
				<button className='ml-auto' onClick={handleDropDown}>
					Options
				</button>
			</div>
			<div
				className={`absolute z-50 w-full overflow-hidden rounded-b-lg bg-neutral-900  transition-[height] ${
					activeOptions ? 'h-[17rem]' : 'h-0'
				}`}
			>
				<Preference />
			</div>
			<div
				onClick={handleDropDown}
				className={`absolute left-0 top-10 transition-all ${
					activeOptions
						? 'h-[calc(100vh-2.5rem)] w-screen backdrop-blur-[1px]'
						: 'backdrop-blur-[0px]'
				}`}
			></div>
		</div>
	);
};
