function Heatmap() {
  // data
  var chartData = {};
  var chartDataExtent = [];
  var legendData = [];

  // dimensions
  const chartMargin = { bottom: 40, left: 50, right: 10, top: 10 };
  const chartPadding = { bottom: 20, left: 0, right: 0, top: 0 };
  const colorRange = ['#EEF1F7','#ED1A24'];
  const legendSize = { height: 50, width: 100 };
  const legendsCNT = 10;
  const xAxisTextHeight = 20;
  const YaxisTextWidth = 20;

  var cardSize = {};
  var chartSize = {};
  var legendRectSize = {};
  var legendTransform = {};
  var mainContainerSize = {};
  var svgSize = {};

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
  var legendEnterSelection = null;
  var legendExitSelection = null;
  var legendMergedEnterUpdateSelection = null;
  var legendTextSelection = null;
  var legendRectSelection = null;
  var legendUpdateSelection = null;
  var legendsSelection = null;
  var svgSelection = null;
  var xAxisTextsEnterSelection = null;
  var xAxisTextsExitSelection = null;
  var xAxisTextsSelection = null;
  var xAxisTexxtsMergedEnterUpdateSelection = null;
  var xAxisTextsUpdateSelection = null;
  var yAxisTextsEnterSelection = null;
  var yAxisTextsExitSelection = null;
  var yAxisTextsSelection = null;
  var yAxisTexxtsMergedEnterUpdateSelection = null;
  var yAxisTextsUpdateSelection = null;

  // scales
  var colorScale = null;

  // tooltip
  var tooltip = null;

  // format
  numberFormat = (d) => (Math.round(d * 100) / 100 + (isPercent ? '%' : ''));
  
  function chart() {
    if (!dataset || !mainContainer) return;

    if (typeof legendPosition === 'undefined') legendPosition = 'bottom';

    chartData = GetHeatmapData(dataset);
    
    chartDataExtent = [d3.min(chartData.data, (d) => (d3.min(d.items, (item) => item.Yaxis))),
                      d3.max(chartData.data, (d) => (d3.max(d.items, (item) => item.Yaxis)))];
    
    for (var i = 0; i < legendsCNT; i ++) {
      legendData.push(chartDataExtent[0] + i * (chartDataExtent[1] - chartDataExtent[0]) / legendsCNT);
    }

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

  /*
   *  position of legend : bottom, left, right, top
   */
  chart.legendPosition = function(value) {
    if (!arguments.length) return legendPosition;
    legendPosition = value;
    return chart;
  }

  /*
   *  flag for showing of label on card
   */
  chart.showLabel = function(value) {
    if (!arguments.length) return showLabel;
    showLabel = value;
    return chart;
  }

  /*
   *  flag : true if Yaxis is a value of percent
   */
  chart.isPercent = function(value) {
    if (!arguments.length) return isPercent;
    isPercent = value;
    return chart;
  }

  /*
   *  label of legend
   */
  chart.legendLabel = function(value) {
    if (!arguments.length) return legendLabel;
    legendLabel = value;
    return chart;
  }

  function GetHeatmapData(data) {
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
    dataset.labelYaxis = data.YaxisText === '0' ? 'kWh' : data.YaxisText;

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

  function DrawChart() {
    chartSelection
      .attr('transform', 'translate(' + chartMargin.left + ',' + chartMargin.top +')');

    cardsSelection
      .attr('transform', 'translate(0,' + xAxisTextHeight + ')');

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

    if (showLabel) {
      cardLabelsMergedEnterUpdateSelection
        .attr('x', (d, i) => ((i + 0.5) * cardSize.width))
        .attr('y', 0.5 * cardSize.height)
        .text((d) => numberFormat(d.Yaxis));
    }

    xAxisTexxtsMergedEnterUpdateSelection
      .attr('x', (d, i) => ((i + 0.5) * cardSize.width))
      .attr('dy', 12)
      .text((d) => d3.timeFormat(chartData.formatXaxis)(d));

    yAxisTextsSelection
      .attr('transform', 'translate(' + (-2 - YaxisTextWidth) + ',' + xAxisTextHeight + ')');

    yAxisTexxtsMergedEnterUpdateSelection
      .attr('y', (d, i) => ((i + 0.5) * cardSize.height))
      .text((d) => d);
  }

  function DrawLegend() {
    legendsSelection
      .attr('transform', 'translate(' + legendTransform.left + ',' + legendTransform.top + ')');

    switch (legendPosition) {
      case 'bottom':
        legendRectSelection
          .attr('height', legendRectSize.height)
          .attr('width', legendRectSize.width)
          .attr('x', (d, i) => (i * legendRectSize.width))
          .attr('fill', (d) => colorScale(d));

        legendTextSelection
          .attr('x', (d, i) => (i * legendRectSize.width))
          .attr('y', legendRectSize.height)
          .style('alignment-baseline', 'before-edge')
          .text((d) => numberFormat(d));

        break;
      case 'left':
        break;
      case 'right':
        legendRectSelection
          .attr('height', legendRectSize.height)
          .attr('width', legendRectSize.width)
          .attr('y', (d, i) => ((legendsCNT - i - 1) * legendRectSize.height))
          .attr('fill', (d) => colorScale(d));

        legendTextSelection
          .attr('x', legendRectSize.width)
          .attr('y', (d, i) => ((legendsCNT - i) * legendRectSize.height))
          .attr('dx', 2)
          .style('alignment-baseline', 'after-edge')
          .text((d) => numberFormat(d));
          
        break;
      case 'top':
        break;
    }
    
  }

  function Init() {
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

    if (showLabel) {
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

    xAxisTexxtsMergedEnterUpdateSelection = xAxisTextsEnterSelection
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

    yAxisTexxtsMergedEnterUpdateSelection = yAxisTextsEnterSelection
      .append('text')
      .merge(yAxisTextsUpdateSelection);

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
  }

  function GetDimensions() {
    mainContainerSize = mainContainer
      .node()
      .getBoundingClientRect();

    svgSize = {
      height: mainContainerSize.height,
      width: mainContainerSize.width
    };

    switch (legendPosition) {
      case 'bottom':
        chartSize = {
          height: svgSize.height - chartMargin.bottom - chartMargin.top - legendSize.height,
          width: svgSize.width - chartMargin.left - chartMargin.right
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
          height: (chartSize.height - xAxisTextHeight) / chartData.data.length,
          width: chartSize.width / chartData.data[0].items.length
        };

        legendRectSize = {
          height: legendSize.height / 2,
          width: chartSize.width / legendsCNT
        };

        legendTransform = {
          left: chartMargin.left,
          top: chartMargin.top + chartSize.height + legendRectSize.height / 5
        };

        break;
      case 'top':
        break;
      case 'left':
        break;
      case 'right':
        chartSize = {
          height: svgSize.height - chartMargin.bottom - chartMargin.top,
          width: svgSize.width - chartMargin.left - chartMargin.right - legendSize.width
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
          height: (chartSize.height - xAxisTextHeight) / chartData.data.length,
          width: chartSize.width / chartData.data[0].items.length
        };

        legendRectSize = {
          height: (chartSize.height - xAxisTextHeight) / legendsCNT,
          width: legendSize.width / 2
        };

        legendTransform = {
          left: chartMargin.left + chartMargin.right + chartPadding.left + chartPadding.right + chartSize.width,
          top: chartMargin.top + xAxisTextHeight
        };

        break;
    }
  }

  function SetDimensions() {
    svgSelection
      .attr('height', svgSize.height)
      .attr('width', svgSize.width);
  }

  function UpdateScale() {
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

  return chart;
}