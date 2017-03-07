function BarChart() {
  // global
  var _this = this;
  // constants
  const mainContainerPadding = { bottom: 10, left: 10, right: 10, top: 10 };
  const chartMargin = { bottom: 40, left: 50, right: 10, top: 10 };
  const chartPadding = { bottom: 20, left: 0, right: 0, top: 0 };
  const legendPaddingBottom = 3;
  const legendRectSize = { height: 12, width: 12 };
  const legendTextMaringLeft = 3;
  const legendTitleMarginBottom = 5;
  const legendWidth = 100;
  // input data
  var mainContainer = null;
  var dataset = {};
  var labelLegend = '';
  var labelXaxis = '';
  var labelYaxis = '';
  var xAxisDateFormat = '';
  var itemNames = [];
  var xAxisKeys = [];
  // data
  var chartData = {};
  var itemNames = [];
  var xAxisKeys = [];
  // dimensions
  var backgroundRectSize = {};
  var chartContainerSize = {};
  var chartSize = {};
  var chartSVGSize = {};
  var legendContainerSize = {};
  var legendContentContainerSize = {};
  var legendContainerMarginTop = 0;
  var legendSVGSize = {};
  var legendSize = {};
  var legendTitleSize = {};
  var mainContainerSize = {};
  var xPanning = 0;
  var xScaleFactor = 1;
  // translations
  var chartTranslate = {};
  var legendTranslate = {};
  var xAxisTranslate = {};
  var yAxisTranslate = {};
  var xAxisLabelTranslate = {};
  var yAxisLabelTranslate = {};
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
  // scales
  var colorScale = null;
  var xBarGroupeScale = null;
  var xScale = null;
  var yScale = null;
  // tooltip
  var tooltip = null;
  // events
  var zoom = null;
  // time format
  const parseDate = d3.timeParse('%A, %B %d, %Y %I:%M:%S %p');
  // format
  const numberFormat = (d) => (Math.round(d * 100) / 100);

  this.chart = function() {
    if (!dataset || !mainContainer) return;

    chartData = this.GetBarChartData(dataset);

    this.Init();
    this.GetDimensions();
    this.GetTranslations();
    this.SetDimensions();
    this.UpdateScale();
    this.DrawChart();
    this.DrawLegend();
  }

  this.Dataset = function(value) {
    if (!arguments.length) return dataset;
    dataset = value;
  }

  this.MainContainerID = function(value) {
    if (!arguments.length) {
      if (mainContainer === null) return null;
      return mainContainer.attr('id');
    }
    mainContainer = d3.select('#' + value);
  }

  /*
   *  label of legend
   */
  this.LegendLabel = function(value) {
    if (!arguments.length) return labelLegend;
    labelLegend = value;
  }

  /*
   *  text of x-axis
   */
  this.LabelXaxis = function(value) {
    if (!arguments.length) return labelXaxis;
    labelXaxis = value;
  }

  /*
   *  label of y-axis
   */
  this.LabelYaxis = function(value) {
    if (!arguments.length) return labelYaxis;
    labelYaxis = value;
  }

  /*
   *  format of x-axis date
   */
  this.XAxisDateFormat = function(value) {
    if (!arguments.length) return xAxisDateFormat;
    xAxisDateFormat = value;
  }

  /*
   *  item names
   */
  this.ItemNames = function(value) {
    if (!arguments.length) return itemNames;
    itemNames = value;
  }

  /*
   *  keys of x-axis values
   */
  this.XAxisKeys = function(value) {
    if (!arguments.length) return xAxisKeys;
    xAxisKeys = value;
  }

  this.GetBarChartData = function(data) {
    if (!data) return null;

    if (data.length === 0) {
      console.log('There is no GraphPointsList!');
      return;
    }

    var dataset = {
      formatXaxis: '',
      labelXaxis: '',
      labelYaxis: '',
      data: data
    };

    dataset.formatXaxis = xAxisDateFormat;
    dataset.labelXaxis = labelXaxis;
    dataset.labelYaxis = labelYaxis;
    dataset.legendTitle = labelLegend;

    dataset.data.forEach(function(d) {
      if (d.items.length <= 0) return;
      d.items.forEach(function(item) {
        item.Xaxis = itemNames.length / d.items.length;
      });
    });

    return dataset;
  }

  this.Init = function() {
    tooltip = d3.select('body')
      .append('div')
      .attr('class', 'toolTip');

    zoom = d3.zoom()
      .scaleExtent([1, 10])
      .on('zoom', function() {
        xScaleFactor = d3.event.transform.k;
        xPanning = d3.min([0, d3.max([d3.event.transform.x, chartSize.width * (1 - xScaleFactor)])]);
        d3.event.transform.x = xPanning;

        _this.GetDimensions();
        _this.GetTranslations();
        _this.SetDimensions();
        _this.UpdateScale();
        _this.DrawChart();
        _this.DrawLegend();
      });

    mainContainer
      .selectAll('*')
      .remove();

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
      .data((d) => d.items);

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
        .text(chartData.legendTitle);
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

    colorScale = d3.scaleOrdinal()
      .range(['#F8766D', '#A3A500', '#00BF7D', '#00B0F6', '#E76BF3', '#F7C049']);

    xScale = d3.scaleBand()
      .domain(xAxisKeys)
      .paddingInner(0.05)
      .paddingOuter(0.05);
    yScale = d3.scaleLinear();
    xBarGroupeScale = d3.scaleBand()
      .domain(itemNames);
  }

  this.GetDimensions = function() {
    mainContainerSize = mainContainer
      .node()
      .getBoundingClientRect();

    mainContainerSize = {
      height: mainContainerSize.height - mainContainerPadding.bottom - mainContainerPadding.top,
      width: mainContainerSize.width - mainContainerPadding.left - mainContainerPadding.right,
    };

    // calculation legend width
    legendTitleSize = GetTextSize(chartData.legendTitle, 12, 'bold');
    legendSize = {
      height: GetTextSize('A', 12, 'normal').height + legendPaddingBottom,
      width: legendRectSize.width + legendTextMaringLeft + d3.max(itemNames, (itemName) => (GetTextSize(itemName, 12, 'normal').width))
    };

    legendContainerSize = {
      height: mainContainerSize.height - chartMargin.bottom - chartMargin.top - legendTitleMarginBottom,
      width: d3.max([legendTitleSize.width, legendSize.width])
    };

    chartContainerSize = {
      height: mainContainerSize.height,
      width: mainContainerSize.width - legendContainerSize.width * 1.2
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

    legendSVGSize = {
      height: itemNames.length * legendSize.height,
      width: legendContainerSize.width
    };
    legendContainerMarginTop = mainContainerPadding.top + chartMargin.top + d3.max([0, (backgroundRectSize.height - legendTitleSize.height - legendTitleMarginBottom - legendSVGSize.height) / 2]);
    legendContentContainerSize = {
      height: legendContainerSize.height - legendTitleSize.height - legendContainerMarginTop,
      width: legendContainerSize.width
    };
  }

  this.GetTranslations = function() {
    xAxisTranslate = {
      x: 0,
      y: backgroundRectSize.height
    };
    yAxisTranslate = {
      x: 0,
      y: 0
    };
    xAxisLabelTranslate = {
      x: chartSize.width / 2,
      y: mainContainerSize.height - chartMargin.top
    };
    yAxisLabelTranslate = {
      x: -chartMargin.left,
      y: chartSize.height / 2
    };
  }

  this.SetDimensions = function() {
    chartContainer
      .style('height', chartContainerSize.height + 'px')
      .style('width', chartContainerSize.width + 'px')
      .style('margin-left', mainContainerPadding.left + 'px')
      .style('margin-top', mainContainerPadding.top + 'px');
    legendContainer
      .style('margin-top', legendContainerMarginTop + 'px');
    legendContentContainer
      .style('height', legendContentContainerSize.height + 'px')
    legendTitleContainer
      .style('margin-bottom', legendTitleMarginBottom + 'px');
    
    svgChartSelection
      .attr('height', chartSVGSize.height)
      .attr('width', chartSVGSize.width)
      .call(zoom);
    svgLegendSelection
      .attr('height', legendSVGSize.height)
      .attr('width', legendSVGSize.width);
    chartBackgroundSelection
      .attr('height', backgroundRectSize.height)
      .attr('width', backgroundRectSize.width)
      .attr('transform', 'translate(' + (chartMargin.left + chartPadding.left) + ',' + (chartMargin.top + chartPadding.top) + ')');
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
      .attr('transform', 'translate(' + xAxisTranslate.x + ',' + xAxisTranslate.y + ')');
    yAxisSelection
      .attr('transform', 'translate(' + yAxisTranslate.x + ',' + yAxisTranslate.y + ')');
    xGridsSelection
      .attr('transform', 'translate(0,' + (chartSize.height + chartMargin.bottom) + ')');
    xAxisLabelSelection
      .attr('transform', 'translate(' + xAxisLabelTranslate.x + ',' + xAxisLabelTranslate.y + ')')
      .text(chartData.labelXaxis);
    yAxisLabelSelection
      .attr('transform', 'translate(' + yAxisLabelTranslate.x + ',' + yAxisLabelTranslate.y + '), rotate(-90)')
      .text(chartData.labelYaxis);
  }

  this.UpdateScale = function() {
    xScale
      .rangeRound([xPanning, xPanning + chartSize.width * xScaleFactor]);
    yScale
      .rangeRound([chartSize.height, 0])
      .domain([0, d3.max(chartData.data, (d) => d3.max(d.items, (item) => item.Yaxis))])
      .nice();
    xBarGroupeScale
      .range([0, xScale.bandwidth()]);
  }

  this.DrawChart = function() {
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

    barGroupMergedEnterUpdateSelection
      .attr('transform', (d) => ('translate(' + xScale(d.itemName) + ',0)'));

    barMergedEnterUpdateSelection
      .attr('x', (d, i) => (xBarGroupeScale.bandwidth() * d.Xaxis * i))
      .attr('y', (d) => yScale(d.Yaxis))
      .attr('width', (d) => (xBarGroupeScale.bandwidth() * d.Xaxis))
      .attr('height', (d) => (chartSize.height - yScale(d.Yaxis)))
      .attr('fill', (d) => colorScale(d.itemName))
      .on('mousemove', function(d){
        tooltip
          .style('left', (d3.event.pageX) + 'px')
          .style('top', (d3.event.pageY - 30) + 'px')
          .style('display', 'inline-block')
          .html('<div><span>' + d3.timeFormat(chartData.formatXaxis)(d.Xaxis) + '</span>' + 
            '<br><span>' + d.itemName + ' : ' + numberFormat(d.Yaxis) + '</span></div>');
      })
      .on('mouseout', function(d){ tooltip.style('display', 'none');});
  } 

  this.DrawLegend = function() {
    legendsMergedEnterUpdateSelection
      .attr('transform', function(d, i) {
        return 'translate(0,' + i * legendSize.height + ')';
      });

    legendRectMergedEnterUpdateSelection
      .attr('height', legendRectSize.height)
      .attr('width', legendRectSize.width)
      .attr('fill', colorScale);

    legendTextMergedEnterUpdateSelection
      .attr('x', legendRectSize.width + legendTextMaringLeft)
      .style('font-size', legendRectSize.height)
      .text((d) => d);
  }

  $(window).on('resize', function() {
    _this.GetDimensions();
    _this.GetTranslations();
    _this.SetDimensions();
    _this.UpdateScale();
    _this.DrawChart();
    _this.DrawLegend();
  });
}
