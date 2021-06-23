const ctx: Worker = self as any;

// import * as Sourmash from 'sourmash';

import { read as FileReadStream } from 'filestream';
// TODO: Replace filestream for the streams API once pipeThrough is stable
// https://developer.mozilla.org/en-US/docs/Web/API/Streams_API

// import { FASTQStream } from 'fastqstream';
import Fasta from 'fasta-parser';

// const zlib = require('zlib');
import peek from 'peek-stream';
import through from 'through2';
import pumpify from 'pumpify';

let KmerMinHash: any = null;
const smImport = import('sourmash').then(
  (Sourmash) => (KmerMinHash = Sourmash.KmerMinHash)
);

const isFASTA = (data: Uint8Array | Uint16Array | Uint32Array) =>
  data.toString().charAt(0) === '>';

// const isFASTQ = (data) => data.toString().charAt(0) === '@';

const isGzip = (data: Uint8Array | Uint16Array | Uint32Array) =>
  data[0] === 31 && data[1] === 139;

// function GzipParser() {
//   return peek(function (data: any, swap: any) {
//     if (isGzip(data)) return swap(null, new zlib.Unzip());
//     else return swap(null, through());
//   });
// }
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
    if (isFASTA(data)) return swap(null, pumpify.obj(Fasta(), jsParse()));
    // if (isFASTQ(data)) return swap(null, new FASTQStream());

    // we do not know - bail
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
  // const compressedparser = new GzipParser();

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

      const jsonData = JSON.parse(jsonStr);
      console.log(jsonData, jsonStr.length, fileSize);

      //     const file = new window.Blob([jsonData], {
      //       type: 'application/octet-binary',
      //     });
      //     const url = window.URL.createObjectURL(file);
    });

  // switch (file.type) {
  //   case 'application/gzip':
  //     reader.pipe(new zlib.Unzip()).pipe(seqparser);
  //     break;
  //   default:
  //     reader.pipe(compressedparser).pipe(seqparser);
  //     break;
  // }
  reader.pipe(seqparser);
}

export default skecthFiles;

// Respond to message from parent thread
ctx.addEventListener('message', (event) => {
  if (event?.data?.files?.length) {
    skecthFiles(event.data.files);
  }
});
