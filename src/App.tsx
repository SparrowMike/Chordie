/**
 * Guitar Chord Visualization App
 * This file contains the main App component and related functionalities.
 */

import { useState, useEffect } from 'react'
import { isMobile } from 'react-device-detect';
import { get as getChordData } from '@tonaljs/chord'; //? ----- tbc { chordScales }
import { detect as detectChord } from "@tonaljs/chord-detect";
// import { majorKey, minorKey } from '@tonaljs/key';

import { initialGuitarNotes, initialChordie, initialChordPreferences } from './utils/defaults';
import { deepCopy } from './utils/utils';
import {enharmonicMap, chromaticSharp} from './utils/constants';

import { GuitarNotes, ChordInfo, Chordie } from './types/interfaces';


function App() {
  const [chordie, setChordie] = useState<Chordie>(deepCopy(initialChordie))
  const [chords, setChords] = useState<{ [key: string]: ChordInfo }>({})
  const [guitarNotes, setGuitarNotes] = useState<{ [key: string]: GuitarNotes }>(deepCopy(initialGuitarNotes));
  const [chordPreferences, setChordPreferences] = useState(initialChordPreferences);

  const handleFullReset = () => {
    setChordie(initialChordie);
    setChords({});
    setGuitarNotes(initialGuitarNotes);
  }

  const handleShowNotes = () => {
    setChordPreferences(prevPreferences => ({
      ...prevPreferences,
      showNotes: !prevPreferences.showNotes 
    }));
  };

  /**
   * Handles the change of checkbox to show chord tones.
   * @param {boolean} update - Whether to update chord tones.
   */
  const handleShowChordTones = (update?: boolean) => {
    const newShowChordTones = update ? !chordPreferences.showChordTones : chordPreferences.showChordTones;
    setChordPreferences(prevPreferences => ({
      ...prevPreferences,
      showChordTones: newShowChordTones
    }));

    updateChordTones(guitarNotes, newShowChordTones);
  };

  /**
   * Handles updating the notes state based on chord tones.
   * @param {boolean} show - Whether to show chord tones.
   */
  const updateChordTones = (notes: { [key: string]: GuitarNotes }, show?: boolean) => {
    for (const string of Object.values(notes)) {
      for (const note of Object.keys(string)) {
        delete string[note].chordTone;
      }
      if (show) {
        for (const note of Object.values(chordie)) {
          if (note && !string[note].active) {
            string[note].chordTone = true;
          }
        }
      }
    }

    return notes;
  }

  /**
   * Handles the update of chord selection on the guitar fretboard.
   * @param {string} string - The string on the guitar.
   * @param {string} target - The target note on the string.
   */
  const handleChordUpdate = (string: string, target: string) => {
    const chordieTemp = deepCopy(chordie)
    const guitarNotesTemp = deepCopy(guitarNotes)
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
      const overChord = detectedChords[idx].indexOf('/'); //!----- needs rewrite for better chord info accuracy with chords over bass
      const { name, aliases, intervals, notes, quality, type } = overChord <= 0
        ? getChordData(detectedChords[idx])
        : getChordData(detectedChords[idx].slice(0, overChord));

      const intervalsObj: { [key: string]: string } = notes.reduce((obj, key, index) => {
        obj[key] = intervals[index];
        return obj;
      }, {} as { [key: string]: string });

      // Store the extracted chord information in chordsObj
      chordsObj[idx] = {
        chord: detectedChords[idx],
        name, aliases, intervals, notes, quality, type, intervalsObj
      };
    }

    // Convert a note to its equivalent with a different accidental (e.g., C## to D
    const convertDouble = (note: string, type: string) => {
      const target = note.replace(type, '');
      return chromaticSharp[(chromaticSharp.indexOf(target) + 2) % chromaticSharp.length];
    }

    for (const stringNotes of Object.values(guitarNotesTemp)) {
      // Remove relativeNote properties fromguitarNotesTemp 
      for (const note of Object.values(stringNotes)) {
        delete note.relativeNote;
      }

      if (Object.keys(chordsObj).length) {
        for (const chordObj of Object.values(chordsObj)) {
          for (const relNote of chordObj.notes) {

            // Add relativeNote properties based on detected chord's notes
            if (relNote.includes('##')) {
              stringNotes[convertDouble(relNote, '##')].relativeNote = relNote;
            }
            if (relNote.includes('bb')) {
              stringNotes[convertDouble(relNote, 'bb')].relativeNote = relNote; //! ---- needs more tests with bb chords
            }

            if (enharmonicMap[relNote]) {
              stringNotes[enharmonicMap[relNote]].relativeNote = relNote;
            }
          }
        }
      }
    }

    const guitarNotesTempUpdated = updateChordTones(guitarNotesTemp, chordPreferences.showChordTones);

    setChordie(chordieTemp);
    setGuitarNotes(guitarNotesTempUpdated);
    setChords(chordsObj);
  };

  useEffect(() => {
    // console.log(majorKey(chords[activeChord]?.chord), chords[activeChord]?.chord)
    // console.log(minorKey(chords[activeChord]?.chord))
    // console.log(chords[activeChord]?.chord, chordScales(chords[activeChord]?.chord))
    const chordsLength: number = Object.keys(chords).length;

    setChordPreferences(prevPreferences => (
      {
        ...prevPreferences,
        activeChord: prevPreferences.activeChord < chordsLength
          ? prevPreferences.activeChord
          : 0
      }
    ));
  }, [chords]);

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
                const chordNote = chordPreferences.showNotes || !Object.values(chords).length
                  ? _v?.relativeNote || note
                  : chords[chordPreferences.activeChord]?.intervalsObj[_v?.relativeNote || note] || chords[chordPreferences.activeChord]?.intervalsObj[note]
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
        <div style={{ padding: '10px 0' }}>
          <label>
            <input
              type="checkbox"
              className="checkbox"
              id="myCheckbox"
              checked={chordPreferences.showMoreChordInfo}
              onChange={() => setChordPreferences(prevPreferences => ({ ...prevPreferences, showMoreChordInfo: !prevPreferences.showMoreChordInfo }))}
            />
            More chord information
          </label>
        </div>
        {Object.keys(chords).length ? (
          <ul>
            {Object.values(chords).map((v, i) => (
              <li key={i} onClick={() => setChordPreferences(prevPreferences => ({ ...prevPreferences, activeChord: i }))} className={`${chordPreferences.activeChord === i ? 'active' : ''}`}>Detected chord: {v.chord} {chordPreferences.showMoreChordInfo ? (
                <div style={{ paddingLeft: '25px' }}>
                  <p>Name: {v.name}</p>
                  <p>Aliases: {v.aliases.join(' / ')}</p>
                  <p>Intervals: {v.intervals.join(' / ')}</p>
                  <p>Notes: {v.notes.join(' / ')}</p>
                </div>
              ) : ''}
              </li>
            ))}
          </ul>
        ) : (
          <div>No chords available.</div>
        )}
      </div>
      <div style={{ padding: '25px' }}>
        <div className="options">
          <h2>Chord Options</h2>
          <label>
            <input
              type="radio"
              value="notes"
              checked={chordPreferences.showNotes}
              onChange={handleShowNotes}
            />
            Show notes
          </label>
          <label>
            <input
              type="radio"
              disabled={!Object.keys(chords).length}
              value="intervals"
              checked={!chordPreferences.showNotes}
              onChange={handleShowNotes}
            />
            Show Intervals
          </label>
          <label>
            <input
              type="checkbox"
              className="checkbox"
              id="myCheckbox"
              checked={chordPreferences.showChordTones}
              onChange={() => handleShowChordTones(true)}
            />
            Show chord tones
          </label>
        </div>
        <button onClick={handleFullReset}>Reset Notes</button>
      </div>
    </div>
  )
}

export default App;