import React, { Component } from 'react';
import FileUpload from './FileUpload';
import TweetVisualization from './TweetVisualization';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
    };
  }

  setData = (data) => {
    this.setState({ data: data.slice(0, 300) });
  };

  render() {
    const { data } = this.state;

    return (
      <div>
        <h1>Twitter Data Visualization</h1>
        <FileUpload set_data={this.setData} />
        
        {data.length > 0 ? (
          <TweetVisualization data={data} />
        ) : (
          <p style={{ textAlign: 'center', marginTop: '20px' }}>
            Please upload a JSON file to visualize the data.
          </p>
        )}
      </div>
    );
  }
}

export default App;
