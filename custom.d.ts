declare module '*.css' {
  const content: any;
  export default content;
}

interface Read {
  new (file: File): Read;
  reader: {
    onprogress: (data: any) => void;
  };
  pipe: (f: () => any) => any;
}

interface KmerMinHashOptions {
  num: number,
  ksize: number,
  is_protein: boolean,
  dayhoff: boolean,
  hp: boolean,
  seed: number,
  scaled: number,
  track_abundance: boolean,
}

declare module 'filestream' {
  export const read: Read;
}
declare module 'peek-stream' {
  const x: (f: (data: any, swap: any) => any) => any;
  export default x;
}

declare module 'fasta-parser' {
  import { Stream } from 'stream';
  const Fasta: () => Stream;
  export default Fasta;
}

declare module 'worker-loader!*' {
  // You need to change `Worker`, if you specified a different value for the `workerType` option
  class WebpackWorker extends Worker {
    constructor();
  }

  // Uncomment this if you set the `esModule` option to `false`
  // export = WebpackWorker;
  export default WebpackWorker;
}
