import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('mgnify-sourmash-component')
class MGnifySourmash extends LitElement {

  @property({ type: Boolean })
  directory = true;

  selectedFiles: FileList = null;

  setChecked(event: MouseEvent) {
    this.directory = (event.target as HTMLInputElement).checked;
  }
  static get styles() {
    return css`
      .mgnify-sourmash-component {
        display: flex;
        flex-direction:column;

      }
    `;
  }
  renderSelectedFiles(){
    return ((this.selectedFiles?.length || 0 )< 1) ? '': html`
      <div>
        <h2>Selected Files</h2>
        <ul>
          ${Array.from(this.selectedFiles).map((file: File)=>html`<td>${file.name}</td>`)
          }
        </ul>
      </div>
    `;
  }
  render() {
    return html`
      <div class="mgnify-sourmash-component">
        <label for="sourmash-selector">Select the FastA files (gzip supported) :</label>
        <input type="file"
          id="sourmash-selector"
          name="sourmash-selector"
          accept=".fa,.fa.gz,.fasta,.fasta.gz"
          @change=${this.handleFileChanges}
        />
        <label>
          <input type="checkbox" @change=${this.setChecked}> Select a directory
        </label>
        ${this.renderSelectedFiles()}
      </div>
    `;
  }

  handleFileChanges(event: InputEvent){
    event.preventDefault();
    this.selectedFiles = (event.currentTarget as HTMLInputElement).files;
    this.requestUpdate();
  }
}
