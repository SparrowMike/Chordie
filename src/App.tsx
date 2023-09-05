/**
 * Guitar Chord Visualization App
 * This file contains the main App component and related functionalities.
 */

import { useState, useEffect } from 'react'
import { isMobile } from 'react-device-detect';
import { get as getChordData } from '@tonaljs/chord'; //? ----- tbc { chordScales }
import { detect as detectChord } from "@tonaljs/chord-detect";
// import { majorKey, minorKey } from '@tonaljs/key'; //? ----- tbc

/**
 * An array representing the chromatic scale with sharp notation.
 */
const chromaticSharp = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * A mapping of enharmonic equivalents.
 */
const enharmonicMap: { [key: string]: string } = {
  "E#": "F",
  "B#": "C",
  "Ab": "G#",
  "Bb": "A#",
  "Db": "C#",
  "Eb": "D#",
  "Gb": "F#",
}

/**
 * Initial state of guitar notes with active status.
 */
const initialNotes = {
  e: { E: { active: false }, F: { active: false }, 'F#': { active: false }, G: { active: false }, 'G#': { active: false }, A: { active: false }, 'A#': { active: false }, B: { active: false }, C: { active: false }, 'C#': { active: false }, D: { active: false }, 'D#': { active: false } },
  B: { B: { active: false }, C: { active: false }, 'C#': { active: false }, D: { active: false }, 'D#': { active: false }, E: { active: false }, F: { active: false }, 'F#': { active: false }, G: { active: false }, 'G#': { active: false }, A: { active: false }, 'A#': { active: false } },
  G: { G: { active: false }, 'G#': { active: false }, A: { active: false }, 'A#': { active: false }, B: { active: false }, C: { active: false }, 'C#': { active: false }, D: { active: false }, 'D#': { active: false }, E: { active: false }, F: { active: false }, 'F#': { active: false } },
  D: { D: { active: false }, 'D#': { active: false }, E: { active: false }, F: { active: false }, 'F#': { active: false }, G: { active: false }, 'G#': { active: false }, A: { active: false }, 'A#': { active: false }, B: { active: false }, C: { active: false }, 'C#': { active: false } },
  A: { A: { active: false }, 'A#': { active: false }, B: { active: false }, C: { active: false }, 'C#': { active: false }, D: { active: false }, 'D#': { active: false }, E: { active: false }, F: { active: false }, 'F#': { active: false }, G: { active: false }, 'G#': { active: false } },
  E: { E: { active: false }, F: { active: false }, 'F#': { active: false }, G: { active: false }, 'G#': { active: false }, A: { active: false }, 'A#': { active: false }, B: { active: false }, C: { active: false }, 'C#': { active: false }, D: { active: false }, 'D#': { active: false } },
};

/**
 * A mapping of selected chord tones for each string.
 */
const chordie: { [key: string]: string | null } = {
  E: null,
  A: null,
  D: null,
  G: null,
  B: null,
  e: null,
}

interface ChordInfo {
  chord: string;
  name: string;
  aliases: string[];
  intervals: string[];
  notes: string[];
  quality: string;
  type: string;
  intervalsObj: { [key: string]: string };
}

interface Notes {
  [key: string]: {
    active: boolean,
    chordTone?: boolean,
    relativeNote?: string
  }
}

function App() {
  const [chords, setChords] = useState<{ [key: string]: ChordInfo }>({})
  const [notes, setNotes] = useState<{ [key: string]: Notes }>(initialNotes);
  const [moreInfo, setMoreInfo] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
  const [chordTones, setChordTones] = useState(false);

  const handleRadioChange = () => {
    setShowNotes((prevShowNotes) => !prevShowNotes);
  };

  /**
   * Handles the change of checkbox to show chord tones.
   * @param {boolean} update - Whether to update chord tones.
   */
  const handleShowNotes = (update?: boolean) => {
    if (update) {
      setChordTones((prevChordTones) => !prevChordTones); 
      showChordTones(!chordTones);
    } else {
      showChordTones(chordTones);
    }
  };

  /**
   * Handles updating the notes state based on chord tones.
   * @param {boolean} show - Whether to show chord tones.
   */
  const showChordTones = (show?: boolean) => {
    for (const string of Object.values(notes)) {
      for (const note of Object.keys(string)) {
        for (const val of Object.values(chordie)) {
          if (val && show) {
            string[val].chordTone = true;
          } else {
            delete string[note].chordTone;
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
    const updatedNotes = { ...notes };
    const currentTargetState = updatedNotes[string][target].active

    // Reset all notes on the selected string to be inactive
    for (const note in updatedNotes[string]) {
      updatedNotes[string][note].active = false;
    }

    // if (updatedNotes[string][target].chordTone) {} //? ----- whats the expected behaviour ???

    // Toggle the activity status of the target note
    updatedNotes[string][target].active = !currentTargetState;

    // Update chordie with the selected or deselected chord tone
    chordie[string] = !currentTargetState ? target : null;

    // Filter out null values from chordie and detect chords based on selected chord tones
    const nonNullStringChordie: string[] = Object.values(chordie).filter((v): v is string => v !== null);
    const detectedChords = detectChord(nonNullStringChordie).length
      ? detectChord(nonNullStringChordie)
      : detectChord(nonNullStringChordie, { assumePerfectFifth: true }) //!----- my experimental

    // Initialize an object to store detected chord information
    const chordsObj: { [key: string]: ChordInfo } = {}

    // Iterate through detected chords and extract chord information
    for (const idx in detectedChords) {
      const overChord = detectedChords[idx].indexOf('/'); //!----- needs rewrite for better chord info accuracy
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

      if (chordsObj[0]?.notes) {
        for (const relNote of chordsObj[0].notes) {
          
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

    // Update the display of chord tones, notes, and chord information
    showChordTones(chordTones);
    setNotes(updatedNotes);
    setChords(chordsObj);
  };

  useEffect(() => {
    // console.log(majorKey(chords[0]?.chord), chords[0]?.chord)
    // console.log(minorKey(chords[0]?.chord))
    // console.log(chords[0]?.chord, chordScales(chords[0]?.chord))
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
          {Object.entries(notes).map(([string, v], i) => (
            <div className="string" key={i} data-string={string}>
              {Object.entries(v).map(([note, _v], _i) => {
                const chordNote = showNotes || !Object.values(chords).length
                  ? _v?.relativeNote || note
                  : chords[0]?.intervalsObj[_v?.relativeNote || note]

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
              checked={moreInfo}
              onChange={() => setMoreInfo(!moreInfo)}
            />
            More chord information
          </label>
        </div>
        {Object.keys(chords).length ? (
          <ul>
            {Object.values(chords).map((v, i) => (
              <li key={i}>Detected chord: {v.chord} {moreInfo ? (
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
              onChange={handleRadioChange}
            />
            Show notes
          </label>
          <label>
            <input
              type="radio"
              disabled={!Object.keys(chords).length}
              value="intervals"
              checked={!showNotes}
              onChange={handleRadioChange}
            />
            Show Intervals
          </label>
          <label>
            <input
              type="checkbox"
              className="checkbox"
              id="myCheckbox"
              checked={chordTones}
              onChange={() => handleShowNotes(true)}
            />
            Show chord tones
          </label>
        </div>
      </div>
    </div>
  )
}

export default App
