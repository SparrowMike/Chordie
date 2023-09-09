/**
 * Guitar Chord Visualization App
 * This file contains the main App component and related functionalities.
 */

import { useState, useEffect } from 'react'
import { isMobile } from 'react-device-detect';
import { get as getChordData } from '@tonaljs/chord'; //? ----- tbc { chordScales }
import { detect as detectChord } from "@tonaljs/chord-detect";
// import { majorKey, minorKey } from '@tonaljs/key'; //? ----- tbc

import { enharmonicMap, initialNotes, chordie, chromaticSharp } from './utils/defaults';
import { GuitarNotes, ChordInfo } from './types/interfaces';

function App() {
  //? --- list of detected chords
  const [chords, setChords] = useState<{ [key: string]: ChordInfo }>({}) 
  //? --- all guitar notes and their properties
  const [guitarNotes, setGuitarNotes] = useState<{ [key: string]: GuitarNotes }>(initialNotes); 
  
  //? --- show more chord information
  const [showMoreChordInfo, setShowMoreChordInfo] = useState(false);
  //? --- toggle between interval relation and notes
  const [showNotes, setShowNotes] = useState(true);
  //? --- show all chord tones across the fretboard
  const [showChordTones, setShowChordTones] = useState(false);
  //? --- show all chord tones across the fretboard
  const [activeChord, setActiveChord] = useState<number>(0);

  const handleShowNotes= () => {
    setShowNotes((prevShowNotes) => !prevShowNotes);
  };

  /**
   * Handles the change of checkbox to show chord tones.
   * @param {boolean} update - Whether to update chord tones.
   */
  const handleShowChordTones = (update?: boolean) => {
    if (update) {
      setShowChordTones((prevChordTones) => !prevChordTones); 
      updateChordTones(!showChordTones);
    } else {
      updateChordTones(showChordTones);
    }
  };

  /**
   * Handles updating the notes state based on chord tones.
   * @param {boolean} show - Whether to show chord tones.
   */
  const updateChordTones = (show?: boolean) => {
    for (const string of Object.values(guitarNotes)) {
      for (const note of Object.keys(string)) {
        delete string[note].chordTone;
      }
      if (show) {
        for (const val of Object.values(chordie)) {
          //!============ notes withing chordie should be allowed to be toggled back up ???? 
          if (val && !string[val].active) { 
            string[val].chordTone = true;
          } 
        }
      }
    }
  }

  /**
   * Handles the update of chord selection on the guitar fretboard.
   * @param {string} string - The string on the guitar.
   * @param {string} target - The target note on the string.
   */
  const handleChordUpate = (string: string, target: string) => {
    const updatedNotes = { ...guitarNotes };
    const currentTargetActiveState = updatedNotes[string][target].active;

    if (updatedNotes[string][target].chordTone) return;

    // Reset all the notes on the selected string to be inactive
    for (const note in updatedNotes[string]) {
      updatedNotes[string][note].active = false;
    }

    // Toggle the activity status of the target note
    updatedNotes[string][target].active = !currentTargetActiveState;

    // Update chordie with the selected or deselected chord tone
    chordie[string] = !currentTargetActiveState ? target : null;

    // Filter out null values from chordie and detect chords based on selected chord tones
    const nonNullStringChordie: string[] = Object.values(chordie).filter((v): v is string => v !== null);
    const detectedChords = detectChord(nonNullStringChordie).length
      ? detectChord(nonNullStringChordie)
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

    // Convert a note to its equivalent with a different accidental (e.g., C## to D)
    const convertDouble = (note: string, type: string) => {
      const target = note.replace(type, '');
      return chromaticSharp[(chromaticSharp.indexOf(target) + 2) % chromaticSharp.length];
    }

    for (const val of Object.values(updatedNotes)) {
      // Remove relativeNote properties from updatedNotes
      for (const _v of Object.values(val)) {
        delete _v.relativeNote;
      }

      if (Object.keys(chordsObj).length) {
        for (const chordObj of Object.values(chordsObj)) {
          for (const relNote of chordObj.notes) {

            // Add relativeNote properties based on detected chord's notes
            if (relNote.includes('##')) {
              val[convertDouble(relNote, '##')].relativeNote = relNote;
            }
            if (relNote.includes('bb')) {
              val[convertDouble(relNote, 'bb')].relativeNote = relNote; //! ---- needs more testing
            }

            if (enharmonicMap[relNote]) {
              val[enharmonicMap[relNote]].relativeNote = relNote;
            }
          }
        }
      }
    } 

    updateChordTones(showChordTones);
    setGuitarNotes(updatedNotes);
    setChords(chordsObj);
    // setActiveChord(activeChord < detectedChords.length - 1 ? detectedChords.length : activeChord); //! ------------ fixup to show only available chord
  };

  useEffect(() => {
    // console.log(majorKey(chords[activeChord]?.chord), chords[activeChord]?.chord)
    // console.log(minorKey(chords[activeChord]?.chord))
    // console.log(chords[activeChord]?.chord, chordScales(chords[activeChord]?.chord))
    const chordsLength: number = Object.keys(chords).length;

    setActiveChord((prevActiveChord) =>
      prevActiveChord < chordsLength ? prevActiveChord : 0 //! ----------------------- fix up intervals
    );
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
                const chordNote = showNotes || !Object.values(chords).length
                  ? _v?.relativeNote || note
                  : chords[activeChord]?.intervalsObj[_v?.relativeNote || note] || chords[activeChord]?.intervalsObj[note]
                return (
                  <div
                    className={`note ${_v.active || _v.chordTone ? 'active' : ''} ${isMobile ? 'mobile' : ''}`}
                    key={_i}
                    onClick={() =>
                      handleChordUpate(string, note)}
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
              checked={showMoreChordInfo}
              onChange={() => setShowMoreChordInfo(!showMoreChordInfo)}
            />
            More chord information
          </label>
        </div>
        {Object.keys(chords).length ? (
          <ul>
            {Object.values(chords).map((v, i) => (
              <li key={i} onClick={() => setActiveChord(i)} className={`${activeChord === i ? 'active' : ''}`}>Detected chord: {v.chord} {showMoreChordInfo ? (
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
              checked={showNotes}
              onChange={handleShowNotes}
            />
            Show notes
          </label>
          <label>
            <input
              type="radio"
              disabled={!Object.keys(chords).length}
              value="intervals"
              checked={!showNotes}
              onChange={handleShowNotes}
            />
            Show Intervals
          </label>
          <label>
            <input
              type="checkbox"
              className="checkbox"
              id="myCheckbox"
              checked={showChordTones}
              onChange={() => handleShowChordTones(true)}
            />
            Show chord tones
          </label>
        </div>
      </div>
    </div>
  )
}

export default App