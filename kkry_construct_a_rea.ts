TypeScript
import * as d3 from 'd3-array';
import * as scales from 'd3-scale';
import * as axis from 'd3-axis';
import * as selection from 'd3-selection';

// Configuration
const config = {
  // Data Source
  dataSource: 'https://api.example.com/data',
  dataFrequency: 1000, // 1 second
  dataLimit: 100,

  // Chart Configuration
  chartWidth: 800,
  chartHeight: 400,
  chartMargin: {
    top: 20,
    right: 20,
    bottom: 30,
    left: 40
  },

  // Axis Configuration
  xAxisTickFormat: '%H:%M:%S',
  yAxisTickFormat: '.2f',

  // Visualization Configuration
  vizType: 'lineChart',
  vizColorScheme: ['blue', 'red', 'green'],
  vizStrokeWidth: 2,

  // Real-time Update Configuration
  updateInterval: 1000, // 1 second
  updateThreshold: 10, // update chart when 10 new data points are received
};

// Data Structure
interface DataPoint {
  timestamp: number;
  value: number;
}

// Real-time Data Visualization Analyzer
class RealTimeDataVizAnalyzer {
  private data: DataPoint[] = [];
  private chart: any;

  constructor(private config: typeof config) {}

  init() {
    // Initialize chart
    this.chart = selection.select('body')
      .append('svg')
      .attr('width', this.config.chartWidth)
      .attr('height', this.config.chartHeight)
      .append('g')
      .attr('transform', `translate(${this.config.chartMargin.left}, ${this.config.chartMargin.top})`);

    // Initialize axis
    const xScale = scales.scaleTime()
      .domain([0, this.config.dataLimit])
      .range([0, this.config.chartWidth - this.config.chartMargin.left - this.config.chartMargin.right]);

    const yScale = scales.scaleLinear()
      .domain([0, 100])
      .range([this.config.chartHeight - this.config.chartMargin.top - this.config.chartMargin.bottom, 0]);

    const xAxis = axis.axisBottom(xScale)
      .tickFormat(this.config.xAxisTickFormat);

    const yAxis = axis.axisLeft(yScale)
      .tickFormat(this.config.yAxisTickFormat);

    this.chart.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${this.config.chartHeight - this.config.chartMargin.top - this.config.chartMargin.bottom})`)
      .call(xAxis);

    this.chart.append('g')
      .attr('class', 'y-axis')
      .call(yAxis);

    // Load initial data
    this.loadData();

    // Start real-time update
    setInterval(() => {
      this.updateData();
    }, this.config.updateInterval);
  }

  private loadData() {
    // Load initial data from API
    fetch(this.config.dataSource)
      .then(response => response.json())
      .then(data => {
        this.data = data;
        this.updateChart();
      });
  }

  private updateData() {
    // Fetch new data from API
    fetch(this.config.dataSource)
      .then(response => response.json())
      .then(newData => {
        this.data = [...this.data, ...newData];
        if (this.data.length > this.config.dataLimit) {
          this.data = this.data.slice(-this.config.dataLimit);
        }
        if (newData.length >= this.config.updateThreshold) {
          this.updateChart();
        }
      });
  }

  private updateChart() {
    // Update chart with new data
    const line = d3.line()
      .x((d, i) => this.config.chartWidth - this.config.chartMargin.left - this.config.chartMargin.right - i)
      .y(d => this.config.chartHeight - this.config.chartMargin.top - this.config.chartMargin.bottom - d.value)
      .curve(d3.curveBasis);

    this.chart.selectAll('.line')
      .data([this.data])
      .enter()
      .append('path')
      .attr('class', 'line')
      .attr('d', line);

    this.chart.selectAll('.line')
      .data([this.data])
      .attr('d', line);
  }
}

// Initialize Real-time Data Visualization Analyzer
const analyzer = new RealTimeDataVizAnalyzer(config);
analyzer.init();