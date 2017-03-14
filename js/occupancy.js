function Occupancy() {
  // constants
  const zoomExtent = [1, 3];
  const legendsCNT = 5;
  const legendRectSize = { height: 30, width: 20 };
  const timelineSliderPadding = { left: 50, right: 50 };
  // input data
  var dataset = {};
  var legendTitle = '';
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
  var legendRectSelection = null;
  var legendUpdateSelection = null;
  var legendsSelection = null;
  var timelineSliderSVGSelection = null;
  var timelineSliderSelection = null;
  var timelineSliderHandleSelection = null;
  // dimensions
  var canvasSize = { height: 600, width: 1336 };
  var floorImageSize = {};
  var floorImageOriginSize = {};
  var floorImageInitPosition = {};
  var d3Transform = {};
  var deviceCircleRadius = 7;
  var legendsTranslate = {};
  var timelineSliderSize = { height: 50, width: 0 };
  // flags
  var flagInit = false;
  // scale
  var colorScale = null;
  var colorRange = ['#008000','#FF0000'];
  var devicePositionScale = {};
  var heatmapExtent = [];
  var timelineSliderScale = null;
  // tooltip
  var tooltip = null;
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

  this.Init = function() {
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
      y: (canvasSize.height - legendsCNT * legendRectSize.height) / 2
    };

    floorCanvasSelection
      .attr('height', canvasSize.height)
      .attr('width', canvasSize.width);
    floorCanvasContextSelection = floorCanvasSelection
      .node().getContext('2d');

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

    devicesSelection = svgSelection
      .append('g')
        .attr('class', 'devices');

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

    legendsSelection = svgSelection
      .append('g')
        .attr('class', 'legends');

    var legendData = [];
    heatmapExtent = [d3.min(dataset.SeatScheduleList, (d) => (+d.PowerUsage)),
                    d3.max(dataset.SeatScheduleList, (d) => (+d.PowerUsage))];
    
    for (var i = 0; i < legendsCNT; i ++) {
      legendData.push(heatmapExtent[0] + i * (heatmapExtent[1] - heatmapExtent[0]) / legendsCNT);
    }

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
          .on('start drag', (d) => _this.changeTimeline(timelineSliderScale.invert(d3.event.x))));

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
          var i = d3.interpolate(0, 0);
          return function(t) { _this.changeTimeline(i(t)); }
        });

    flagInit = true;
  }

  this.zoom = function() {
    floorCanvasContextSelection.clearRect(0, 0, canvasSize.width, canvasSize.height);
    _this.DrawFloorImage();
  }

  this.DrawFloorImage = function() {
    let d3Transform = d3.event.transform;
    floorCanvasContextSelection.drawImage(floorImage, d3Transform.x + floorImageInitPosition.x, d3Transform.y + floorImageInitPosition.y, d3Transform.k * floorImageSize.width, d3Transform.k * floorImageSize.height);
    _this.UpdateScale();
    _this.DrawDevices();
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
    
    _this.UpdateScale();
    _this.DrawDevices();
    _this.DrawLegend();
  }

  this.DrawDevices = function() {
    devicesSelection
      .attr('transform', ('translate(' + floorImageInitPosition.x + ',' + floorImageInitPosition.y + ')'));
    deviceMergedEnterUpdateSelection
      .attr('transform', (d) => ('translate(' + devicePositionScale.x(d.XYCoordinate.x) + ',' + devicePositionScale.y(d.XYCoordinate.y) + ')'));
    deviceCircleMergedUpdateSelection
      .attr('r', deviceCircleRadius)
      .attr('stroke', 'black')
      .attr('fill', (d) => colorScale(+d.PowerUsage))
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

  this.UpdateScale = function() {
    let d3Transform = d3.event === null ? { x: 0, y: 0, k: 1 } : d3.event.transform;
    colorScale
      .domain(heatmapExtent);
    devicePositionScale = {
      x: (x) => (d3Transform.x + d3Transform.k * floorImageSize.width / floorImageOriginSize.width * x),
      y: (y) => (d3Transform.y + d3Transform.k * floorImageSize.height / floorImageOriginSize.height * y)
    };
  }

  this.numberFormat = (d) => (Math.round(d * 10000) / 10000);

  this.DrawLegend = function() {
    legendsSelection
      .attr('transform', 'translate(' + legendsTranslate.x + ',' + legendsTranslate.y + ')');

    legendRectSelection
      .attr('height', legendRectSize.height)
      .attr('width', legendRectSize.width)
      .attr('y', (d, i) => ((legendsCNT - i - 1) * legendRectSize.height))
      .attr('fill', (d) => colorScale(d));

    legendTextSelection
      .attr('x', legendRectSize.width)
      .attr('y', (d, i) => ((legendsCNT - i) * legendRectSize.height))
      .attr('dx', 2)
      .text((d) => _this.numberFormat(d));

    legendTitleTextSelection
      .attr('dy', -5)
      .text(legendTitle);
  }

  this.changeTimeline = function(xOffset) {
    timelineSliderHandleSelection.attr('cx', timelineSliderScale(xOffset));
  }
}
