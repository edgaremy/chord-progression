import { stringedInstruments } from "./Strings";
import { piano } from "./Piano";

/**
 * Defines the Instrument interface representing a musical instrument with a name and an image.
 */
export interface Instrument {
  name: string;
  image: string; // URL or path to instrument image
}

/**
 * Represents an instance of an instrument, which can be used in the application to manage the current instrument state.
 */
export interface InstrumentInstance<T extends Instrument> {
  instrument: T;
  // Additional properties for specific instrument instances can be added here
}

// Reference to all available instruments for easy access and validation
export const allInstruments: Instrument[] = [
  piano,
  ...stringedInstruments,
];
