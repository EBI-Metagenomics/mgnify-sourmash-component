import * as wasm from "./sourmash_bg.wasm";
import { __wbg_set_wasm } from "./sourmash_bg.js";
__wbg_set_wasm(wasm);
export * from "./sourmash_bg.js";
