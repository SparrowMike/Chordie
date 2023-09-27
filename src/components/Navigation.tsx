import { useState } from 'react';
import { Preference } from './Preference';

export const Navigation = () => {
	const [active, setActive] = useState(false);

	const handleDropDown = (e: React.MouseEvent) => {
		e.stopPropagation();
		setActive(!active);
	};

	return (
		<div className={`navigation sticky top-0 z-50 block h-fit bg-neutral-900`}>
			<div className='flex items-center justify-between gap-10 px-4 py-2'>
				<h1 className=''></h1>
				<button onClick={handleDropDown}>Options</button>
			</div>
			<div
				className={`absolute z-50 w-full overflow-hidden rounded-b-lg bg-neutral-900 shadow-xl transition-[height] ${
					active ? 'h-52' : 'h-0'
				}`}
			>
				<Preference />
			</div>
			<div
				onClick={handleDropDown}
				className={`absolute left-0 top-10 transition-all ${
					active ? 'h-[calc(100vh-2.5rem)] w-screen backdrop-blur-[4px]' : 'backdrop-blur-[0px]'
				}`}
			></div>
		</div>
	);
};
