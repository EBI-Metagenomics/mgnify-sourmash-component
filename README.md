# `mgnify-sourmash-component`

[![Test and Publish the Demo](https://github.com/EBI-Metagenomics/mgnify-sourmash-component/actions/workflows/test-and-publish-demo.yml/badge.svg)](https://github.com/EBI-Metagenomics/mgnify-sourmash-component/actions/workflows/test-and-publish-demo.yml)

A web component that let you select FastA sequence files and creates sketches (KmerMinHash signatures) using [Sourmash](https://sourmash.readthedocs.io/).

The demo in GH pages can be seen [HERE](https://ebi-metagenomics.github.io/mgnify-sourmash-component/).

## Usage

You can add the following inn your HTML:

```html
<mgnify-sourmash-component id="sourmash" ksize="31" scaled="1000" />
```

And use it via events in your javascript:

```javascript
document
  .getElementById('sourmash')
  .addEventListener('sketched', (evt) =>
    console.log(`The signature for ${evt.detail.filename} has been created`)
  );
document
  .getElementById('sourmash')
  .addEventListener('sketchedall', (evt) =>
    console.log(
      `Processing of all these files have finished: ${Object.keys(
        evt.detail.signatures
      )}`
    )
  );
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

##### `selectedFiles: Array<File> = null`

The `selectedFiles` property holds the array of files that are or have been processed by this component.

##### `progress: {[filename: string]: number}`

The `progress` property is an object where the key are the filenames of the selected files and the value is a float from `0` to `100` reporting how much of the file has been read and processed.

##### `signatures: {[filename: string]: string};

The `signatures` property is an object where the key are the filenames of the selected files and the value is the calculated signature as a `string` in JSON format. If a filename is not in this object, means that the signature has not yet been calculated, you can check the `progress` property to see how far it has been read.

### Methods

### Events

##### `sketched`

The `sketched` event is fired when a single file read is completed and a signature for has been calculated.

| Bubbles    | Yes |
| ---------- | --- |
| Cancelable | No  |

```typescript
detail: {
  filename: string,
  signature: string, //it is given as a string but it is in JSON format, so you could safely use JSON.parse
}
```

##### `sketchedall`

The `sketchedall` event is fired when all the requested files have been read and proccessed.
If a signature couldn't be generated, its value in the returned object will be `null`.

| Bubbles    | Yes |
| ---------- | --- |
| Cancelable | No  |

```typescript
detail: {
  signatures: {
    [filename: string]: string;
  };
}
```
