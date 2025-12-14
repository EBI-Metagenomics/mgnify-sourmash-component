import loadSourmash from "./sourmash-loader";

console.log("[sourmash worker] booting");
const ctx: Worker = self as any;

let Signature: any = null;
let ComputeParameters: any = null;

let smReady: Promise<void> | null = null;

async function ensureSourmashReady() {
  if (!smReady) {
    smReady = (async () => {
      const Sourmash: any = await loadSourmash();

      Signature = Sourmash.Signature;
      ComputeParameters = Sourmash.ComputeParameters;

      console.log("[sourmash worker] ready", Object.keys(Sourmash));
    })();
  }
  return smReady;
}

function sketchFiles(files: File[], options: any) {
  for (const file of files) {
    sketchFile(file, options);
  }
}

async function sketchFile(file: File, options: any) {
  await ensureSourmashReady();

  const params = new ComputeParameters();
  params.set_ksizes(new Uint32Array([options.ksize]));
  params.set_scaled(options.scaled);
  params.set_num(options.num);
  params.set_protein(options.is_protein);
  params.set_dayhoff(options.dayhoff);
  params.set_hp(options.hp);
  params.set_track_abundance(options.track_abundance);
  params.set_seed(options.seed);

  const sig = new Signature(params);
  const cb = function (progress: number) {
    ctx.postMessage({
      type: 'progress:read',
      filename: file.name,
      progress: progress * 100,
    });
  };

  try {
    sig.add_from_file(file, cb);
  } catch (e) {
    ctx.postMessage({
      type: 'signature:error',
      filename: file.name,
      error: e.message,
    });
    return;
  }

  ctx.postMessage({
    type: 'signature:generated',
    filename: file.name,
    signature: sig.to_json(),
  });
}

export default sketchFiles;

// Respond to message from parent thread
ctx.addEventListener('message', (event) => {
  if (event?.data?.files?.length) {
    sketchFiles(event.data.files, event.data.options);
  }
});
