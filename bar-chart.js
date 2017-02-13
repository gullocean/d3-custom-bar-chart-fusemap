const mainContainer = d3.select('#plugloadsGraph');

const legendWidth = 100;
const legendTitleHeight = 20;

const graphMargin = { bottom: 20, left: 10, right: 10, top: 10};
const graphPadding = { bottom: 30, left: 50, right: 0, top: 0};

const graphContainer = mainContainer
  .append('div')
    .attr('class', 'graph-container');
const legendContainer = mainContainer
  .append('div')
    .attr('class', 'legend-container');
const legendTitleContainer = legendContainer
  .append('div')
    .attr('class', 'legend-title-container');
const legendContentContainer = legendContainer
  .append('div')
    .attr('class', 'legend-content-container');
const svgGraphD3Selection = graphContainer
  .append('svg');
const svgLegendContainer = legendContentContainer
  .append('svg');
const legendContainerD3Selection = svgLegendContainer
  .append('g')
    .attr('class', 'legend');

const parseDate = d3.timeParse('%A, %B %d, %Y %I:%M:%S %p');

var graphData = {};

function GetGroupItemNames(data) {
  let keys = Object.keys(data);
  keys.splice(keys.indexOf('key'), 1);
  return keys;
}

d3.json('sample_data.json', function(d) {
  d.GraphPointsList.forEach(function(graphPointsList) {
    graphPointsList.GraphPointList.forEach(function(graphPoint) {
      if (graphPoint.Yaxis !== null) graphPoint.Yaxis = +graphPoint.Yaxis;
      graphPoint.Xaxis = parseDate(graphPoint.Xaxis);
    });
  });

  graphData = d;

  BarChart(graphData);
});

function BarChart(data) {
  if (!data) {
    console.log('There is no bar chart data!');
    return;
  }

  const mainContainerHeight = mainContainer.node().getBoundingClientRect().height;
  const mainContainerWidth = mainContainer.node().getBoundingClientRect().width;

  const graphContainerHeight = mainContainerHeight;
  const graphContainerWidth = mainContainerWidth - legendWidth;

  const legendContainerHeight = graphContainerHeight - graphMargin.bottom - graphMargin.top - graphPadding.bottom - graphPadding.top;
  const legendContainerWidth = legendWidth;

  const graphHeight = graphContainerHeight - graphMargin.bottom - graphMargin.top - graphPadding.bottom - graphPadding.top;
  const graphWidth = graphContainerWidth - graphMargin.left - graphMargin.right - graphPadding.left - graphPadding.right;

  svgGraphD3Selection
    .selectAll('*')
    .remove();

  const graphBackgroundRectD3Selection = svgGraphD3Selection
    .append('rect')
      .attr('class', 'graph-background');
  const barChartContainerD3Selection = svgGraphD3Selection
    .append('g')
      .attr('class', 'bar-chart');
  const axesContainerD3Selection = barChartContainerD3Selection
    .append('g')
      .attr('class', 'axes');
  const gridsContainerD3Selection = barChartContainerD3Selection
    .append('g')
      .attr('class', 'grids');

  graphContainer
    .style('height', graphContainerHeight + 'px')
    .style('width', graphContainerWidth + 'px');

  legendTitleContainer
    .style('padding-top', (graphMargin.top + graphPadding.top) + 'px');

  legendContentContainer
    .style('height', legendContainerHeight + 'px')
    .style('width', legendContainerWidth + 'px');

  svgGraphD3Selection
    .attr('height', graphContainerHeight)
    .attr('width', graphContainerWidth);

  svgLegendContainer
    .attr('height', legendContainerHeight * 0.8)
    .attr('width', legendContainerWidth * 0.8);

  graphBackgroundRectD3Selection
    .attr('height', graphHeight + graphMargin.bottom)
    .attr('width', graphWidth)
    .attr('transform', 'translate(' + (graphMargin.left + graphPadding.left) + ',' + graphMargin.top + ')');

  barChartContainerD3Selection
    .attr('transform', 'translate(' + (graphMargin.left + graphPadding.left) + ',' + graphMargin.top + ')');

  var x0 = d3.scaleBand()
      .rangeRound([0, graphWidth])
      .paddingInner(0.1);

  var x1 = d3.scaleBand()
      .padding(0);

  var y = d3.scaleLinear()
      .rangeRound([graphHeight, 0]);

  var z = d3.scaleOrdinal()
      .range(['#F8766D', '#00BA38', '#619CFF', '#6b486b', '#a05d56', '#d0743c', '#ff8c00']);

  const dataset = [];
  const formatXaxis = data.xAxisDateFormat;
  const labelXaxis = data.XaxisText;
  const labelYaxis = data.YaxisText === '0' ? 'kWh' : data.YaxisText;

  if (data.GraphPointsList.length === 0) {
    console.log('There is no GraphPointsList!');
    return;
  }

  if (data.GraphPointsList[0].GraphPointList.length === 0) {
    console.log('There is no GraphPointList!');
    return;
  }

  const itemNames = data.GraphPointsList.map((d) => d.ItemName);
  const xAxisKeys = data.GraphPointsList[0].GraphPointList.map((d) => d.Xaxis);

  xAxisKeys.forEach((xAxisKey) => {
    var item = {key: null};
    item.key = xAxisKey;
    data.GraphPointsList.forEach((graphPoints) => {
      for (var i = 0; i < graphPoints.GraphPointList.length; i ++) {
        if (graphPoints.GraphPointList[i].Xaxis.getTime() === xAxisKey.getTime() &&
          !(graphPoints.GraphPointList[i].Yaxis === 0 || graphPoints.GraphPointList[i].Yaxis === null)) {
          item[graphPoints.ItemName] = {};
          item[graphPoints.ItemName].Yaxis = graphPoints.GraphPointList[i].Yaxis;
          item[graphPoints.ItemName].Xaxis = 1;
          break;
        }
      }
    });

    var groupItemNames = GetGroupItemNames(item);

    groupItemNames.forEach((itemName) => {
      item[itemName].Xaxis = itemNames.length / groupItemNames.length;
    })

    if (groupItemNames.length > 0) dataset.push(item);
  });

  x0.domain(dataset.map((datum) => datum.key));
  x1.domain(itemNames).rangeRound([0, x0.bandwidth()]);
  y.domain([0, d3.max(dataset, (d) => {
    let groupItemNames = GetGroupItemNames(d);
    return d3.max(groupItemNames, (itemName) => d[itemName].Yaxis);
  })]).nice();

  var barsD3Selection = barChartContainerD3Selection
    .append('g')
      .attr('class', 'bars')
    .selectAll('g')
    .data(dataset);

  var barGroupD3Selection = barsD3Selection
    .enter()
      .append('g')
        .attr('transform', (d) => ('translate(' + x0(d.key) + ',0)'))
        .attr('class', 'bar-group')
      .selectAll('g')
      .data((d) => {
        let groupItemNames = GetGroupItemNames(d);
        return groupItemNames.map((itemName) => ({key: itemName, value: d[itemName]}));
      });

  barGroupD3Selection
    .enter()
      .append('rect')
        .attr('x', (d, i) => (x1.step() * d.value.Xaxis * i))
        .attr('y', (d) => y(d.value.Yaxis))
        .attr('width', (d) => (x1.bandwidth() * d.value.Xaxis))
        .attr('height', (d) => (graphHeight - y(d.value.Yaxis)))
        .attr('fill', (d) => z(d.key))
        .attr('class', 'bar');

  axesContainerD3Selection
    .append('g')
      .attr('class', 'axis-x')
      .attr('transform', 'translate(0,' + (graphHeight + graphMargin.bottom) + ')')
      .call(d3.axisBottom(x0)
        .tickFormat(d3.timeFormat(formatXaxis)))
    .append('text')
      .attr('class', 'axis-label')
      .attr('transform', 'translate(' + d3.max(x0.range()) / 2 + ', 30)')
      .text(labelXaxis);

  gridsContainerD3Selection
    .append('g')
      .attr('class', 'grid-x')
      .attr('transform', 'translate(0,' + (graphHeight + graphMargin.bottom) + ')')
      .call(d3.axisTop(x0)
        .tickFormat('')
        .tickSize(graphHeight + graphMargin.bottom));

  axesContainerD3Selection
    .append('g')
      .attr('class', 'axis-y')
      .call(d3.axisLeft(y))
    .append('text')
      .attr('class', 'axis-label')
      .attr('transform', 'translate(-35,' + d3.max(y.range()) / 2 + '), rotate(-90)')
      .text(labelYaxis);

  gridsContainerD3Selection
    .append('g')
      .attr('class', 'grid-y')
      .call(d3.axisRight(y)
        .tickFormat('')
        .tickSize(graphWidth));

  legendTitleContainer
    .text('FloorName');

  var legend = legendContainerD3Selection
    .selectAll('g')
    .data(itemNames.slice())
    .enter().append('g')
      .attr('transform', function(d, i) {
        return 'translate(0,' + i * 21 + ')';
      });

  legend.append('rect')
      .attr('width', 20)
      .attr('height', 20)
      .attr('fill', z);

  legend.append('text')
    .attr('x', 22)
    .attr('y', 10)
    .attr('dy', '0.32em')
    .text(function(d) {
      return d;
    });
}

$(window).on('resize', function() {
  BarChart(graphData);
});