/**
 * Guitar Chord Visualization App
 * This file contains the main App component and related functionalities.
 */

import { useState, useEffect } from 'react'
import { isMobile } from 'react-device-detect';
import { get as getChordData, getChord as getChordDataSymbol, chordScales } from '@tonaljs/chord'; //? ----- tbc { chordScales }
import { detect as detectChord } from "@tonaljs/chord-detect";
// import { majorKey, minorKey } from '@tonaljs/key';
import { get as getScale } from '@tonaljs/scale'; // Or detect as detectScale

import { initialGuitarNotes, initialChordie, initialPreferences } from './utils/defaults';
import { deepCopy } from './utils/utils';
import { enharmonicMap, chromaticSharp } from './utils/constants';

import { GuitarNotes, ChordInfo, Chordie } from './types/interfaces';


function App() {
  const [chordie, setChordie] = useState<Chordie>(deepCopy(initialChordie))
  const [chords, setChords] = useState<{ [key: string]: ChordInfo }>({})
  const [guitarNotes, setGuitarNotes] = useState<{ [key: string]: GuitarNotes }>(deepCopy(initialGuitarNotes));
  const [preferences, setPreferences] = useState(initialPreferences);
  const [scales, setScales] = useState<string[]>();

  const handleActiveChord = (index: number) => {
    setPreferences(prevPreferences => ({
      ...prevPreferences,
      activeChord: index
    }));
  }

  const handleUpdateScale = (scale: string) => {
    //! ------- should rewrite and use `updateChordTones` fn instead to handle similar case base on different object key
    let guitarNotesTemp = deepCopy(guitarNotes);

    const scaleData = getScale(`${chords[preferences.activeChord].tonic} ${scale}`);

    for (const string of Object.values(guitarNotesTemp)) {
      for (const note of Object.values(string)) {
        delete note.chordTone;
      }

      for (const idx in scaleData.notes) {
        const note = scaleData.notes[idx];
        if (string[note]) {
          string[note].chordTone = true;
        } else {
          string[enharmonicMap[note]].chordTone = true;
        }
      }
    }

    guitarNotesTemp = extractRelativeNotes(scaleData.notes, scaleData.intervals, guitarNotesTemp)

    setGuitarNotes(guitarNotesTemp)
  }

  const handleFullReset = () => {
    setChordie(initialChordie);
    setChords({});
    setGuitarNotes(initialGuitarNotes);
    setScales([]);
  }

  const handleShowNotes = () => {
    setPreferences(prevPreferences => ({
      ...prevPreferences,
      showNotes: !prevPreferences.showNotes
    }));
  };

  /**
   * Handles the change of checkbox to show chord tones.
   * @param {boolean} update - Whether to update chord tones.
   */
  const handleShowChordTones = (update?: boolean) => {
    const newShowChordTones = update ? !preferences.showChordTones : preferences.showChordTones;
    setPreferences(prevPreferences => ({
      ...prevPreferences,
      showChordTones: newShowChordTones
    }));

    updateChordTones(guitarNotes, newShowChordTones);
  };

  /**
   * Handles updating the notes state based on chord tones.
   * @param {boolean} show - Whether to show chord tones.
   */
  const updateChordTones = (guitarNotes: { [key: string]: GuitarNotes }, show?: boolean) => {
    const guitarNotesTemp = deepCopy(guitarNotes);

    for (const string of Object.values(guitarNotesTemp)) {
      for (const note of Object.values(string)) {
        delete note.chordTone;
      }
      
      if (show) {
        for (const note of Object.values(chordie)) {
          if (note && !string[note].active) {
            string[note].chordTone = true;
          }
        }
      }
    }

    return guitarNotesTemp;
  }

  /**
   * Extracts and updates relativeNote properties for guitarNotesTemp.
   * @param { [key: string]: ChordInfo } detectedChords - An array of detected chords.
   * @param { [key: string]: GuitarNotes } guitarNotesTemp - The current state of guitarNotesTemp.
   * @returns { [key: string]: GuitarNotes } The updated guitarNotesTemp with relativeNote properties.
   */
  const extractRelativeNotes = (notes: string[], intervals: string[], guitarNotes: { [key: string]: GuitarNotes }) => {
    const guitarNotesTemp = deepCopy(guitarNotes);

    // Convert a note to its equivalent with a different accidental (e.g., C## to D)
    const convertDouble = (note: string, type: string) => {
      const target = note.replace(type, '');
      return chromaticSharp[(chromaticSharp.indexOf(target) + 2) % chromaticSharp.length];
    }

    for (const stringNotes of Object.values(guitarNotesTemp)) {
      // Remove relativeNote properties from guitarNotesTemp 
      for (const note of Object.values(stringNotes)) {
        delete note.relativeNote;
        delete note.interval;
      }

      for (const idx in notes) {
        // Add relativeNote properties based on detected chord's notes
        const relNote = notes[idx];
        const interval = intervals[idx];

        if (enharmonicMap[relNote]) {
          const convertedNote = enharmonicMap[relNote];
          stringNotes[convertedNote].relativeNote = relNote;
          stringNotes[convertedNote].interval = interval;
        } else if (relNote.includes('##')) {
          const convertedNote = convertDouble(relNote, '##');
          stringNotes[convertedNote].relativeNote = relNote;
          stringNotes[convertedNote].interval = interval;
        } else if (relNote.includes('bb')) {
          const convertedNote = convertDouble(relNote, 'bb'); //? ------- confirm compatibility
          stringNotes[convertedNote].relativeNote = relNote;
          stringNotes[convertedNote].interval = interval;
        } else {
          stringNotes[relNote].interval = interval;
        }
      }
    }

    return guitarNotesTemp;
  };

  /**
   * Extracts chord properties from chord data.
   *
   * @param {string} chordData - The chord data string to extract properties from.
   * @param {number} overChord - The index at which the chord is "over" (splitting point).
   * @param {string[]} chromaticSharp - An array of chromatic sharp notes (e.g., ["C", "C#", "D", ...]).
   *
   * @returns {[string, string, string]} - An array containing three strings:
   *   - The extracted alias (between the root and overChord).
   *   - The extracted root note (determined based on the chromaticSharp notes).
   *   - The extracted bass note (after the splitting point).
   */
  const extractChordQuality = (chordData: string): [string, string, string] => {
    const overChord = chordData.indexOf('/');
    const chord = chordData.slice(0, overChord);
    const bassNote = chordData.slice(overChord + 1);

    let root = '';

    for (const note of chromaticSharp) {
      if (chord.includes(note)) {
        root = note;
      }
    }

    const alias = chordData.slice(root.length, overChord);

    return [alias, root, bassNote];
  }

  /**
   * Handles the update of chord selection on the guitar fretboard.
   * @param {string} string - The string on the guitar.
   * @param {string} target - The target note on the string.
   */
  const handleChordUpdate = (string: string, target: string) => {
    let guitarNotesTemp = deepCopy(guitarNotes)

    const chordieTemp = deepCopy(chordie)
    const currentTargetActiveState = guitarNotesTemp[string][target].active;

    if (guitarNotesTemp[string][target].chordTone) return;

    // Reset all the notes on the selected string to be inactive
    for (const note in guitarNotesTemp[string]) {
      guitarNotesTemp[string][note].active = false;
    }

    // Toggle the activity status of the target note
    guitarNotesTemp[string][target].active = !currentTargetActiveState;

    // Update chordie with the selected or deselected chord tone
    chordieTemp[string] = !currentTargetActiveState ? target : null;

    // Filter out null values from chordie and detect chords based on selected chord tones
    const nonNullStringChordie: string[] = Object.values(chordieTemp).filter((v): v is string => v !== null);

    const toneJsDetectChord = detectChord(nonNullStringChordie);
    const detectedChords = toneJsDetectChord.length
      ? toneJsDetectChord
      : detectChord(nonNullStringChordie, { assumePerfectFifth: true });

    // Initialize an object to store detected chord information
    const chordsObj: { [key: string]: ChordInfo } = {}

    // Iterate through detected chords and extract chord information
    for (const idx in detectedChords) {

      const { tonic, empty, name, aliases, intervals, notes, quality, type } = detectedChords[idx].includes('/')
        ? getChordDataSymbol(...extractChordQuality(detectedChords[idx]))
        : getChordData(detectedChords[idx]); //! ------ getChordDataSymbol('madd9', 'F5', 'A#4') ------- some chords just won't work

      const intervalsObj: { [key: string]: string } = notes.reduce((obj, key, index) => {
        obj[key] = intervals[index];
        return obj;
      }, {} as { [key: string]: string });

      // Store the extracted chord information in chordsObj
      chordsObj[idx] = {
        chord: detectedChords[idx],
        tonic, empty, name, aliases, intervals, notes, quality, type, intervalsObj
      };
    }

    if (Object.keys(chords).length) {
      const { notes, intervals } = chordsObj[preferences.activeChord];
      guitarNotesTemp = extractRelativeNotes(notes, intervals, guitarNotesTemp);
    }

    setChordie(chordieTemp);
    setGuitarNotes(guitarNotesTemp);
    setChords(chordsObj);
  };

  useEffect(() => {
    // console.log(majorKey(chords[preferences.activeChord]?.name))
    // console.log(minorKey(chords[preferences.activeChord]?.name))

    if (Object.keys(chords).length) {
      // console.log(detectScale(chords[preferences.activeChord].notes))
      // console.log(chordScales(chords[preferences.activeChord]?.chord))

      setScales(chordScales(chords[preferences.activeChord].chord))
    }


    const chordsLength: number = Object.keys(chords).length;
    setPreferences(prevPreferences => (
      {
        ...prevPreferences,
        activeChord: prevPreferences.activeChord < chordsLength
          ? prevPreferences.activeChord
          : 0
      }
    ));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chords]);

  useEffect(() => {
    if (Object.keys(chords).length) {
      const { notes, intervals } = chords[preferences.activeChord];
      setGuitarNotes(extractRelativeNotes(notes, intervals, guitarNotes));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferences.activeChord]);

  useEffect(() => {
    setGuitarNotes(updateChordTones(guitarNotes, preferences.showChordTones));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chordie, preferences.showChordTones])

  return (
    <div className="container">
      <div className="guitar">
        <div className="frets">
          {Array(12).fill(0).map((_, i) => (
            <div className="fret" key={i} data-fret={i}>
              <div className="fret-silver"></div>
            </div>
          ))}
        </div>
        <div className="strings">
          {Object.entries(guitarNotes).map(([string, v], i) => (
            <div className="string" key={i} data-string={string}>
              {Object.entries(v).map(([note, _v], _i) => {
                const chordNote = preferences.showNotes || !Object.values(chords).length
                  ? _v?.relativeNote || note
                  // : chords[preferences.activeChord]?.intervalsObj[_v?.relativeNote || note] || chords[preferences.activeChord]?.intervalsObj[note]
                  : _v?.interval

                return (
                  <div
                    className={`note ${_v.active || _v.chordTone ? 'active' : ''} ${isMobile ? 'mobile' : ''}`}
                    key={_i}
                    onClick={() =>
                      handleChordUpdate(string, note)}
                    data-note={chordNote}
                  >
                    <h4>{chordNote}</h4>
                  </div>
                )
              }
              )}
            </div>
          ))}
        </div>
      </div>
      <div className='notes'>
        <button onClick={handleFullReset}>Reset Notes</button>
        <div style={{ padding: '10px 0' }}>
          <label>
            <input
              type="checkbox"
              className="checkbox"
              id="chord-information"
              checked={preferences.showMoreChordInfo}
              onChange={() => setPreferences(prevPreferences => ({ ...prevPreferences, showMoreChordInfo: !prevPreferences.showMoreChordInfo }))}
            />
            More chord information
          </label>
        </div>
        {Object.keys(chords).length ? (
          <ul>
            {Object.values(chords).map((chord, i) => (
              <li key={i} onClick={() => handleActiveChord(i)} className={`${preferences.activeChord === i ? 'active' : ''}`}>Detected chord: {chord.chord} {preferences.showMoreChordInfo ? (
                <div style={{ paddingLeft: '25px' }}>
                  {chord.empty ? (
                    <p>No available data</p>
                  ) : (
                    <>
                      <p>Name: {chord.name}</p>
                      <p>Aliases: {chord.aliases.join(' / ')}</p>
                      <p>Intervals: {chord.intervals.join(' / ')}</p>
                      <p>Notes: {chord.notes.join(' / ')}</p>
                    </>
                  )}
                </div>
              ) : ''}
              </li>
            ))}
          </ul>
        ) : (
          <div>No chords available.</div>
        )}
      </div>
      <div className="options">
        <h2>Chord Options</h2>
        <label>
          <input
            type="radio"
            value="notes"
            checked={preferences.showNotes}
            onChange={handleShowNotes}
          />
          Show notes
        </label>
        <label>
          <input
            type="radio"
            disabled={!Object.keys(chords).length || chords[preferences.activeChord].empty}
            value="intervals"
            checked={!preferences.showNotes}
            onChange={handleShowNotes}
          />
          Show Intervals
        </label>
        <label>
          <input
            type="checkbox"
            className="checkbox"
            id="show-chord-tones"
            checked={preferences.showChordTones}
            onChange={() => handleShowChordTones(true)}
          />
          Show chord tones
        </label>
        <label>
          <input
            type="checkbox"
            className="checkbox"
            id="show-scales"
            checked={preferences.showScales}
            onChange={() => setPreferences(prevPreferences => ({
              ...prevPreferences,
              showScales: !prevPreferences.showScales
            }))}
          />
          Show Scales
        </label>
      </div>
      {preferences.showScales &&
        <div className="scales">{scales?.map((scale, idx) => (
          <div onClick={() => handleUpdateScale(scale)} key={idx}>{scale}</div>
        ))}</div>
      }
    </div>
  )
}

export default App;