import { useState, useEffect } from 'react'
import { isMobile } from 'react-device-detect';
import { get as getChordData } from '@tonaljs/chord';
import { detect as detectChord } from "@tonaljs/chord-detect";

const enharmonicMap = {
  "C#": "Db",
  "D#": "Eb",
  "F#": "Gb",
  "G#": "Ab",
  "A#": "Bb",
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

    setNotes(updatedNotes);

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

    setChords(chordsObj);
  };

  useEffect(() => {
    if (chords.length) {
      const idx = chords[0].indexOf('/');
      if (idx < 0) {
        console.log(getChordData(chords[0]))
      } else {
        // console.log(chords[0].slice(0, idx), chords[0].slice(idx + 1))
        console.log(getChordData(chords[0].slice(0, idx)))
      }
    }
  }, [chords])

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
                    ? note
                    : (chords[0]?.intervalsObj[note] || chords[0]?.intervalsObj[enharmonicMap[note]])}
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
