/* eslint-disable  @typescript-eslint/no-explicit-any */
declare module '*.css' {
  const content: any;
  export default content;
}

interface KmerMinHashOptions {
  num: number;
  ksize: number;
  is_protein: boolean;
  dayhoff: boolean;
  hp: boolean;
  seed: number;
  scaled: number;
  track_abundance: boolean;
}

declare module '*.worker.ts' {
  // You need to change `Worker`, if you specified a different value for the `workerType` option
  class WebpackWorker extends Worker {
    constructor();
  }

  // Uncomment this if you set the `esModule` option to `false`
  // export = WebpackWorker;
  export default WebpackWorker;
}
