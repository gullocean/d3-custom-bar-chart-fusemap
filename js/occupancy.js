function Occupancy() {
  // constants
  const zoomExtent = [1, 3];
  const legendsCNT = 5;
  const deviceCircleRadius = 10;
  const legendRectSize = { height: 30, width: 20 };
  const timelineSliderPadding = { left: 50, right: 50 };
  // input data
  var dataset = {};
  var legendTitle = '';
  var isPercent = false;
  // global
  var _this = this;
  // selections
  var floorCanvasSelection = null;
  var floorCanvasContextSelection = null;
  var floorCanvasContainerSelection = null;
  var floorImage = null;
  var svgSelection = null;
  var devicesSelection = null;
  var deviceUpdateSelection = null;
  var deviceEnterSelection = null;
  var deviceExitSelection = null;
  var deviceMergedEnterUpdateSelection = null;
  var deviceCircleMergedUpdateSelection = null;
  var legendEnterSelection = null;
  var legendExitSelection = null;
  var legendMergedEnterUpdateSelection = null;
  var legendTextSelection = null;
  var legendTitleTextSelection = null;
  var legendInnerCircleSelection = null;
  var legendOuterCircleSelection = null;
  var legendUpdateSelection = null;
  var legendsSelection = null;
  var timelineSliderSVGSelection = null;
  var timelineSliderSelection = null;
  var timelineSliderHandleSelection = null;
  var defsSelection = null;
  var defRadialGradientUpdateSelection = null;
  var defRadialGradientEnterSelection = null;
  var defRadialGradientExitSelection = null;
  var defRadialGradientMergedUpdateSelection = null;
  var defRadialGradientStop0Selection = null;
  var defRadialGradientStop100Selection = null;
  // dimensions
  var canvasSize = { height: 600, width: 1336 };
  var floorImageSize = {};
  var floorImageOriginSize = {};
  var floorImageInitPosition = {};
  var d3Transform = {};
  var legendsTranslate = {};
  var timelineSliderSize = { height: 50, width: 0 };
  // flags
  var flagInit = false;
  // scale
  var colorScale = null;
  var colorRange = ['#008000', '#FFF200', '#FF0000'];
  var devicePositionScale = {};
  var timelineSliderScale = null;
  var d3Transform = {};
  // tooltip
  var tooltip = null;
  // data
  var heatmapExtent = [];
  var legendData = [];
  var timelineOffset = 0;
  // callback
  var callbackTimelineChanged = function() {};
  /*
   *  color range of color scale for heatmap
   */
  this.ColorRange = function(value) {
    if (!arguments.length) return colorRange;
    colorRange = value;
  }
  /*
   *  Dataset
   */
  this.Dataset = function(value) {
    if (!arguments.length) return dataset;
    dataset = value;

    heatmapExtent = GetHeatmapExtent(dataset.SeatScheduleList, 'PowerUsage');
    legendData = GetLegendData(heatmapExtent, legendsCNT);
  }
  /*
   * canvas id
   */
  this.FloorCanvasID = function(value) {
    if (!arguments.length) {
      if (floorCanvasSelection === null) return null;
      return floorCanvasSelection.attr('id');
    }
    floorCanvasSelection = d3.select('#' + value);
    if (floorCanvasSelection.empty()) {
      console.error('Invalid id of canvas!');
      return;
    }
    floorCanvasContainerSelection = d3.select(floorCanvasSelection.node().parentNode);
    if (floorCanvasContainerSelection.empty()) {
      console.error('There is no container of canvas!');
      return;
    }
  }
  /*
   *  title of legend
   */
  this.LegendTitle = function(value) {
    if (!arguments.length) return legendTitle;
    legendTitle = value;
  }
  /*
   *  flag : true if Yaxis is a value of percent
   */
  this.IsPercent = function(value) {
    if (!arguments.length) return isPercent;
    isPercent = value;
  }

  this.numberFormat = (d) => (Math.round(d * 10000) / 10000 + (isPercent ? '%' : ''));

  this.Init = function() {
    if (arguments.length === 1) {
      callbackTimelineChanged = arguments[0];
    }
    if (dataset === null || !dataset) {
      console.error('There is no data for floor!');
      return;
    }
    if (colorRange === null || !colorRange) {
      console.error('There is no range of color for for heatmap! Please set the range of color!');
      return;
    }
    if (floorCanvasSelection.empty()) {
      console.error('There is no selection of canvas!');
      return;
    }
    if (floorCanvasContainerSelection.empty()) {
      console.error('There is no container of canvas!');
      return;
    }

    tooltip = d3.select('body')
      .append('div')
      .attr('class', 'toolTip');

    colorScale = d3.scaleLinear()
      .range(colorRange);

    floorImage = new Image();
    floorImage.src = dataset.FloorPlanURL;
    floorImage.onload = this.FloorImageLoaded;

    floorCanvasContainerSelection
      .style('position', 'relative')
      .style('height', (canvasSize.height + timelineSliderSize.height) + 'px')
      .style('width', '100%')
      .style('margin-left', 'auto')
      .style('margin-right', 'auto');

    canvasSize = {
      height: floorCanvasContainerSelection.node().getBoundingClientRect().height,
      width: floorCanvasContainerSelection.node().getBoundingClientRect().width,
    };
    canvasSize.height = canvasSize.height - timelineSliderSize.height;

    legendsTranslate = {
      x: canvasSize.width - 100,
      y: (canvasSize.height - (legendsCNT - 1) * legendRectSize.height) / 2
    };

    floorCanvasSelection
      .attr('height', canvasSize.height)
      .attr('width', canvasSize.width);
    floorCanvasContextSelection = floorCanvasSelection
      .node().getContext('2d');

    floorCanvasContainerSelection
      .selectAll('svg')
      .remove();

    svgSelection = floorCanvasContainerSelection
      .append('svg')
        .attr('height', canvasSize.height)
        .attr('width', canvasSize.width)
        .style('position', 'absolute')
        .style('top', 0)
        .style('left', 0)
        .style('cursor', 'move')
        .call(
          d3.zoom()
          .scaleExtent(zoomExtent)
          .on('zoom', this.zoom)
        );

    defsSelection = svgSelection
      .append('defs');

    devicesSelection = svgSelection
      .append('g')
        .attr('class', 'devices');

    legendsSelection = svgSelection
      .append('g')
        .attr('class', 'legends');

    flagInit = true;
  }

  this.zoom = function() {
    floorCanvasContextSelection.clearRect(0, 0, canvasSize.width, canvasSize.height);
    _this.DrawFloorImage();
  }

  this.DrawFloorImage = function() {
    let d3Transform = d3.event.transform;
    floorCanvasContextSelection.drawImage(floorImage, d3Transform.x + floorImageInitPosition.x, d3Transform.y + floorImageInitPosition.y, d3Transform.k * floorImageSize.width, d3Transform.k * floorImageSize.height);
    UpdateScale();
    DrawDevices();
  }

  this.FloorImageLoaded = function() {
    floorImageOriginSize = {
      height: this.height,
      width: this.width
    };

    floorImageSize = {
      height: canvasSize.height,
      width: canvasSize.height * floorImageOriginSize.width / floorImageOriginSize.height
    };

    floorImageInitPosition = {
      x: (canvasSize.width - floorImageSize.width) / 2,
      y: (canvasSize.height - floorImageSize.height) / 2
    };

    floorCanvasContextSelection.drawImage(this, floorImageInitPosition.x, floorImageInitPosition.y, floorImageSize.width, floorImageSize.height);
    
    UpdateScale();
    DrawDevices();
    DrawLegend();
    DrawTimeline();
  }

  function DrawDevices() {
    defsSelection
      .selectAll('*')
      .remove();

    defRadialGradientUpdateSelection = defsSelection
      .selectAll('radialGradient')
      .data(dataset.SeatScheduleList);
    defRadialGradientEnterSelection = defRadialGradientUpdateSelection.enter();
    defRadialGradientExitSelection = defRadialGradientUpdateSelection.exit();

    defRadialGradientExitSelection.remove();

    defRadialGradientMergedUpdateSelection = defRadialGradientEnterSelection
      .append('radialGradient')
        .attr('id', (d, i) => ('radial-gradient' + i));

    defRadialGradientStop0Selection = defRadialGradientMergedUpdateSelection
      .append('stop')
        .attr('offset', '80%')
        .attr('stop-opacity', 1);

    defRadialGradientStop100Selection = defRadialGradientMergedUpdateSelection
      .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#FFFFFF')
        .attr('stop-opacity', 0);

    devicesSelection
      .selectAll('*')
      .remove();

    deviceUpdateSelection = devicesSelection
      .selectAll('.device')
      .data(dataset.SeatScheduleList);
    deviceEnterSelection = deviceUpdateSelection.enter();
    deviceExitSelection = deviceUpdateSelection.exit();

    deviceExitSelection.remove();

    deviceMergedEnterUpdateSelection = deviceEnterSelection
      .append('g')
        .attr('class', 'device')
      .merge(deviceUpdateSelection);

    deviceCircleMergedUpdateSelection = deviceMergedEnterUpdateSelection
      .append('circle');

    defRadialGradientStop0Selection
      .attr('stop-color', (d) => colorScale(+d.PowerUsage));
    // defRadialGradientStop100Selection
    //   .attr('stop-color', (d) => colorScale(+d.PowerUsage));
    devicesSelection
      .attr('transform', ('translate(' + floorImageInitPosition.x + ',' + floorImageInitPosition.y + ')'));
    deviceMergedEnterUpdateSelection
      .attr('transform', (d) => ('translate(' + devicePositionScale.x(d.XYCoordinate.x) + ',' + devicePositionScale.y(d.XYCoordinate.y) + ')'));
    deviceCircleMergedUpdateSelection
      .attr('r', d3Transform.k * deviceCircleRadius)
      // .attr('fill', (d) => colorScale(+d.PowerUsage))
      .attr('fill', (d, i) => 'url(#radial-gradient' + i + ')')
      .style('cursor', 'pointer')
      .on('mousemove', function(d){
        tooltip
          .style('left', d3.event.pageX + 'px')
          .style('top', d3.event.pageY + 'px')
          .style('display', 'inline-block')
          .html('<table><tbody><tr><td>Seat<span> : </span></td><td>' + d.SeatName + '</td></tr>' + 
            '<tr><td>Device<span> : </span></td><td>' + d.ApplianceName + '</td></tr>' +
            '<tr><td>User<span> : </span></td><td>' + (d.IsAssigned ? d.UserFullName : 'Not Assigned') + '</td></tr></tbody></table>');
      })
      .on('mouseout', function(d){ tooltip.style('display', 'none');});;
  }

  function UpdateScale() {
    d3Transform = d3.event === null ? { x: 0, y: 0, k: 1 } : d3.event.transform;
    colorScale
      .domain(heatmapExtent);
    devicePositionScale = {
      x: (x) => (d3Transform.x + d3Transform.k * floorImageSize.width / floorImageOriginSize.width * x),
      y: (y) => (d3Transform.y + d3Transform.k * floorImageSize.height / floorImageOriginSize.height * y)
    };
  }

  function DrawLegend() {
    legendsSelection
      .selectAll('*')
      .remove();

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

    legendInnerCircleSelection = legendMergedEnterUpdateSelection
      .append('circle');
    legendOuterCircleSelection = legendMergedEnterUpdateSelection
      .append('circle');
    legendTextSelection = legendMergedEnterUpdateSelection
      .append('text');

    legendTitleTextSelection = legendsSelection
      .append('text')
        .attr('class', 'legend-title');

    legendsSelection
      .attr('transform', 'translate(' + legendsTranslate.x + ',' + legendsTranslate.y + ')');

    legendMergedEnterUpdateSelection
      .attr('transform', (d, i) => 'translate(0,' + (i * legendRectSize.height + 5) + ')');

    legendInnerCircleSelection
      .attr('height', legendRectSize.height)
      .attr('width', legendRectSize.width)
      .attr('r', 10)
      .attr('fill', (d) => colorScale(d));

    legendOuterCircleSelection
      .attr('height', legendRectSize.height)
      .attr('width', legendRectSize.width)
      .attr('r', 12)
      .attr('fill', 'transparent')
      .attr('stroke', '#E2E2E2')
      .attr('stroke-width', 2);

    legendTextSelection
      .attr('x', legendRectSize.width)
      .attr('dy', 5)
      .text((d) => _this.numberFormat(d));

    legendTitleTextSelection
      .attr('transform', 'translate(-15, -15)')
      .text(legendTitle);
  }

  function DrawTimeline() {
    timelineSliderSize.width = canvasSize.width;

    timelineSliderSVGSelection = floorCanvasContainerSelection
      .append('svg')
        .attr('class', 'svg-timeline')
        .attr('height', timelineSliderSize.height)
        .attr('width', timelineSliderSize.width);

    timelineSliderScale = d3.scaleLinear()
      .domain([0, 180])
      .range([timelineSliderPadding.left, timelineSliderSize.width - timelineSliderPadding.left - 2 * timelineSliderPadding.right])
      .clamp(true);

    timelineSliderSelection = timelineSliderSVGSelection
      .append('g')
        .attr('class', 'timeline-slider')
        .attr('transform', 'translate(' + timelineSliderPadding.left + ',' + (timelineSliderSize.height / 2) + ')');

    timelineSliderSelection
      .append('line')
        .attr('class', 'track')
        .style('stroke-linecap', 'round')
        .style('stroke', '#000')
        .style('stroke-opacity', '0.3')
        .style('stroke-width', '10px')
        .attr('x1', timelineSliderScale.range()[0])
        .attr('x2', timelineSliderScale.range()[1])
      .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr('class', 'track-inset')
        .style('stroke-linecap', 'round')
        .style('stroke', '#ddd')
        .style('stroke-width', '8px')
      .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr('class', 'track-overlay')
        .style('stroke-linecap', 'round')
        .style('pointer-events', 'stroke')
        .style('stroke-width', '50px')
        .style('cursor', 'crosshair')
        .call(d3.drag()
          .on('start.interrupt', (d) => timelineSliderSelection.interrupt())
          .on('start drag', (d) => _this.changingTimeline(timelineSliderScale.invert(d3.event.x)))
          .on('end', (d) => _this.changedTimeline(timelineSliderScale.invert(d3.event.x))));

    timelineSliderSelection
      .insert('g', '.track-overlay')
        .attr('class', 'ticks')
        .attr('transform', 'translate(0,' + 18 + ')')
        .style('font', '10px sans-serif')
      .selectAll('text')
      .data(timelineSliderScale.ticks(10))
      .enter()
        .append('text')
          .attr('x', timelineSliderScale)
          .attr('text-anchor', 'middle')
          .text((d) => d);

    timelineSliderHandleSelection = timelineSliderSelection
      .insert('circle', '.track-overlay')
        .attr('class', 'handle')
        .attr('r', 9)
        .style('fill', '#fff')
        .style('stroke', '#000')
        .style('stroke-opacity', '0.5')
        .style('stroke-width', '1.25px');

    timelineSliderSelection
      .transition()
        .duration(200)
        .tween('hue', function() {
          var i = d3.interpolate(timelineOffset, timelineOffset);
          return function(t) { _this.changingTimeline(i(t)); }
        });
  }

  this.changingTimeline = function(xOffset) {
    timelineSliderHandleSelection.attr('cx', timelineSliderScale(xOffset));
  }

  this.changedTimeline = function(xOffset) {
    console.log(xOffset);
    callbackTimelineChanged(xOffset);
  }

  this.ReDraw = function() {
    UpdateScale();
    DrawDevices();
    DrawLegend();
  }

  function GetHeatmapExtent(data, key) {
    if (data === null || !data) {
      console.error('Invalid heatmap data!')
      return null;
    }
    if (!data[0].hasOwnProperty(key)) {
      console.error('Invalid key!');
      return null;
    }
    return [d3.min(data, (d) => (+d[key])),
            (d3.min(data, (d) => (+d[key])) + d3.max(data, (d) => (+d[key]))) / 2,
            d3.max(data, (d) => (+d[key]))];
  }

  function GetLegendData(heatmapExtent, legendsCNT) {
    if (heatmapExtent === null || !heatmapExtent || heatmapExtent.length < 2) {
      console.error('Invalid heatmap extent!');
      return null;
    }
    var legendData = [];
    for (var i = 0; i < legendsCNT; i ++) {
      legendData.push(heatmapExtent[0] + i * (heatmapExtent[heatmapExtent.length - 1] - heatmapExtent[0]) / (legendsCNT - 1));
    }
    return legendData;
  }
}
