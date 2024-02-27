/* tslint:disable */
/* eslint-disable */
/**
*/
export class ComputeParameters {
  free(): void;
/**
*/
  constructor();
/**
* @param {Uint32Array} ksizes
*/
  set_ksizes(ksizes: Uint32Array): void;
/**
* @param {number} scaled
*/
  set_scaled(scaled: number): void;
/**
* @param {number} num
*/
  set_num(num: number): void;
/**
* @param {boolean} is_protein
*/
  set_protein(is_protein: boolean): void;
/**
* @param {boolean} dayhoff
*/
  set_dayhoff(dayhoff: boolean): void;
/**
* @param {boolean} hp
*/
  set_hp(hp: boolean): void;
/**
* @param {boolean} track
*/
  set_track_abundance(track: boolean): void;
/**
* @param {number} seed
*/
  set_seed(seed: number): void;
}
/**
*/
export class KmerMinHash {
  free(): void;
/**
* @param {number} num
* @param {number} ksize
* @param {boolean} is_protein
* @param {boolean} dayhoff
* @param {boolean} hp
* @param {number} seed
* @param {number} scaled
* @param {boolean} track_abundance
*/
  constructor(num: number, ksize: number, is_protein: boolean, dayhoff: boolean, hp: boolean, seed: number, scaled: number, track_abundance: boolean);
/**
* @param {string} buf
*/
  add_sequence_js(buf: string): void;
/**
* @returns {string}
*/
  to_json(): string;
}
/**
*/
export class Signature {
  free(): void;
/**
* @param {ComputeParameters} params
*/
  constructor(params: ComputeParameters);
/**
* @param {string} buf
*/
  add_sequence_js(buf: string): void;
/**
* @param {File} fp
* @param {Function | undefined} [callback]
*/
  add_from_file(fp: File, callback?: Function): void;
/**
* @returns {string}
*/
  to_json(): string;
/**
* @returns {number}
*/
  size(): number;
}
