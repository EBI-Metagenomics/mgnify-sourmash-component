// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ctx: Worker = self as any;

import { read as FileReadStream } from 'filestream';
// TODO: To be replaced by parsing the fasta from inside sourmash
import Fasta from './fasta-parser';

// import peek from 'peek-stream';
import peek from './peek-stream';
import through from 'through2';
import { obj as Pumpify } from 'pumpify';
import { KmerMinHash as KmerMinHashType } from 'sourmash';

// This needs to be a dynamic import to be able to use the wasm from inside sourmash
let KmerMinHash: typeof KmerMinHashType = null;
const smImport = import('sourmash').then(
  (Sourmash) => (KmerMinHash = Sourmash.KmerMinHash)
);

export const isFASTA = (data: DataChunk) => data.toString().charAt(0) === '>';
export const isDNASequence = (data: DataChunk) =>
  (data.toString().split('\n')?.[1] || '').toUpperCase().match(/[^ATGCN]/) ===
  null;

function jsParse() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function transform(obj: string | Buffer, _: any, next: () => void) {
    const newObj = Buffer.isBuffer(obj) ? obj.toString() : obj;
    this.push(JSON.parse(newObj));
    next();
  }
  function flush() {
    this.push(null);
  }
  const stream = through.obj(transform, flush);
  return stream;
}

function FASTParser(is_protein: boolean) {
  return peek(
    {
      maxBuffer: 500,
      newline: false,
    },
    function (data: DataChunk, swap: SwapFuntion) {
      if (isFASTA(data)) {
        if (!is_protein && !isDNASequence(data)) {
          swap(new Error('Only DNA sequences supported'));
        }
        return swap(null, new Pumpify(Fasta(), jsParse()));
      }
      swap(
        new Error(
          'There was a problem parsing this file. It might be of an unsupported format.'
        )
      );
    }
  );
}

function skecthFiles(files: File[], options: KmerMinHashOptions) {
  for (const file of files) {
    skecthFile(file, options);
  }
}
async function skecthFile(file: File, options: KmerMinHashOptions) {
  const reader = new FileReadStream(file);

  const fileSize = file.size;

  let loadedFile = 0;
  (reader.reader as FileReader).addEventListener(
    'progress',
    (data: ProgressEvent) => {
      loadedFile += data.loaded;
      ctx.postMessage({
        type: 'progress:read',
        filename: file.name,
        progress: (loadedFile / fileSize) * 100,
      });
    }
  );

  await Promise.all([smImport]);
  const mh = new KmerMinHash(
    options.num,
    options.ksize,
    options.is_protein,
    options.dayhoff,
    options.hp,
    options.seed,
    options.scaled,
    options.track_abundance
  );
  const seqparser = FASTParser(options.is_protein);

  seqparser
    .on('data', function (data: { seq: string }) {
      mh.add_sequence_js(data.seq);
    })
    .on('error', (e: Error) => {
      ctx.postMessage({
        type: 'signature:error',
        filename: file.name,
        error: e.message,
      });
    })
    .on('end', function () {
      const jsonStr = `[{
        "class":"sourmash_signature","email":"",
        "hash_function":"0.murmur64",
        "filename":"${file.name}",
        "license":"CC0",
        "signatures":[${mh.to_json()}],
        "version":0.4
      }]`;
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
    skecthFiles(event.data.files, event.data.options);
  }
});
