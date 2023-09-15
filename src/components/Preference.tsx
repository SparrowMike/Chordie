import { updateChordTones } from '../utils/utils';
import { useAtom } from 'jotai';
import { chordieAtom, chordsAtom, guitarNotesAtom, preferencesAtom } from './../controller/atoms';

import { ToggleOptionProps } from '../types/interfaces';

const ToggleOption: React.FC<ToggleOptionProps> = ({ checked, onChange, label, type = 'checkbox', ...props }) => (
  <label>
    <input type={type} checked={checked} onChange={onChange} {...props} />
    {label}
  </label>
);

export const Preference = () => {
  const [preferences, setPreferences] = useAtom(preferencesAtom);
  const [chords] = useAtom(chordsAtom);
  const [chordie] = useAtom(chordieAtom);
  const [guitarNotes] = useAtom(guitarNotesAtom);

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleShowChordTones = () => {
    handleToggle('showChordTones');
    updateChordTones(chordie, guitarNotes, !preferences.showChordTones);
  };

  const handleShowNotes = () => handleToggle('showNotes');

  return (
    <div className="options">
      <h2>Chord Options</h2>
      <ToggleOption 
        checked={preferences.showNotes} 
        onChange={handleShowNotes} 
        label="Show notes" 
        type="radio"
      />
      <ToggleOption
        disabled={!Object.keys(chords).length || chords[preferences.activeChord].empty}
        checked={!preferences.showNotes}
        onChange={handleShowNotes}
        label="Show Intervals"
        type="radio"
      />
      <ToggleOption
        id="show-chord-tones"
        checked={preferences.showChordTones}
        onChange={handleShowChordTones}
        label="Show chord tones"
      />
      <ToggleOption
        id="show-scales"
        checked={preferences.showScales}
        onChange={() => handleToggle('showScales')}
        label="Show Scales"
      />
    </div>
  )
}
