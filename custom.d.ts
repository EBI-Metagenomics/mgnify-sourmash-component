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

declare module 'filestream' {
  export const read: Read;
}
declare module 'through2' {
  const x: any;
  export default x;
}
declare module 'peek-stream' {
  const x: (f: (data: any, swap: any) => any) => any;
  export default x;
}

declare module 'pumpify' {
  import { Stream } from 'stream';
  const Pumpify: {
    obj: (...streams: Stream[]) => Stream;
  };
  export default Pumpify;
}
declare module 'fasta-parser' {
  import { Stream } from 'stream';
  const Fasta: () => Stream;
  export default Fasta;
}
declare module 'sourmash/sourmash_bg.wasm' {
  const x: any;
  export default x;
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
