
export interface ChordInfo {
  tonic: string | null;
  empty: boolean;
  chord: string;
  name: string;
  aliases: string[];
  intervals: string[];
  notes: string[];
  quality: string;
  type: string;
  intervalsObj: { [key: string]: string };
}

export interface GuitarNotes {
  [key: string]: {
    active: boolean,
    octave: string,
    interval?: string,
    chordTone?: boolean,
    relativeNote?: string,
  }
}

export interface Chordie { [key: string]: string | null }