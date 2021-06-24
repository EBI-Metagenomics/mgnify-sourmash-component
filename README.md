# `mgnify-sourmash-component`

A web component that let you select FastA or FastQ sequence files and creates sketches (KmerMinHash signatures) using [Sourmash](https://sourmash.readthedocs.io/).

## Usage

```html
<mgnify-sourmash-component ksize="31" scaled="1000" />
```

## API reference

### Attributes

#### General Options

##### `directory: boolean = false`

Sets the File chooser to select directories instead of files.

##### `show_directory_checkbox: boolean = false`

Displays or not a checkbox to select the mode(`directory`) of the file chooser

##### `show_signatures: boolean = false`

Displays or not the signatures once they are calculated.

#### KmerMinHash Options

##### `num: number = 0`

Create a standard MinHash with no more than `<num>` k-mers kept. This will produce sketches identical to mash sketches. `num` is incompatible with scaled.

##### `ksize: number = 31`

Create a sketch at this k-mer size; can provide more than one time in a parameter string. Typically `ksize` is between 4 and 100.

##### `is_protein: boolean = false`

Creates a `protein` kind of sketch.

##### `dayhoff: boolean = false`

Creates a `dayhoff` kind of sketch.

##### `hp: boolean = false`

Creates a `hp` kind of sketch.

##### `seed: number = 42`

Murmurhash seed

##### `scaled: number = 1000`

Create a scaled MinHash with k-mers sampled deterministically at 1 per `<scaled>` value.

##### `track_abundance: boolean = false`

Create abundance-weighted (or not) sketches.

### Properties

### Methods

### Events
