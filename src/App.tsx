/**
 * Guitar Chord Visualization App
 * This file contains the main App component and related functionalities.
 */

import { useState, useEffect } from 'react'
import { isMobile } from 'react-device-detect';
import { get as getChordData, getChord as getChordDataSymbol } from '@tonaljs/chord'; //? ----- tbc { chordScales }
import { detect as detectChord } from "@tonaljs/chord-detect";
// import { majorKey, minorKey } from '@tonaljs/key';

import { initialGuitarNotes, initialChordie, initialChordPreferences } from './utils/defaults';
import { deepCopy } from './utils/utils';
import { enharmonicMap, chromaticSharp } from './utils/constants';

import { GuitarNotes, ChordInfo, Chordie } from './types/interfaces';


function App() {
  const [chordie, setChordie] = useState<Chordie>(deepCopy(initialChordie))
  const [chords, setChords] = useState<{ [key: string]: ChordInfo }>({})
  const [guitarNotes, setGuitarNotes] = useState<{ [key: string]: GuitarNotes }>(deepCopy(initialGuitarNotes));
  const [chordPreferences, setChordPreferences] = useState(initialChordPreferences);


  const handleActiveChord = (index: number) => {
    setChordPreferences(prevPreferences => ({
      ...prevPreferences,
      activeChord: index
    }));
  }

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
  const updateChordTones = (guitarNotes: { [key: string]: GuitarNotes }, show?: boolean) => {
    const guitarNotesTemp = deepCopy(guitarNotes);

    for (const string of Object.values(guitarNotesTemp)) {
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

    return guitarNotesTemp;
  }

  /**
   * Extracts and updates relativeNote properties for guitarNotesTemp.
   * @param { [key: string]: ChordInfo } detectedChords - An array of detected chords.
   * @param { [key: string]: GuitarNotes } guitarNotesTemp - The current state of guitarNotesTemp.
   * @returns { [key: string]: GuitarNotes } The updated guitarNotesTemp with relativeNote properties.
   */
  const extractRelativeNotes = (detectedChords: { [key: string]: ChordInfo }, guitarNotes: { [key: string]: GuitarNotes }) => {
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
      }

      if (Object.keys(detectedChords).length) {
        for (const relNote of detectedChords[chordPreferences.activeChord].notes) {

          // Add relativeNote properties based on detected chord's notes
          if (relNote.includes('##')) {
            stringNotes[convertDouble(relNote, '##')].relativeNote = relNote;
          }
          if (relNote.includes('bb')) {
            stringNotes[convertDouble(relNote, 'bb')].relativeNote = relNote;
          }
          if (enharmonicMap[relNote]) {
            stringNotes[enharmonicMap[relNote]].relativeNote = relNote;
          }
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
      const { empty, name, aliases, intervals, notes, quality, type } = detectedChords[idx].includes('/')
        ? getChordDataSymbol(...extractChordQuality(detectedChords[idx]))
        : getChordData(detectedChords[idx]);

      const intervalsObj: { [key: string]: string } = notes.reduce((obj, key, index) => {
        obj[key] = intervals[index];
        return obj;
      }, {} as { [key: string]: string });

      // Store the extracted chord information in chordsObj
      chordsObj[idx] = {
        chord: detectedChords[idx],
        empty, name, aliases, intervals, notes, quality, type, intervalsObj
      };
    }

    guitarNotesTemp = extractRelativeNotes(chordsObj, guitarNotesTemp);

    setChordie(chordieTemp);
    setGuitarNotes(guitarNotesTemp);
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

  useEffect(() => {
    setGuitarNotes(extractRelativeNotes(chords, guitarNotes));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chordPreferences.activeChord]);

  useEffect(() => {
    setGuitarNotes(updateChordTones(guitarNotes, chordPreferences.showChordTones));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chordie, chordPreferences.showChordTones])

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
              id="chord-information"
              checked={chordPreferences.showMoreChordInfo}
              onChange={() => setChordPreferences(prevPreferences => ({ ...prevPreferences, showMoreChordInfo: !prevPreferences.showMoreChordInfo }))}
            />
            More chord information
          </label>
        </div>
        {Object.keys(chords).length ? (
          <ul>
            {Object.values(chords).map((chord, i) => (
              <li key={i} onClick={() => handleActiveChord(i)} className={`${chordPreferences.activeChord === i ? 'active' : ''}`}>Detected chord: {chord.chord} {chordPreferences.showMoreChordInfo ? (
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
              disabled={!Object.keys(chords).length || chords[chordPreferences.activeChord].empty}
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
              id="show-chord-tones"
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