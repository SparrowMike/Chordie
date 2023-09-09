
export interface ChordInfo {
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
    chordTone?: boolean,
    relativeNote?: string
  }
}
