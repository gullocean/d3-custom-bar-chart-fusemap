function Heatmap() {
  // input data
  var legendLabel = '';
  var chartTitle = '';
  var isPercent = false;
  var showCardLabel = false;
  var mainContainer = null;
  var dataset = {};
  var colorRange = ['#EBF1F1','#43AEA8'];
  var labelYaxis = '';
  // global
  var _this = this;
  // data
  var chartData = {};
  var chartDataExtent = [];
  var legendData = [];

  // dimensions
  const chartMargin = { bottom: 10, left: 10, right: 10, top: 10 };
  const chartPadding = { bottom: 10, left: 0, right: 10, top: 0 };
  const legendSize = { height: 20, width: 20 };
  const legendsCNT = 10;
  const xAxisTextHeight = 20;
  const YaxisTextWidth = 20;
  const fontSize = {
    normal: 16,
    large: 18
  };
  const minCardHeight = 30;

  var axisTicksize = {};
  var cardSize = {};
  var cardsSize = {};
  var cardsTranslate = {};
  var chartSize = {};
  var chartTitleSize = {};
  var chartTitleTranslate = {};
  var chartTranslate = {};
  var legendLabelSize = {};
  var legendRectSize = {};
  var legendTitleTextSize = {};
  var legendTranslate = {};
  var mainContainerSize = {};
  var svgSize = {};
  var xAxisLabelSize = {height: 0, width: 0};
  var xAxisLabelTranslate = {};
  var xAxisTranslate = {};
  var yAxisLabelSize = {};
  var yAxisLabelTranslate = {};
  var yAxisTranslate = {};

  // selections
  var cardLabelsEnterSelection = null;
  var cardLabelsExitSelection = null;
  var cardLabelsMergedEnterUpdateSelection = null;
  var cardLabelsSelection = null;
  var cardLabelsUpdateSelection = null;
  var cardRowsEnterSelection = null;
  var cardRowsExitSelection = null;
  var cardRowsMergedEnterUpdateSelection = null;
  var cardRowsUpdateSelection = null;
  var cardsMergedEnterUpdateSelection = null;
  var cardsEnterSelection = null;
  var cardsExitSelection = null;
  var cardsSelection = null;
  var cardsUpdateSelection = null;
  var chartSelection = null;
  var chartTitleSelection = null;
  var legendEnterSelection = null;
  var legendExitSelection = null;
  var legendMergedEnterUpdateSelection = null;
  var legendTextSelection = null;
  var legendTitleTextSelection = null;
  var legendRectSelection = null;
  var legendUpdateSelection = null;
  var legendsSelection = null;
  var svgSelection = null;
  var xAxisLabelSelection = null;
  var xAxisTextsEnterSelection = null;
  var xAxisTextsExitSelection = null;
  var xAxisTextsSelection = null;
  var xAxisTextsMergedEnterUpdateSelection = null;
  var xAxisTextsUpdateSelection = null;
  var yAxisLabelSelection = null;
  var yAxisTextsEnterSelection = null;
  var yAxisTextsExitSelection = null;
  var yAxisTextsSelection = null;
  var yAxisTextsMergedEnterUpdateSelection = null;
  var yAxisTextsUpdateSelection = null;

  // scales
  var colorScale = null;

  // tooltip
  var tooltip = null;

  // format
  numberFormat = (d) => (Math.round(d * 100) / 100 + (isPercent ? '%' : ''));

  this.ColorRange = function(value) {
    if (!arguments.length) return colorRange;
    colorRange = value;
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
   *  flag for showing of label on card
   */
  this.ShowCardLabel = function(value) {
    if (!arguments.length) return showCardLabel;
    showCardLabel = value;
  }

  /*
   *  flag : true if Yaxis is a value of percent
   */
  this.IsPercent = function(value) {
    if (!arguments.length) return isPercent;
    isPercent = value;
  }

  /*
   *  label of legend
   */
  this.LegendLabel = function(value) {
    if (!arguments.length) return legendLabel;
    legendLabel = value;
  }

  /*
   *  title of chart
   */
  this.ChartTitle = function(value) {
    if (!arguments.length) return chartTitle;
    chartTitle = value;
  }

  /*
   *  label of y-axis
   */
  this.LabelYaxis = function(value) {
    if (!arguments.length) return labelYaxis;
    labelYaxis = value;
  }
  
  this.chart = function() {
    if (!dataset || !mainContainer) return;

    chartData = this.GetHeatmapData(dataset);
    
    chartDataExtent = [d3.min(chartData.data, (d) => (d3.min(d.items, (item) => item.Yaxis))),
                      d3.max(chartData.data, (d) => (d3.max(d.items, (item) => item.Yaxis)))];
    
    for (var i = 0; i < legendsCNT; i ++) {
      legendData.push(chartDataExtent[0] + i * (chartDataExtent[1] - chartDataExtent[0]) / legendsCNT);
    }

    this.Init();
    this.GetDimensions();
    this.SetDimensions();
    this.UpdateScale();
    this.DrawChart();
    this.DrawLegend();
  }

  this.GetHeatmapData = function(data) {
    if (!data) return null;

    var dataset = {
      formatXaxis: '',
      labelXaxis: '',
      labelYaxis: '',
      xAxisKeys: [],
      yAxisKeys: [],
      data: []
    };

    dataset.formatXaxis = data.xAxisDateFormat;
    dataset.labelXaxis = data.XaxisText;
    dataset.labelYaxis = data.YaxisText === '0' ? labelYaxis : data.YaxisText;
    dataset.legendTitle = legendLabel;
    dataset.chartTitle = chartTitle;

    if (data.GraphPointsList.length === 0) {
      console.log('There is no GraphPointsList!');
      return;
    }

    if (data.GraphPointsList[0].GraphPointList.length === 0) {
      console.log('There is no GraphPointList!');
      return;
    }

    data.GraphPointsList.forEach(function(graphPointsList, floorIndex) {
      dataset.data.push({
        itemName: graphPointsList.ItemName,
        items: []
      });

      graphPointsList.GraphPointList.forEach(function(graphPoint) {
        if (graphPoint.Yaxis !== null) {
          dataset.data[floorIndex].items.push({
            itemName: dataset.data[floorIndex].itemName,
            Xaxis: new Date(graphPoint.Xaxis),
            Yaxis: +graphPoint.Yaxis
          });
        }
      });
    });

    dataset.xAxisKeys = dataset.data[0].items.map((d) => d.Xaxis);
    dataset.yAxisKeys = dataset.data.map((d) => d.itemName);

    return dataset;
  }

  this.DrawChart = function() {
    chartSelection
      .attr('transform', 'translate(' + chartTranslate.x + ',' + chartTranslate.y +')');

    cardsSelection
      .attr('transform', 'translate(' + cardsTranslate.x + ',' + cardsTranslate.y + ')');

    cardRowsMergedEnterUpdateSelection
      .attr('transform', (d, i) => ('translate(0,' + (i * cardSize.height) + ')'));

    cardsMergedEnterUpdateSelection
      .attr('height', cardSize.height)
      .attr('width', cardSize.width)
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('x', (d, i) => (i * cardSize.width))
      .attr('fill', (d) => colorScale(d.Yaxis))
      .on('mousemove', function(d){
        tooltip
          .style('left', (d3.event.pageX) + 'px')
          .style('top', (d3.event.pageY - 30) + 'px')
          .style('display', 'inline-block')
          .html('<div><span>' + d3.timeFormat(chartData.formatXaxis)(d.Xaxis) + '</span>' + 
            '<br><span>' + d.itemName + ' : ' + numberFormat(d.Yaxis) + '</span></div>');
      })
      .on('mouseout', function(d){ tooltip.style('display', 'none');});

    if (showCardLabel) {
      cardLabelsMergedEnterUpdateSelection
        .attr('x', (d, i) => ((i + 0.5) * cardSize.width))
        .attr('y', 0.5 * cardSize.height)
        .text((d) => numberFormat(d.Yaxis));
    }

    xAxisTextsSelection
      .attr('transform', 'translate(' + xAxisTranslate.x + ',' + xAxisTranslate.y + ')');

    xAxisTextsMergedEnterUpdateSelection
      .attr('x', (d, i) => ((i + 0.5) * cardSize.width))
      .attr('dy', axisTicksize.height)
      .text((d) => d3.timeFormat(chartData.formatXaxis)(d));

    chartTitleSelection
      .attr('transform', 'translate(' + chartTitleTranslate.x + ',' + chartTitleTranslate.y + ')')
      .text(chartData.chartTitle);

    xAxisLabelSelection
      .attr('transform', 'translate(' + xAxisLabelTranslate.x + ',' + xAxisLabelTranslate.y + ')')
      .style('font-size', fontSize.large)
      .style('text-transform', 'capitalize')
      .text(chartData.labelXaxis);

    yAxisLabelSelection
      .attr('transform', 'translate(' + yAxisLabelTranslate.x + ',' + yAxisLabelTranslate.y + '), rotate(-90)')
      .style('font-size', fontSize.large)
      .style('text-transform', 'capitalize')
      .text(chartData.labelYaxis);

    yAxisTextsSelection
      .attr('transform', 'translate(' + yAxisTranslate.x + ',' + yAxisTranslate.y + ')');

    yAxisTextsMergedEnterUpdateSelection
      .attr('y', (d, i) => ((i + 0.5) * cardSize.height))
      .attr('dx', -2)
      .text((d) => d);
  }

  this.DrawLegend = function() {
    legendsSelection
      .attr('transform', 'translate(' + legendTranslate.x + ',' + legendTranslate.y + ')');

    legendRectSelection
      .attr('height', legendRectSize.height)
      .attr('width', legendRectSize.width)
      .attr('y', (d, i) => ((legendsCNT - i - 1) * legendRectSize.height))
      .attr('fill', (d) => colorScale(d));

    legendTextSelection
      .attr('x', legendRectSize.width)
      .attr('y', (d, i) => ((legendsCNT - i) * legendRectSize.height))
      .attr('dx', 2)
      .text((d) => numberFormat(d));

    legendTitleTextSelection
      .attr('x', legendRectSize.width)
      .attr('dx', 2)
      .text(chartData.legendTitle);
  }

  this.Init = function() {
    tooltip = d3.select('body')
      .append('div')
      .attr('class', 'toolTip');

    colorScale = d3.scaleLinear()
      .range(colorRange);

    mainContainer
      .selectAll('*')
      .remove();

    svgSelection = mainContainer
      .append('svg');

    chartSelection = svgSelection
      .append('g')
        .attr('class', 'chart');
    cardsSelection = chartSelection
      .append('g')
        .attr('class', 'cards');
    cardRowsUpdateSelection = cardsSelection
      .selectAll('.card-row')
      .data(chartData.data);
    cardRowsEnterSelection = cardRowsUpdateSelection.enter();
    cardRowsExitSelection = cardRowsUpdateSelection.exit();
    
    cardRowsExitSelection.remove();

    cardRowsMergedEnterUpdateSelection = cardRowsEnterSelection
      .append('g')
        .attr('class', 'card-row')
      .merge(cardRowsUpdateSelection);

    cardsUpdateSelection = cardRowsMergedEnterUpdateSelection
      .selectAll('card')
      .data((d) => d.items);
    cardsEnterSelection = cardsUpdateSelection.enter();
    cardsExitSelection = cardsUpdateSelection.exit();

    cardsExitSelection.remove();

    cardsMergedEnterUpdateSelection = cardsEnterSelection
      .append('rect')
        .attr('class', 'card')
      .merge(cardsUpdateSelection);

    if (showCardLabel) {
      cardLabelsUpdateSelection = cardRowsMergedEnterUpdateSelection
        .selectAll('card-label')
        .data((d) => d.items);
      cardLabelsEnterSelection = cardLabelsUpdateSelection.enter();
      cardLabelsExitSelection = cardLabelsUpdateSelection.exit();

      cardLabelsExitSelection.remove();

      cardLabelsMergedEnterUpdateSelection = cardLabelsEnterSelection
        .append('text')
          .attr('class', 'card-label')
        .merge(cardLabelsUpdateSelection);
    }

    xAxisTextsSelection = chartSelection
      .append('g')
        .attr('class', 'x-axis');

    xAxisTextsUpdateSelection = xAxisTextsSelection
      .selectAll('text')
      .data(chartData.xAxisKeys);
    xAxisTextsEnterSelection = xAxisTextsUpdateSelection.enter();
    xAxisTextsExitSelection = xAxisTextsUpdateSelection.exit();

    xAxisTextsExitSelection.remove();

    xAxisTextsMergedEnterUpdateSelection = xAxisTextsEnterSelection
      .append('text')
      .merge(xAxisTextsUpdateSelection);

    yAxisTextsSelection = chartSelection
      .append('g')
        .attr('class', 'y-axis');

    yAxisTextsUpdateSelection = yAxisTextsSelection
      .selectAll('text')
      .data(chartData.yAxisKeys);
    yAxisTextsEnterSelection = yAxisTextsUpdateSelection.enter();
    yAxisTextsExitSelection = yAxisTextsUpdateSelection.exit();

    yAxisTextsExitSelection.remove();

    yAxisTextsMergedEnterUpdateSelection = yAxisTextsEnterSelection
      .append('text')
      .merge(yAxisTextsUpdateSelection);

    chartTitleSelection = chartSelection
      .append('text')
        .attr('class', 'chart-title')
        .style('font-size', '18px')
        .style('font-weight', 'bold');

    xAxisLabelSelection = chartSelection
      .append('text')
        .attr('class', 'axis-label x-axis-label');

    yAxisLabelSelection = chartSelection
      .append('text')
        .attr('class', 'axis-label y-axis-label');

    legendsSelection = svgSelection
      .append('g')
        .attr('class', 'legends');

    legendUpdateSelection = legendsSelection
      .selectAll('.legend')
      .data(legendData);
    legendEnterSelection = legendUpdateSelection.enter();
    legendExitSelection = legendUpdateSelection.exit();

    legendExitSelection.remove();

    legendMergedEnterUpdateSelection = legendEnterSelection
      .append('g')
        .attr('class', 'legend')
      .merge(legendUpdateSelection);

    legendRectSelection = legendMergedEnterUpdateSelection
      .append('rect');
    legendTextSelection = legendMergedEnterUpdateSelection
      .append('text');

    legendTitleTextSelection = legendsSelection
      .append('text')
        .attr('class', 'legend-title');
  }

  this.GetDimensions = function() {
    mainContainerSize = mainContainer
      .node()
      .getBoundingClientRect();

    mainContainerSize = {
      height: d3.max([mainContainerSize.height, minCardHeight * chartData.yAxisKeys.length]),
      width: mainContainerSize.width - getScrollBarWidth()
    };

    svgSize = {
      height: mainContainerSize.height,
      width: mainContainerSize.width
    };

    axisTicksize = {
      height: GetTextSize('0', fontSize.normal, 'normal').height,
      width: d3.max(chartData.yAxisKeys, (key) => GetTextSize(key, fontSize.normal, 'normal').width)
    };

    chartTitleSize = GetTextSize(chartData.chartTitle, fontSize.large, 'bold');

    chartTranslate = {
      x: chartMargin.left,
      y: chartMargin.top
    };

    legendTitleTextSize = {
      height: GetTextSize(chartData.legendTitle, fontSize.normal, 'bold').height,
      width: GetTextSize(chartData.legendTitle, fontSize.normal, 'bold').width
    };

    legendLabelSize = {
      height: GetTextSize('0', fontSize.normal, 'normal').height,
      width: d3.max(legendData, (d) => GetTextSize(numberFormat(d), fontSize.normal, 'normal').width)
    };

    chartSize = {
      height: svgSize.height - chartMargin.bottom - chartMargin.top,
      width: svgSize.width - chartMargin.left - chartMargin.right - legendSize.width - legendLabelSize.width
    };

    chartTitleTranslate = {
      x: chartTranslate.x + chartSize.width / 2,
      y: chartTranslate.y
    };

    xAxisSize = {
      height: axisTicksize.height,
      width: chartSize.width
    };

    yAxisSize = {
      height: chartSize.height,
      width: axisTicksize.width
    };

    xAxisLabelSize = {
      height: GetTextSize(chartData.labelXaxis, fontSize.large, 'bold').height,
      width: GetTextSize(chartData.labelXaxis, fontSize.large, 'bold').width 
    };

    yAxisLabelSize = {
      height: GetTextSize(chartData.labelYaxis, fontSize.large, 'bold').width,
      width: GetTextSize(chartData.labelYaxis, fontSize.large, 'bold').height 
    };

    cardsSize = {
      height: chartSize.height - xAxisSize.height - xAxisLabelSize.height - chartTitleSize.height,
      width: chartSize.width - yAxisSize.width - yAxisLabelSize.width
    };

    cardsTranslate = {
      x: yAxisLabelSize.width + axisTicksize.width,
      y: chartTitleSize.height
    };

    xAxisTranslate = {
      x: cardsTranslate.x,
      y: cardsTranslate.y + cardsSize.height
    };

    yAxisTranslate = {
      x: yAxisLabelSize.width,
      y: cardsTranslate.y
    };

    xAxisLabelTranslate = {
      x: chartTranslate.x + chartSize.width / 2,
      y: chartTranslate.y + xAxisTranslate.y + xAxisLabelSize.height
    };

    yAxisLabelTranslate = {
      x: 0,
      y: chartSize.height / 2
    };

    if (chartData.data.length === 0) {
      console.log('chart data error!');
      return;
    }

    if (chartData.data[0].items.length === 0) {
      console.log('chart data error!');
      return;
    }

    cardSize = {
      height: cardsSize.height / chartData.data.length,
      width: (cardsSize.width - chartPadding.right) / chartData.data[0].items.length
    };

    legendsSize = {
      height: cardsSize.height,
      width: d3.max([(legendSize.width + legendLabelSize.width), legendTitleTextSize.width])
    };

    legendRectSize = {
      height: legendsSize.height / legendsCNT,
      width: legendSize.width
    };

    legendTranslate = {
      x: chartTranslate.x + cardsTranslate.x + cardsSize.width,
      y: chartTranslate.y + cardsTranslate.y
    };
  }

  this.SetDimensions = function() {
    $('#' + this.MainContainerID()).height(mainContainerSize.height);

    svgSelection
      .attr('height', svgSize.height)
      .attr('width', svgSize.width);
  }

  this.UpdateScale = function() {
    colorScale
      .domain([0, d3.max(chartData.data, (floorData) => d3.max(floorData.items, (d) => (d.Yaxis)))]);
  }

  $(window).on('resize', function() {
    GetDimensions();
    SetDimensions();
    UpdateScale();
    DrawChart();
    DrawLegend();
  });
}