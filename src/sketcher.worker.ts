const ctx: Worker = self as any;


import { read as FileReadStream } from 'filestream';
// TODO: To be replaced by parsing the fasta from inside sourmash
import Fasta from 'fasta-parser';

import peek from 'peek-stream';
import through from 'through2';
import {obj as Pumpify} from 'pumpify';

// This needs to be a dynamic import to be able to use the wasm from inside sourmash
let KmerMinHash: any = null;
const smImport = import('sourmash').then(
  (Sourmash) => (KmerMinHash = Sourmash.KmerMinHash)
);

const isFASTA = (data: Uint8Array | Uint16Array | Uint32Array) =>
  data.toString().charAt(0) === '>';


function jsParse() {
  function transform(obj: any, enc: any, next: () => void) {
    let newObj: string = obj;
    if (Buffer.isBuffer(obj)) {
      newObj = obj.toString();
    }
    this.push(JSON.parse(newObj));
    next();
  }
  function flush() {
    this.push(null);
  }
  const stream = through.obj(transform, flush);
  return stream;
}

function FASTParser() {
  return peek(function (data: any, swap: any) {
    if (isFASTA(data)) return swap(null, new Pumpify(Fasta(), jsParse()));
    swap(new Error('No parser available'));
  });
}

function skecthFiles(files: File[]) {
  for (let file of files) {
    skecthFile(file);
  }
}
async function skecthFile(file: File) {
  const reader = new FileReadStream(file);

  const fileSize = file.size;

  let loadedFile = 0;
  (reader.reader as any).addEventListener('progress', (data: any) => {
    loadedFile += data.loaded;
    ctx.postMessage({
      type: 'progress:read',
      filename: file.name,
      progress: (loadedFile / fileSize) * 100,
    });
  });

  const num = 0;
  const ksize = 31;
  const isProtein = false;
  const scaled = 1000;
  const trackAbundance = false;

  await Promise.all([smImport]);

  const mh = new KmerMinHash(
    num,
    ksize,
    isProtein,
    false,
    false,
    42,
    scaled,
    trackAbundance
  );
  const seqparser = FASTParser();

  seqparser
    .on('data', function (data: any) {
      mh.add_sequence_js(data.seq);
    })
    .on('end', function () {
      const jsonStr = mh.to_json();
      ctx.postMessage({
        type: 'signature:generated',
        filename: file.name,
        signature: jsonStr,
      });
    });
  reader.pipe(seqparser);
}

export default skecthFiles;

// Respond to message from parent thread
ctx.addEventListener('message', (event) => {
  if (event?.data?.files?.length) {
    skecthFiles(event.data.files);
  }
});
