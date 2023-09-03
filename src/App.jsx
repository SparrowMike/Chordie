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
  const [chords, setChords] = useState([])
  const [notes, setNotes] = useState(initialNotes);
  const [isSharp, setIsSharp] = useState(false);

  const handleCheckboxChange = () => {
    setIsSharp(!isSharp);
  };

  const triggerIntervals = () => {
    console.log('trigger')
  }

  const handleChordUpate = (string, target) => {
    const updatedNotes = { ...notes };
    const currentValue = updatedNotes[string][target].active

    for (const note in updatedNotes[string]) {
      updatedNotes[string][note].active = false;
    }

    updatedNotes[string][target].active = !currentValue;
    chordie[string] = !currentValue ? target : null;

    setNotes(updatedNotes);

    setChords(detectChord([...Object.values(chordie)]));
    // setChords(detectChord([...Object.values(chordie)], { assumePerfectFifth: true }));
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
                  <h4>{note}</h4>
                </div>
              )
              )}
            </div>
          )
          )}
        </div>
      </div>
      <div className='notes' style={{ display: 'flex', gap: 50 }}>
        {chords.length > 0 ? (
          <ul>
            {chords.map((k, i) => (
              <li key={i}>{k}</li>
            ))}
          </ul>
        ) : (
          <div>No chords available.</div>
        )}
        {/* <ul>
          Flats
          {chords.flat.map((k, i) => (
            <li key={i}>{k}</li>
          ))}
        </ul> */}
      </div>
      {/* <div className="checkbox-container" style={{padding: '50px;'}}>
        <input
          type="checkbox"
          className="checkbox"
          id="myCheckbox"
          checked={isSharp}
          onChange={handleCheckboxChange}
        />
        <label htmlFor="myCheckbox">Use Flats</label>
      </div> */}
    </div>
  )
}

export default App
