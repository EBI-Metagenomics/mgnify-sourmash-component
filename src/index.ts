import { LitElement, html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { customElement, property } from 'lit/decorators.js';

import Worker from './sketcher.worker.ts';

import style from './index.css';

const worker = new Worker();

const SEQUENCE_EXTENSIONS = ['.fa', '.fasta', '.fna', '.gz', '.fq', '.fastq'];
const SIGNATURE_EXTENSION = '.sig';
@customElement('mgnify-sourmash-component')
export class MGnifySourmash extends LitElement {
  @property({ type: Boolean, reflect: true })
  directory = false;
  @property({ type: Boolean })
  show_directory_checkbox = false;
  @property({ type: Boolean })
  show_signatures = false;
  @property({ type: Boolean, attribute: 'accept-sigs' })
  acceptSigs = false;

  // KmerMinHash parameters
  @property({ type: Number })
  num = 0;
  @property({ type: Number })
  ksize = 21;
  @property({ type: Boolean })
  is_protein = false;
  @property({ type: Boolean })
  dayhoff = false;
  @property({ type: Boolean })
  hp = false;
  @property({ type: Number })
  seed = 42;
  @property({ type: Number })
  scaled = 1000;
  @property({ type: Boolean })
  track_abundance = false;

  selectedFiles: Array<File> = null;
  progress: {
    [filename: string]: number;
  } = {};
  signatures: {
    [filename: string]: string;
  } = {};
  errors: {
    [filename: string]: string;
  } = {};

  static styles = [style];

  constructor() {
    super();
    worker.addEventListener('message', (event) => {
      switch (event?.data?.type) {
        case 'progress:read':
          this.progress[event.data.filename] = event.data.progress;
          this.requestUpdate();
          break;
        case 'signature:error':
          this.recordSignatureError(event.data.filename, event.data.error);
          break;
        case 'signature:generated':
          this.recordSignature(event.data.filename, event.data.signature);
          break;
        default:
          break;
      }
    });
  }

  private haveCompletedAllSignatures() {
    return Object.keys(this.progress).every(
      (key: string) => key in this.signatures || key in this.errors
    );
  }

  private dispatchCompletedIfReady() {
    if (!this.haveCompletedAllSignatures()) return;

    this.dispatchEvent(
      new CustomEvent('sketchedall', {
        bubbles: true,
        detail: {
          signatures: this.signatures,
          errors: this.errors,
        },
      })
    );
  }

  private recordSignature(filename: string, signature: string) {
    this.signatures[filename] = signature;
    this.progress[filename] = 100;
    this.dispatchEvent(
      new CustomEvent('sketched', {
        bubbles: true,
        detail: { filename, signature },
      })
    );
    this.dispatchCompletedIfReady();
    this.requestUpdate();
  }

  private recordSignatureError(filename: string, error: string) {
    this.errors[filename] = error;
    this.dispatchEvent(
      new CustomEvent('sketchedError', {
        bubbles: true,
        detail: { filename, error },
      })
    );
    this.dispatchCompletedIfReady();
    this.requestUpdate();
  }

  private isSignatureFile(file: File) {
    return file.name.toLowerCase().endsWith(SIGNATURE_EXTENSION);
  }

  private acceptsFile(file: File) {
    const filename = file.name.toLowerCase();
    return (
      SEQUENCE_EXTENSIONS.some((extension) => filename.endsWith(extension)) ||
      (this.acceptSigs && this.isSignatureFile(file))
    );
  }

  private async loadSignatureFile(file: File) {
    try {
      // Pass uploaded signatures through unchanged as text. Normalisation and
      // backend-specific validation belong to the consuming client.
      const signature = await file.text();
      this.recordSignature(file.name, signature);
    } catch (error) {
      this.recordSignatureError(
        file.name,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  setChecked(event: MouseEvent) {
    this.directory = (event.target as HTMLInputElement).checked;
  }

  clear() {
    this.selectedFiles = null;
    this.progress = {};
    this.signatures = {};
    this.errors = {};
    (
      this.renderRoot.querySelector('#sourmash-selector') as HTMLInputElement
    ).value = null;
    this.requestUpdate();
  }

  renderSelectedFiles() {
    if ((this.selectedFiles?.length || 0) < 1) return '';
    return html`
      <div>
        <h2>Selected Files:</h2>
        <ul>
          ${this.selectedFiles.map((file: File) => {
            const progress = this.progress?.[file.name] || 0;
            const signature = this.signatures[file.name];
            const error = this.errors[file.name];
            let emoji = html``;
            if (signature) emoji = html`✅`;
            if (error)
              emoji = html`<span title=${error}>⚠️<code>${error}</code></span>`;
            return html` <li>
              ${file.name} ${emoji}
              <progress
                id=${file.name}
                max="100"
                value=${ifDefined(progress > 100 ? undefined : progress)}
              >
                ${progress.toFixed(2)}%
              </progress>
              ${this.show_signatures && signature?.length
                ? html`
                    <details>
                      <summary>See signature</summary>
                      <pre>${signature}</pre>
                    </details>
                  `
                : ''}
            </li>`;
          })}
        </ul>
      </div>
    `;
  }
  render() {
    let label = this.directory ? 'Choose a directory...' : 'Choose Files...';
    if (this.selectedFiles?.length)
      label = `${this.selectedFiles?.length} Files Selected`;
    const acceptedExtensions = this.acceptSigs
      ? [...SEQUENCE_EXTENSIONS, SIGNATURE_EXTENSION]
      : SEQUENCE_EXTENSIONS;
    return html`
      <div class="mgnify-sourmash-component">
        <label>
          Select ${this.is_protein ? 'protein' : 'nucleotides'} FASTA
          files${this.acceptSigs ? ' or Sourmash signatures' : ''}:
        </label>
        <label class="file" for="sourmash-selector">
          <input
            type="file"
            id="sourmash-selector"
            name="sourmash-selector"
            accept=${acceptedExtensions.join(',')}
            @change=${this.handleFileChanges}
            ?webkitdirectory=${this.directory}
            ?multiple=${!this.directory}
          />
          <span class="file-custom" data-label=${label}></span>
        </label>
        ${this.show_directory_checkbox
          ? html`
              <div class="mode-selector">
                <button
                  class=${this.directory ? '' : 'selected'}
                  @click=${() => (this.directory = false)}
                >
                  Files
                </button>
                <button
                  class=${this.directory ? 'selected' : ''}
                  @click=${() => (this.directory = true)}
                >
                  Directory
                </button>
              </div>
            `
          : ''}
        ${this.renderSelectedFiles()}
      </div>
    `;
  }

  handleFileChanges(event: InputEvent) {
    event.preventDefault();
    this.selectedFiles = Array.from(
      (event.currentTarget as HTMLInputElement).files
    ).filter((file: File) => this.acceptsFile(file));

    this.progress = Object.fromEntries(
      this.selectedFiles.map((file: File) => [file.name, 0])
    );
    this.signatures = {};
    this.errors = {};

    const signatureFiles = this.selectedFiles.filter((file: File) =>
      this.isSignatureFile(file)
    );
    const sequenceFiles = this.selectedFiles.filter(
      (file: File) => !this.isSignatureFile(file)
    );

    if (sequenceFiles.length) {
      worker.postMessage({
        files: sequenceFiles,
        options: {
          num: this.num,
          ksize: this.ksize,
          is_protein: this.is_protein,
          dayhoff: this.dayhoff,
          hp: this.hp,
          seed: this.seed,
          scaled: this.scaled,
          track_abundance: this.track_abundance,
        },
      });
    }
    this.dispatchEvent(
      new CustomEvent('change', {
        bubbles: true,
        detail: {
          selectedFiles: this.selectedFiles,
        },
      })
    );

    signatureFiles.forEach((file: File) => this.loadSignatureFile(file));

    this.requestUpdate();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mgnify-sourmash-component': MGnifySourmash;
  }
}
