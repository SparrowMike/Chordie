import { useState, useEffect } from 'react'
import { isMobile } from 'react-device-detect';
import { get as getChordData, chordScales } from '@tonaljs/chord';
import { detect as detectChord } from "@tonaljs/chord-detect";
import { majorKey, minorKey } from '@tonaljs/key';

const chromaticSharp = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const enharmonicMap = {
  "E#": "F",
  "B#": "C",
  "Ab": "G#",
  "Bb": "A#",
  "Db": "C#",
  "Eb": "D#",
  "Gb": "F#",
}

const initialNotes = {
  e: { E: { active: false }, F: { active: false }, 'F#': { active: false }, G: { active: false }, 'G#': { active: false }, A: { active: false }, 'A#': { active: false }, B: { active: false }, C: { active: false }, 'C#': { active: false }, D: { active: false }, 'D#': { active: false } },
  B: { B: { active: false }, C: { active: false }, 'C#': { active: false }, D: { active: false }, 'D#': { active: false }, E: { active: false }, F: { active: false }, 'F#': { active: false }, G: { active: false }, 'G#': { active: false }, A: { active: false }, 'A#': { active: false } },
  G: { G: { active: false }, 'G#': { active: false }, A: { active: false }, 'A#': { active: false }, B: { active: false }, C: { active: false }, 'C#': { active: false }, D: { active: false }, 'D#': { active: false }, E: { active: false }, F: { active: false }, 'F#': { active: false } },
  D: { D: { active: false }, 'D#': { active: false }, E: { active: false }, F: { active: false }, 'F#': { active: false }, G: { active: false }, 'G#': { active: false }, A: { active: false }, 'A#': { active: false }, B: { active: false }, C: { active: false }, 'C#': { active: false } },
  A: { A: { active: false }, 'A#': { active: false }, B: { active: false }, C: { active: false }, 'C#': { active: false }, D: { active: false }, 'D#': { active: false }, E: { active: false }, F: { active: false }, 'F#': { active: false }, G: { active: false }, 'G#': { active: false } },
  E: { E: { active: false }, F: { active: false }, 'F#': { active: false }, G: { active: false }, 'G#': { active: false }, A: { active: false }, 'A#': { active: false }, B: { active: false }, C: { active: false }, 'C#': { active: false }, D: { active: false }, 'D#': { active: false } },
};

const chordie = {
  E: null,
  A: null,
  D: null,
  G: null,
  B: null,
  e: null,
}

function App() {
  const [chords, setChords] = useState({})
  const [notes, setNotes] = useState(initialNotes);
  const [moreInfo, setMoreInfo] = useState(false);
  const [showNotes, setShowNotes] = useState(true);

  const handleRadioChange = () => {
    setShowNotes(!showNotes);
  };

  const handleChordUpate = (string, target) => {
    const updatedNotes = { ...notes };
    const currentValue = updatedNotes[string][target].active

    for (const note in updatedNotes[string]) {
      updatedNotes[string][note].active = false;
    }

    updatedNotes[string][target].active = !currentValue;
    chordie[string] = !currentValue ? target : null;

    const detectedChords = detectChord([...Object.values(chordie)]); //? ----  { assumePerfectFifth: true } 
    const chordsObj = {}

    for (let idx in detectedChords) {
      const overChord = detectedChords[idx].indexOf('/');
      const { name, aliases, intervals, notes, quality, type } = overChord <= 0
        ? getChordData(detectedChords[idx])
        : getChordData(detectedChords[idx].slice(0, overChord));

      const intervalsObj = notes.reduce((obj, key, index) => {
        obj[key] = intervals[index];
        return obj;
      }, {});

      chordsObj[idx] = {
        chord: detectedChords[idx],
        name, aliases, intervals, notes, quality, type, intervalsObj
      };
    }


    const filteredChordie = Object.entries(chordie).filter(([, v]) => v !== null);

    console.log(filteredChordie, chordsObj[0])

    const convertDouble = (note, type) => {
      const target = note.replace(type, '');
      return chromaticSharp[(chromaticSharp.indexOf(target) + 2) % chromaticSharp.length];
    }

    for (const val of Object.values(updatedNotes)) {
      for (const _v of Object.values(val)) {
        delete _v.relativeNote;
      }
      if (chordsObj[0]?.notes) {
        for (const relNote of chordsObj[0].notes) {

          if (relNote.includes('##')) {
            val[convertDouble(relNote, '##')].relativeNote = relNote;
          }
          if (relNote.includes('bb')) {
            val[convertDouble(relNote, 'bb')].relativeNote = relNote;
          }

          if (enharmonicMap[relNote]) {
            val[enharmonicMap[relNote]].relativeNote = relNote;
          }
        }
      }
      console.log(updatedNotes)
    }
    setNotes(updatedNotes);
    setChords(chordsObj);
  };

  useEffect(() => {
    // console.log(majorKey(chords[0]))
    // console.log(minorKey(chords[0]))
    // console.log(chords[0]?.chord, chordScales(chords[0]?.chord))
  }, [chords]);

  return (
    <div className="container">
      <div className="guitar">
        <div className="frets">
          {Array(12).fill(0).map((k, i) => (
            <div className="fret" key={i} data-fret={i}>
              <div className="fret-silver"></div>
            </div>
          ))}
        </div>
        <div className="strings">
          {Object.entries(notes).map(([string, v], i) => (
            <div className={`string ${string}`} key={i} data-string={string}>
              {Object.entries(v).map(([note, _v], _i) => (
                <div
                  className={`note ${_v.active ? 'active' : ''} ${isMobile ? 'mobile' : ''}`}
                  key={_i}
                  onClick={() =>
                    handleChordUpate(string, note)}
                  data-note={note}
                >
                  <h4>{showNotes || !Object.values(chords).length
                    ? _v?.relativeNote || note
                    : chords[0]?.intervalsObj[_v?.relativeNote || note]}
                  </h4>
                </div>
              )
              )}
            </div>
          )
          )}
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
        </div>
      </div>
    </div>
  )
}

export default App
