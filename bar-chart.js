function BarChart() {
  // data
  var chartData = {};
  var itemNames = [];
  var xAxisKeys = [];

  // dimensions
  const chartMargin = { bottom: 40, left: 50, right: 10, top: 10 };
  const chartPadding = { bottom: 20, left: 0, right: 0, top: 0 };
  const legendHeight = 21;
  const legendRectSize = { height: 12, width: 12 };
  const legendTitleHeight = 20;
  const legendWidth = 100;

  var backgroundRectSize = {};
  var chartContainerSize = {};
  var chartSize = {};
  var chartSVGSize = {};
  var legendContainerSize = {};
  var legendContentContainerSize = {};
  var legendSVGSize = {};
  var mainContainerSize = {};
  var xPanning = 0;
  var xScaleFactor = 1;

  // containers
  var barChartSelection = null;
  var barGroupEnterSelection = null;
  var barGroupExitSelection = null;
  var barGroupMergedEnterUpdateSelection = null;
  var barGroupUpdateSelection = null;
  var barEnterSelection = null;
  var barExitSelection = null;
  var barsSelection = null;
  var barUpdateSelection = null;
  var barMergedEnterUpdateSelection = null;
  var chartBackgroundSelection = null;
  var chartContainer = null;
  var legendContainer = null;
  var legendContentContainer = null;
  var legendContentSelection = null;
  var legendRectMergedEnterUpdateSelection = null;
  var legendTextMergedEnterUpdateSelection = null;
  var legendsEnterSelection = null;
  var legendsExitSelection = null;
  var legendsMergedEnterUpdateSelection = null;
  var legendsUpdateSelection = null;
  var legendTitleContainer = null;
  var svgChartSelection = null;
  var svgLegendSelection = null;
  var xAxisLeftCoverRectSelection = null;
  var xAxisLabelSelection = null;
  var xAxisRightCoverRectSelection = null;
  var xAxisSelection = null;
  var xGridsSelection = null;
  var yAxisLabelSelection = null;
  var yAxisSelection = null;
  var yGridsSelection = null;
  var zoomLayerSelection = null;

  // scales
  var colorScale = null;
  var xBarGroupeScale = null;
  var xScale = null;
  var yScale = null;

  // events
  var zoom = null;

  // time format
  const parseDate = d3.timeParse('%A, %B %d, %Y %I:%M:%S %p');

  function chart() {
    if (!dataset || !mainContainer) return;

    chartData = GetBarChartData(dataset);

    Init();
    GetDimensions();
    SetDimensions();
    UpdateScale();
    DrawChart();
    DrawLegend();
  }

  chart.dataset = function(value) {
    if (!arguments.length) return dataset;
    dataset = value;
    return chart;
  }

  chart.mainContainer = function(value) {
    if (!arguments.length) return mainContainer;
    mainContainer = value;
    return chart;
  }

  function GetBarChartData(data) {
    if (!data) return null;

    var dataset = {
      formatXaxis: '',
      labelXaxis: '',
      labelYaxis: '',
      data: []
    };

    dataset.formatXaxis = data.xAxisDateFormat;
    dataset.labelXaxis = data.XaxisText;
    dataset.labelYaxis = data.YaxisText === '0' ? 'kWh' : data.YaxisText;

    if (data.GraphPointsList.length === 0) {
      console.log('There is no GraphPointsList!');
      return;
    }

    if (data.GraphPointsList[0].GraphPointList.length === 0) {
      console.log('There is no GraphPointList!');
      return;
    }

    data.GraphPointsList.forEach(function(graphPointsList) {
      graphPointsList.GraphPointList.forEach(function(graphPoint) {
        if (graphPoint.Yaxis !== null) graphPoint.Yaxis = +graphPoint.Yaxis;
        graphPoint.Xaxis = parseDate(graphPoint.Xaxis);
      });
    });

    itemNames = data.GraphPointsList.map((d) => d.ItemName);
    xAxisKeys = data.GraphPointsList[0].GraphPointList.map((d) => d.Xaxis);

    xAxisKeys.forEach((xAxisKey) => {
      var item = {key: null};
      item.key = xAxisKey;
      data.GraphPointsList.forEach((graphPoints) => {
        for (var i = 0; i < graphPoints.GraphPointList.length; i ++) {
          if (graphPoints.GraphPointList[i].Xaxis.getTime() === xAxisKey.getTime() &&
            !(graphPoints.GraphPointList[i].Yaxis === 0 ||
              graphPoints.GraphPointList[i].Yaxis === null)) {
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

      if (groupItemNames.length > 0) dataset.data.push(item);
    });

    return dataset;
  }

  function GetGroupItemNames(data) {
    let keys = Object.keys(data);
    keys.splice(keys.indexOf('key'), 1);
    return keys;
  }

  function Init() {
    zoom = d3.zoom()
      .scaleExtent([1, 10])
      .on('zoom', function() {
        xScaleFactor = d3.event.transform.k;
        xPanning = d3.min([0, d3.max([d3.event.transform.x, chartSize.width * (1 - xScaleFactor)])]);
        d3.event.transform.x = xPanning;

        GetDimensions();
        SetDimensions();
        UpdateScale();
        DrawChart();
        DrawLegend();
      });

    chartContainer = mainContainer
      .append('div')
        .attr('class', 'chart-container');
    svgChartSelection = chartContainer
      .append('svg');

    chartBackgroundSelection = svgChartSelection
      .append('rect')
        .attr('class', 'chart-background');

    barChartSelection = svgChartSelection
      .append('g')
        .attr('class', 'bar-chart');
    xGridsSelection = barChartSelection
      .append('g')
        .attr('class', 'grids-x');
    yGridsSelection = barChartSelection
      .append('g')
        .attr('class', 'grids-y');
    xAxisSelection = barChartSelection
      .append('g')
        .attr('class', 'axis-x');
    
    barsSelection = barChartSelection
      .append('g')
        .attr('class', 'bars');
    barGroupUpdateSelection = barsSelection
      .selectAll('.bar-group')
      .data(chartData.data);
    barGroupEnterSelection = barGroupUpdateSelection.enter();
    barGroupExitSelection = barGroupUpdateSelection.exit();

    barGroupExitSelection.remove();

    barGroupMergedEnterUpdateSelection = barGroupEnterSelection
      .append('g')
        .attr('class', 'bar-group')
      .merge(barGroupUpdateSelection);

    barUpdateSelection = barGroupMergedEnterUpdateSelection
      .selectAll('.bar')
      .data((d) => {
        let groupItemNames = GetGroupItemNames(d);
        return groupItemNames.map((itemName) => ({key: itemName, value: d[itemName]}));
      });
    barEnterSelection = barUpdateSelection.enter();
    barExitSelection = barUpdateSelection.exit();

    barExitSelection.remove();

    barMergedEnterUpdateSelection = barEnterSelection
      .append('rect')
        .attr('class', 'bar')
      .merge(barEnterSelection);

    xAxisLeftCoverRectSelection = barChartSelection
      .append('rect')
        .attr('class', 'cover-x');
    xAxisRightCoverRectSelection = barChartSelection
      .append('rect')
        .attr('class', 'cover-x');
    yAxisSelection = barChartSelection
      .append('g')
        .attr('class', 'axis-y');

    xAxisLabelSelection = barChartSelection
      .append('text')
        .attr('class', 'label-x');
    yAxisLabelSelection = barChartSelection
      .append('text')
        .attr('class', 'label-y');

    legendContainer = mainContainer
      .append('div')
        .attr('class', 'legend-container');
    legendTitleContainer = legendContainer
      .append('div')
        .attr('class', 'legend-title-container')
        .text('FloorName');
    legendContentContainer = legendContainer
      .append('div')
        .attr('class', 'legend-content-container');
    svgLegendSelection = legendContentContainer
      .append('svg');
    legendContentSelection = svgLegendSelection
      .append('g')
        .attr('class', 'legends');
    legendsUpdateSelection = legendContentSelection
      .selectAll('.legend')
      .data(itemNames);
    legendsEnterSelection = legendsUpdateSelection.enter();
    legendsExitSelection = legendsUpdateSelection.exit();

    legendsExitSelection.remove();

    legendsMergedEnterUpdateSelection = legendsEnterSelection
      .append('g')
        .attr('class', 'legend')
      .merge(legendsUpdateSelection);

    legendRectMergedEnterUpdateSelection = legendsMergedEnterUpdateSelection
      .append('rect')
        .attr('class', 'legend-rect')
      .merge(legendsMergedEnterUpdateSelection);

    legendTextMergedEnterUpdateSelection = legendsMergedEnterUpdateSelection
      .append('text')
        .attr('class', 'legend-text')
      .merge(legendsMergedEnterUpdateSelection);

    zoomLayerSelection = svgChartSelection
      .append('rect')
        .attr('class', 'zoom-layer');

    colorScale = d3.scaleOrdinal()
      .range(['#F8766D', '#00BA38', '#619CFF', '#6b486b', '#a05d56', '#d0743c', '#ff8c00']);
    xBarGroupeScale = d3.scaleBand()
      .domain(itemNames);
    xScale = d3.scaleBand()
      .domain(chartData.data.map((datum) => datum.key))
      .paddingInner(0.1)
      .paddingOuter(0.1);
    yScale = d3.scaleLinear();
  }

  function GetDimensions() {
    mainContainerSize = mainContainer
      .node()
      .getBoundingClientRect();

    chartContainerSize = {
      height: mainContainerSize.height,
      width: mainContainerSize.width - legendWidth
    };
    chartSVGSize = {
      height: chartContainerSize.height,
      width: chartContainerSize.width
    };
    chartSize = {
      height: chartSVGSize.height - chartMargin.bottom - chartMargin.top - chartPadding.bottom - chartPadding.top,
      width: chartSVGSize.width - chartMargin.left - chartMargin.right - chartPadding.left - chartPadding.right
    };
    backgroundRectSize = {
      height: chartSize.height + chartPadding.bottom + chartPadding.top,
      width: chartSize.width + chartPadding.left + chartPadding.right
    };

    legendContainerSize = {
      height: chartContainerSize.height - chartMargin.bottom - chartMargin.top - chartPadding.bottom - chartPadding.top,
      width: legendWidth
    };
    legendContentContainerSize = {
      height: legendContainerSize.height - legendTitleHeight,
      width: legendContainerSize.width
    };
    legendSVGSize = {
      height: itemNames.length * legendHeight,
      width: legendContentContainerSize.width
    };
  }

  function SetDimensions() {
    chartContainer
      .style('height', chartContainerSize.height + 'px')
      .style('width', chartContainerSize.width + 'px');
    legendContainer
      .style('height', legendContainerSize.height + 'px')
      .style('width', legendContainerSize.width + 'px');
    legendContentContainer
      .style('height', legendContentContainerSize.height + 'px')
      .style('width', legendContentContainerSize.width + 'px');
    legendTitleContainer
      .style('padding-top', (chartMargin.top + chartPadding.top) + 'px');
    
    svgChartSelection
      .attr('height', chartSVGSize.height)
      .attr('width', chartSVGSize.width);
    svgLegendSelection
      .attr('height', legendSVGSize.height)
      .attr('width', legendSVGSize.width);
    chartBackgroundSelection
      .attr('height', backgroundRectSize.height)
      .attr('width', backgroundRectSize.width)
      .attr('transform', 'translate(' + (chartMargin.left + chartPadding.left) + ',' + (chartMargin.top + chartPadding.top) + ')');
    zoomLayerSelection
      .attr('height', backgroundRectSize.height)
      .attr('width', backgroundRectSize.width)
      .attr('transform', 'translate(' + (chartMargin.left + chartPadding.left) + ',' + chartMargin.top + ')');
    barChartSelection
      .attr('transform', 'translate(' + (chartMargin.left + chartPadding.left) + ',' + chartMargin.top + ')');
    xAxisLeftCoverRectSelection
      .attr('width', chartMargin.left + chartPadding.left)
      .attr('height', chartSVGSize.height)
      .attr('transform', 'translate(' + (-chartMargin.left - chartPadding.left) + ',0)');
    xAxisRightCoverRectSelection
      .attr('width', chartMargin.right + chartPadding.right)
      .attr('height', chartSVGSize.height)
      .attr('transform', 'translate(' + chartSize.width + ',0)');
    xAxisSelection
      .attr('transform', 'translate(0,' + (chartSize.height + chartPadding.bottom) + ')');
    xGridsSelection
      .attr('transform', 'translate(0,' + (chartSize.height + chartMargin.bottom) + ')');
    xAxisLabelSelection
      .text(chartData.labelXaxis);
    yAxisLabelSelection
      .text(chartData.labelYaxis);
  }

  function UpdateScale() {
    xScale
      .rangeRound([xPanning, xPanning + chartSize.width * xScaleFactor]);
    yScale
      .rangeRound([chartSize.height, 0])
      .domain([0, d3.max(chartData.data, (d) => {
        let groupItemNames = GetGroupItemNames(d);
        return d3.max(groupItemNames, (itemName) => d[itemName].Yaxis);
      })])
      .nice();
    xBarGroupeScale
      .rangeRound([0, xScale.bandwidth()]);
  }

  function DrawChart() {
    xAxisSelection
      .call(d3.axisBottom(xScale)
        .tickFormat(d3.timeFormat(chartData.formatXaxis)));
    yAxisSelection
      .call(d3.axisLeft(yScale));
    xGridsSelection
      .call(d3.axisTop(xScale)
        .tickFormat('')
        .tickSize(chartSize.height + chartMargin.bottom));
    yGridsSelection
      .call(d3.axisRight(yScale)
        .tickFormat('')
        .tickSize(chartSize.width));

    xAxisLabelSelection
      .attr('transform', 'translate(' + chartSize.width / 2 + ',' + (chartSVGSize.height - xAxisSelection.node().getBBox().height) + ')');
    yAxisLabelSelection
      .attr('dy', -5)
      .attr('transform', 'translate(' + (-yAxisSelection.node().getBBox().width) + ',' + chartSize.height / 2 + '), rotate(-90)');

    barGroupMergedEnterUpdateSelection
      .attr('transform', (d) => ('translate(' + xScale(d.key) + ',0)'));

    barMergedEnterUpdateSelection
      .attr('x', (d, i) => (xBarGroupeScale.step() * d.value.Xaxis * i))
      .attr('y', (d) => yScale(d.value.Yaxis))
      .attr('width', (d) => (xBarGroupeScale.bandwidth() * d.value.Xaxis))
      .attr('height', (d) => (chartSize.height - yScale(d.value.Yaxis)))
      .attr('fill', (d) => colorScale(d.key))

    zoomLayerSelection
      .call(zoom);
  } 

  function DrawLegend() {
    legendsMergedEnterUpdateSelection
      .attr('transform', function(d, i) {
        return 'translate(0,' + i * legendHeight + ')';
      });

    legendRectMergedEnterUpdateSelection
      .attr('height', legendRectSize.height)
      .attr('width', legendRectSize.width)
      .attr('fill', colorScale);

    legendTextMergedEnterUpdateSelection
      .attr('x', 10)
      .attr('y', 10)
      .attr('dx', 3)
      .text((d) => d);
  }

  function GetTextSize(text, fontSize, fontWeight) {
    const bodySelection = d3.select('body')
      .append('svg');

    bodySelection
      .append('text')
        .attr('x', -99999)
        .attr('y', -99999)
        .style('font-size', fontSize + 'px')
        .style('font-weight', fontWeight)
        .text(text);

    var textSize = bodySelection
      .node()
      .getBBox();
    bodySelection.remove();
    return textSize;
  }

  $(window).on('resize', function() {
    GetDimensions();
    SetDimensions();
    UpdateScale();
    DrawChart();
    DrawLegend();
  });

  return chart;
}

var chart = BarChart();

d3.json('sample_data.json', function(chartData) {
  const mainContainer = d3.select('#plugloadsGraph');
  chart.mainContainer(mainContainer);
  chart.dataset(chartData);

  chart();
});
