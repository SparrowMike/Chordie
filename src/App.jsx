import { useState } from 'react'
import { detect } from "@tonaljs/chord-detect";

const enharmonicMap = {
  "C#": "Db",
  "D#": "Eb",
  "F#": "Gb",
  "G#": "Ab",
  "A#": "Bb",
}

const initialNotes = {
  e: { E: false, F: false, 'F#': false, G: false, 'G#': false, A: false, 'A#': false, B: false, C: false, 'C#': false, D: false, 'D#': false },
  B: { B: false, C: false, 'C#': false, D: false, 'D#': false, E: false, F: false, 'F#': false, G: false, 'G#': false, A: false, 'A#': false },
  G: { G: false, 'G#': false, A: false, 'A#': false, B: false, C: false, 'C#': false, D: false, 'D#': false, E: false, F: false, 'F#': false },
  D: { D: false, 'D#': false, E: false, F: false, 'F#': false, G: false, 'G#': false, A: false, 'A#': false, B: false, C: false, 'C#': false },
  A: { A: false, 'A#': false, B: false, C: false, 'C#': false, D: false, 'D#': false, E: false, F: false, 'F#': false, G: false, 'G#': false },
  E: { E: false, F: false, 'F#': false, G: false, 'G#': false, A: false, 'A#': false, B: false, C: false, 'C#': false, D: false, 'D#': false },
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
  const [chords, setChords] = useState({sharp: [], flat: []})
  const [notes, setNotes] = useState(initialNotes);
  const [isSharp, setIsSharp] = useState(false);

  const handleCheckboxChange = () => {
    setIsSharp(!isSharp);
  };

  const handleClick = (string, target) => {
    const updatedNotes = { ...notes };
    const currentValue = updatedNotes[string][target]

    for (const note in updatedNotes[string]) {
      updatedNotes[string][note] = false;
    }

    updatedNotes[string][target] = !currentValue;
    chordie[string] = !currentValue ? target : null;

    setNotes(updatedNotes);

    setChords({sharp: detect([...Object.values(chordie)], { assumePerfectFifth: true })});

    const flatChordie = {...chordie};
    for (let [k, v] of Object.entries(chordie)) {
      if (enharmonicMap[v]) {
        flatChordie[k] = enharmonicMap[v];
      }
    }

    setChords(prevState => ({
      ...prevState,
      flat: detect([...Object.values(flatChordie)], { assumePerfectFifth: true })
    }))
  };

  return (
    <div className="container">
      <div className="guitar">
        <div className="frets">
          {Array(12).fill(0).map((k, i) => (
            <div className="fret" key={i} data-fret={i}></div>
          ))}
        </div>
        {Object.entries(notes).map(([string, v], i) => (
          <div className={`string ${string}`} key={i} data-string={string}>
            {Object.entries(v).map(([note, _v], _i) => (
              <div
                className={`note ${_v ? 'active' : ''}`}
                key={_i}
                onClick={() =>
                  handleClick(string, note)}
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
      <div className='notes' style={{ display: 'flex', gap: 50 }}>
        {chords.sharp.length > 0 ? (
          <ul>
            {chords.sharp.map((k, i) => (
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
