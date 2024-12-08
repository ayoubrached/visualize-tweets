import React, { Component } from 'react';
import * as d3 from 'd3';
import './App.css';

class TweetVisualization extends Component {
  constructor(props) {
    super(props);
    this.state = {
      colorMode: 'sentiment',
    };
  }

  componentDidMount() {
    this.createVisualization();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.data !== this.props.data || prevState.colorMode !== this.state.colorMode) {
      this.createVisualization();
    }
  }

  handleColorModeChange = (event) => {
    this.setState({ colorMode: event.target.value });
  };

  createVisualization = () => {
    const { data } = this.props;
    const { colorMode } = this.state;
  
    const svgWidth = 1200;
    const svgHeight = 600;
  
    const svg = d3
      .select(this.refs.canvas)
      .attr('width', svgWidth)
      .attr('height', svgHeight);
  
    const sentimentColorScale = d3
      .scaleLinear()
      .domain([-1, 0, 1])
      .range(['red', '#ECECEC', 'green']);
    const subjectivityColorScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range(['#ECECEC', '#4467C4']);
  
    const colorScale =
      colorMode === 'sentiment' ? sentimentColorScale : subjectivityColorScale;
  
    const nodes = svg.selectAll('circle');
    nodes.attr('fill', (d) =>
      colorScale(colorMode === 'sentiment' ? d.Sentiment : d.Subjectivity)
    );
  
    if (nodes.empty()) {
      const monthScaleY = d3
        .scalePoint()
        .domain(['March', 'April', 'May'])
        .range([100, svgHeight - 100]);
  
      const simulation = d3
        .forceSimulation(data)
        .force('x', d3.forceX(svgWidth - 100).strength(0.01))
        .force(
          'y',
          d3.forceY((d) => monthScaleY(d.Month) || svgHeight / 2).strength(0.2)
        )
        .force('collide', d3.forceCollide(12))
        .on('tick', ticked);
  
      svg
        .selectAll('.month-label')
        .data(['March', 'April', 'May'])
        .enter()
        .append('text')
        .attr('class', 'month-label')
        .attr('x', svgWidth - 1000)
        .attr('y', (d) => monthScaleY(d))
        .attr('dy', '-1.5em')
        .attr('text-anchor', 'middle')
        .attr('font-weight', 'bold')
        .text((d) => d);
  
      const nodeEnter = svg
        .selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('r', 7)
        .attr('fill', (d) =>
          colorScale(colorMode === 'sentiment' ? d.Sentiment : d.Subjectivity)
        )
        .attr('stroke', 'none')
        .attr('data-id', (d) => d.idx)
        .on('click', (event, d) => this.handleTweetClick(d));
  
      function ticked() {
        nodeEnter
          .attr('cx', (d) => d.x)
          .attr('cy', (d) => d.y);
      }
    }
  
    svg.select('defs').remove();
  
    const legendWidth = 20;
    const legendHeight = 200;
  
    const gradient = svg
      .append('defs')
      .append('linearGradient')
      .attr('id', 'legend-gradient')
      .attr('x1', '0%')
      .attr('y1', '100%')
      .attr('x2', '0%')
      .attr('y2', '0%');
  
    if (colorMode === 'sentiment') {
      gradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', 'red');
  
      gradient
        .append('stop')
        .attr('offset', '50%')
        .attr('stop-color', '#ECECEC');
  
      gradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', 'green');
    } else {
      gradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#ECECEC');
  
      gradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#4467C4');
    }
  
    svg.selectAll('rect.legend-rect').remove();
    svg.selectAll('text.legend-label').remove();
  
    svg
      .append('rect')
      .attr('class', 'legend-rect')
      .attr('x', svgWidth - 100)
      .attr('y', 100)
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#legend-gradient)');
  
    svg
      .append('text')
      .attr('class', 'legend-label')
      .attr('x', svgWidth - 110)
      .attr('y', 95)
      .attr('text-anchor', 'end')
      .attr('font-size', '12px')
      .text(colorMode === 'sentiment' ? 'Positive' : 'Subjective');
  
    svg
      .append('text')
      .attr('class', 'legend-label')
      .attr('x', svgWidth - 110)
      .attr('y', 320)
      .attr('text-anchor', 'end')
      .attr('font-size', '12px')
      .text(colorMode === 'sentiment' ? 'Negative' : 'Objective');
  };      

  handleTweetClick = (tweet) => {
    const selectedCircle = d3.select(`[data-id="${tweet.idx}"]`);
    const isSelected = selectedCircle.attr('stroke') === 'black';
  
    if (isSelected) {
      selectedCircle.attr('stroke', 'none');
    } else {
      selectedCircle.attr('stroke', 'black').attr('stroke-width', 2);
    }
  
    const selectedTweetDiv = document.getElementById('selected-tweets');
    const existingTweet = document.getElementById(`tweet-${tweet.idx}`);
  
    if (existingTweet) {
      existingTweet.remove();
    } else {
      const tweetDiv = document.createElement('div');
      tweetDiv.id = `tweet-${tweet.idx}`;
      tweetDiv.textContent = tweet.RawTweet;
      tweetDiv.style.border = '1px solid black';
      tweetDiv.style.margin = '5px';
      selectedTweetDiv.appendChild(tweetDiv);
    }
  };

  render() {
    return (
      <div>
        <h2>Tweet Visualization</h2>
        <div>
          <label htmlFor="colorMode">Color by: </label>
          <select
            id="colorMode"
            onChange={this.handleColorModeChange}
            value={this.state.colorMode}
          >
            <option value="sentiment">Sentiment</option>
            <option value="subjectivity">Subjectivity</option>
          </select>
        </div>
        <svg ref="canvas"></svg>
        <div id="selected-tweets" style={{ marginTop: '20px' }}>
          <h3>Selected Tweets</h3>
        </div>
      </div>
    );
  }
}

export default TweetVisualization;
