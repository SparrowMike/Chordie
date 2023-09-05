import { useState, useEffect } from 'react'
import { isMobile } from 'react-device-detect';
import { get as getChordData, chordScales } from '@tonaljs/chord';
import { detect as detectChord } from "@tonaljs/chord-detect";
import { majorKey, minorKey } from '@tonaljs/key';

const chromaticSharp = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const enharmonicMap: { [key: string]: string } = {
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


function App() {
  const [chords, setChords] = useState<{ [key: string]: ChordInfo }>({})
  const [notes, setNotes] = useState<{ [key: string]: { [key: string]: { active: boolean, relativeNote?: string } } }>(initialNotes);
  const [moreInfo, setMoreInfo] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
  // const [chordTones, setChordTones] = useState(false);

  const handleRadioChange = () => {
    setShowNotes(!showNotes);
  };

  // const handleShowNotes = () => {

  //   setChordTones(!chordTones);
  // }

  const handleChordUpate = (string: string, target: string) => {
    const updatedNotes = { ...notes };
    const currentValue = updatedNotes[string][target].active

    for (const note in updatedNotes[string]) {
      updatedNotes[string][note].active = false;
    }

    updatedNotes[string][target].active = !currentValue;
    chordie[string] = !currentValue ? target : null;

    const nonNullStringChordie: string[] = Object.values(chordie).filter((v): v is string => v !== null);

    
    const detectedChords = detectChord(nonNullStringChordie).length 
      ? detectChord(nonNullStringChordie)
      : detectChord(nonNullStringChordie, { assumePerfectFifth: true })

    console.log(detectChord(nonNullStringChordie), detectChord(nonNullStringChordie, { assumePerfectFifth: true }))
    const chordsObj: { [key: string]: ChordInfo } = {}

    for (const idx in detectedChords) {
      const overChord = detectedChords[idx].indexOf('/');
      const { name, aliases, intervals, notes, quality, type } = overChord <= 0
        ? getChordData(detectedChords[idx])
        : getChordData(detectedChords[idx].slice(0, overChord));

      const intervalsObj: { [key: string]: string } = notes.reduce((obj, key, index) => {
        obj[key] = intervals[index];
        return obj;
      }, {} as { [key: string]: string });

      chordsObj[idx] = {
        chord: detectedChords[idx],
        name, aliases, intervals, notes, quality, type, intervalsObj
      };
    }

    const convertDouble = (note: string, type: string) => {
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
    }
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
                    className={`note ${_v.active ? 'active' : ''} ${isMobile ? 'mobile' : ''}`}
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
          {/* <label>
            <input
              type="checkbox"
              className="checkbox"
              id="myCheckbox"
              checked={chordTones}
              onChange={handleShowNotes}
            />
            Show chord tones
          </label> */}
        </div>
      </div>
    </div>
  )
}

export default App
