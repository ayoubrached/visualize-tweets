import React, { Component } from 'react';

class FileUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
      jsonData: null,
    };
  }

  handleFileSubmit = (event) => {
    event.preventDefault();
    const { file } = this.state;

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target.result); // Parse the JSON file
          this.setState({ jsonData: json }); // Store parsed JSON
          this.props.set_data(json); // Pass the data to the parent
        } catch (error) {
          console.error('Invalid JSON file', error);
          alert('Invalid JSON file. Please upload a valid JSON file.');
        }
      };
      reader.readAsText(file); // Read the file as text
    }
  };

  render() {
    return (
      <div style={{ backgroundColor: '#f0f0f0', padding: 20 }}>
        <h2>Upload a JSON File</h2>
        <form onSubmit={this.handleFileSubmit}>
          <input
            type="file"
            accept=".json" // Accept only JSON files
            onChange={(event) => this.setState({ file: event.target.files[0] })}
          />
          <button type="submit">Upload</button>
        </form>
      </div>
    );
  }
}

export default FileUpload;
