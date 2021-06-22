import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import skecthFiles from './sketcher';

@customElement('mgnify-sourmash-component')
class MGnifySourmash extends LitElement {
  @property({ type: Boolean })
  directory = false;

  selectedFiles: Array<File> = null;

  setChecked(event: MouseEvent) {
    this.directory = (event.target as HTMLInputElement).checked;
  }
  static get styles() {
    return css`
      .mgnify-sourmash-component {
        display: flex;
        flex-direction: column;
      }
    `;
  }
  renderSelectedFiles() {
    return (this.selectedFiles?.length || 0) < 1
      ? ''
      : html`
          <div>
            <h2>Selected Files</h2>
            <ul>
              ${this.selectedFiles.map((file: File) => {
                const progress = (file as any).progress?.read || 0.0;
                return html` <li>
                  ${file.name}
                  <progress id=${file.name} max="100" value=${progress}>
                    ${progress.toFixed(2)}%
                  </progress>
                </li>`;
              })}
            </ul>
          </div>
        `;
  }
  render() {
    return html`
      <div class="mgnify-sourmash-component">
        <label for="sourmash-selector"
          >Select the FastA files (gzip supported) :</label
        >
        <input
          type="file"
          id="sourmash-selector"
          name="sourmash-selector"
          accept=".fa,.gz,.fasta"
          @change=${this.handleFileChanges}
          ?webkitdirectory=${this.directory}
          ?multiple=${!this.directory}
        />
        <label>
          <input
            type="checkbox"
            @change=${this.setChecked}
            ?checked=${this.directory}
          />
          Select a directory
        </label>
        ${this.renderSelectedFiles()}
      </div>
    `;
  }

  handleFileChanges(event: InputEvent) {
    event.preventDefault();
    this.selectedFiles = Array.from(
      (event.currentTarget as HTMLInputElement).files
    ).filter(
      (file: File) =>
        file.name.endsWith('.fa') ||
        file.name.endsWith('.fa.gz') ||
        file.name.endsWith('.fasta') ||
        file.name.endsWith('.fasta.gz')
    );
    skecthFiles(this.selectedFiles, () => this.requestUpdate());
    this.requestUpdate();
  }
}
