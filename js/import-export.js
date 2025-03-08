// import-export.js
class ImportExportUI {
  constructor(containerId, app) {
    this.container = document.getElementById(containerId);
    this.app = app;
    
    // Bind methods
    this.render = this.render.bind(this);
    this.handleExport = this.handleExport.bind(this);
    this.handleImport = this.handleImport.bind(this);
    this.handleFileSelect = this.handleFileSelect.bind(this);
    
    // Initial render
    this.render();
  }
  
  render() {
    this.container.innerHTML = '';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'panel-header';
    header.innerHTML = `
      <h2>Import / Export</h2>
    `;
    this.container.appendChild(header);
    
    // Create content
    const content = document.createElement('div');
    content.className = 'panel-content import-export-panel';
    
    // Export option
    const exportOption = document.createElement('div');
    exportOption.className = 'import-export-option';
    exportOption.innerHTML = `
      <h3>Export Your Data</h3>
      <p>Download all your wishlist locations as a JSON file. You can use this file to backup your data or transfer it to another device.</p>
      <button id="export-btn" class="btn btn-primary">Export to JSON</button>
    `;
    content.appendChild(exportOption);
    
    // Import option
    const importOption = document.createElement('div');
    importOption.className = 'import-export-option';
    importOption.innerHTML = `
      <h3>Import Data</h3>
      <p>Import locations from a JSON file. This will add the imported locations to your existing data.</p>
      <input type="file" id="import-file" class="hidden" accept=".json">
      <button id="import-btn" class="btn btn-primary">Select JSON File</button>
      <div id="import-status" class="import-status"></div>
    `;
    content.appendChild(importOption);
    
    // Add warning about localStorage limitations
    const storageWarning = document.createElement('div');
    storageWarning.className = 'storage-warning';
    storageWarning.innerHTML = `
      <p><strong>Note:</strong> Your data is currently stored in your browser's localStorage, which has a limit of about 5MB. If you have many locations with photos, consider using the export feature regularly to backup your data.</p>
    `;
    content.appendChild(storageWarning);
    
    this.container.appendChild(content);
    
    // Add event listeners
    document.getElementById('export-btn').addEventListener('click', this.handleExport);
    document.getElementById('import-btn').addEventListener('click', () => {
      document.getElementById('import-file').click();
    });
    document.getElementById('import-file').addEventListener('change', this.handleFileSelect);
  }
  
  async handleExport() {
    try {
      // Get JSON data from app
      const jsonData = await this.app.handleImportExport('export');
      
      // Create download link
      const downloadLink = document.createElement('a');
      downloadLink.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonData);
      downloadLink.download = `travel-wishlist-${new Date().toISOString().split('T')[0]}.json`;
      
      // Trigger download
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Show success message
      const exportBtn = document.getElementById('export-btn');
      const originalText = exportBtn.textContent;
      exportBtn.textContent = 'Exported Successfully!';
      exportBtn.disabled = true;
      
      // Reset button after 2 seconds
      setTimeout(() => {
        exportBtn.textContent = originalText;
        exportBtn.disabled = false;
      }, 2000);
      
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data. Please try again.');
    }
  }
  
  handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonData = e.target.result;
        this.handleImport(jsonData);
      } catch (error) {
        console.error('Error reading file:', error);
        this.showImportStatus('error', 'Error reading file. Please try again.');
      }
    };
    
    reader.readAsText(file);
  }
  
  async handleImport(jsonData) {
    try {
      // Show loading status
      this.showImportStatus('loading', 'Importing data...');
      
      // Parse JSON and validate structure
      let data;
      try {
        data = JSON.parse(jsonData);
        
        // Basic validation (check if it's an array)
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format. Expected an array of locations.');
        }
      } catch (error) {
        this.showImportStatus('error', 'Invalid JSON format. Please check your file.');
        return;
      }
      
      // Import data
      const importedLocations = await this.app.handleImportExport('import', data);
      
      // Show success message
      this.showImportStatus('success', `Successfully imported ${importedLocations.length} locations!`);
      
      // Reset file input
      document.getElementById('import-file').value = '';
      
    } catch (error) {
      console.error('Error importing data:', error);
      this.showImportStatus('error', `Error importing data: ${error.message}`);
    }
  }
  
  showImportStatus(type, message) {
    const statusElement = document.getElementById('import-status');
    
    if (!statusElement) return;
    
    // Set status class
    statusElement.className = 'import-status';
    statusElement.classList.add(`status-${type}`);
    
    // Set message
    statusElement.textContent = message;
    
    // Clear success/error messages after a delay
    if (type === 'success' || type === 'error') {
      setTimeout(() => {
        statusElement.textContent = '';
        statusElement.className = 'import-status';
      }, 5000);
    }
  }
}

export default ImportExportUI;