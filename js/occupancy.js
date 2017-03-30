function Occupancy() {
  // global
  var _this = this;
  HEATMAP_PERCENT = 0;
  HEATMAP_OCC_STATE = 1;
  TIMELINE_PERCENT = 0;
  TIMELINE_HOUR = 1;
  // constants
  const zoomExtent = [1, 3];
  const legendsCNT = 5;
  const deviceCircleRadius = 8;
  const legendRectSize = { height: 30, width: 20 };
  const timelineSliderPadding = { left: 50, right: 50 };
  // input data
  var dataset = {};
  var legendTitle = '';
  var heatmapType = HEATMAP_PERCENT;
  var timelineType = TIMELINE_PERCENT;
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
  var d3Transform = { x: 0, y: 0, k: 1 };
  var legendsTranslate = {};
  var timelineSliderSize = { height: 50, width: 0 };
  // flags
  var flagInit = false;
  // scale
  var colorScale = null;
  var colorRange = ['#008000', '#FFF200', '#FF0000'];
  var devicePositionScale = {};
  var timelineSliderScale = null;
  // tooltip
  var tooltip = null;
  var tooltipSlider = null;
  // data
  var timelineOffset = 0;
  var legendData = [];
  // callback
  var callbackTimelineChanged = function() {};
  // timeline slider
  var timelineSliderScaleDomain = {
    percent: [0, 100],
    hour: [6, 18]
  };
  var timelineCurrentPercent = 100;
  var timelineCurrentHour = 6;
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
    let key = 'SeatScheduleList';
    if (!dataset.hasOwnProperty(key)) {
      console.error('data format error! There is no property \'' + key + '\'!');
      dataset = null;
      return;
    }
    let total_power_usage = d3.sum(dataset[key], (d) => +d.PowerUsage);
    total_power_usage = total_power_usage === 0 ? 1 : total_power_usage;
    dataset[key].map((d) => {
      d.show = true;
      d.PowerUsage = +d.PowerUsage;
      switch(heatmapType) {
        case HEATMAP_PERCENT:
          d.index = d.SeatId;
          break;
        case HEATMAP_OCC_STATE:
          d.index = d.IsThresholdBreach ? 'occupied' : 'unoccupied';
          break;
        default:
          d.index = d.SeatId;
      }
      if (timelineType === TIMELINE_PERCENT) d.percent = d.PowerUsage / total_power_usage * 100;
      return d;
    });
    legendData = GetLegendData(dataset.SeatScheduleList, 'PowerUsage', legendsCNT, heatmapType);
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
   *  flag : type of time line(hour or percent)
   */
  this.TimelineType = function(value) {
    if (!arguments.length) return timelineType;
    timelineType = value;
  }
  /*
   *  flag : type of heatmap(percent or occupancy state)
   */
  this.HeatmapType = function(value) {
    if (!arguments.length) return heatmapType;
    heatmapType = value;
  }

  this.numberFormat = (d) => (Math.round(d * 10000) / 10000);

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

    switch(timelineType) {
      case TIMELINE_HOUR:
        timelineOffset = timelineCurrentHour;

        timelineSliderScaleDomain.hour[0] = new Date();
        timelineSliderScaleDomain.hour[0].setHours(6);
        timelineSliderScaleDomain.hour[0].setMinutes(0);
        timelineSliderScaleDomain.hour[0].setSeconds(0);
        timelineSliderScaleDomain.hour[0].setMilliseconds(0);

        timelineSliderScaleDomain.hour[1] = new Date();
        timelineSliderScaleDomain.hour[1].setHours(18);
        timelineSliderScaleDomain.hour[1].setMinutes(0);
        timelineSliderScaleDomain.hour[1].setSeconds(0);
        timelineSliderScaleDomain.hour[1].setMilliseconds(0);
        break;
      case TIMELINE_PERCENT:
        timelineOffset = timelineCurrentPercent;
        break;
      default:
        timelineOffset = timelineCurrentPercent;
    }

    tooltip = d3.select('body')
      .append('div')
      .attr('class', 'toolTip');

    tooltipSlider = d3.select('body')
      .append('div')
      .attr('class', 'toolTip');

    colorScale = d3.scaleLinear()
      .range(colorRange);

    floorImage = new Image();
    floorImage.src = dataset.FloorPlanURL;
    floorImage.onload = this.FloorImageLoaded;

    startLoading();

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
      x: heatmapType === HEATMAP_PERCENT ? (canvasSize.width - 150) : (canvasSize.width - 200),
      y: heatmapType === HEATMAP_PERCENT ? ((canvasSize.height - (legendsCNT - 1) * legendRectSize.height) / 2) : (canvasSize.height - 50)
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
    d3Transform = d3.event.transform;
    floorCanvasContextSelection.clearRect(0, 0, canvasSize.width, canvasSize.height);
    _this.DrawFloorImage();
  }

  this.DrawFloorImage = function() {
    floorCanvasContextSelection.drawImage(floorImage, d3Transform.x + floorImageInitPosition.x, d3Transform.y + floorImageInitPosition.y, d3Transform.k * floorImageSize.width, d3Transform.k * floorImageSize.height);
    UpdateScale();
    DrawDefs();
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
    DrawDefs();
    DrawDevices();
    DrawLegend();
    DrawTimeline();

    stopLoading();
  }

  function DrawDefs() {
    defsSelection
      .selectAll('*')
      .remove();

    defRadialGradientUpdateSelection = defsSelection
      .selectAll('radialGradient')
      .data(GetDefsData(dataset.SeatScheduleList, heatmapType));
    defRadialGradientEnterSelection = defRadialGradientUpdateSelection.enter();
    defRadialGradientExitSelection = defRadialGradientUpdateSelection.exit();

    defRadialGradientExitSelection.remove();

    defRadialGradientMergedUpdateSelection = defRadialGradientEnterSelection
      .append('radialGradient')
        .attr('id', (d) => ('radial-gradient-' + d.index));

    defRadialGradientStop0Selection = defRadialGradientMergedUpdateSelection
      .append('stop')
        .attr('offset', '80%')
        .attr('stop-opacity', 1);

    defRadialGradientStop100Selection = defRadialGradientMergedUpdateSelection
      .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#FFFFFF')
        .attr('stop-opacity', 0);

    defRadialGradientStop0Selection
      .attr('stop-color', (d) => colorScale(d.value));
    // defRadialGradientStop100Selection
    //   .attr('stop-color', (d) => colorScale(d.PowerUsage));
  }

  function DrawDevices() {
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

    devicesSelection
      .attr('transform', ('translate(' + floorImageInitPosition.x + ',' + floorImageInitPosition.y + ')'));
    deviceMergedEnterUpdateSelection
      .attr('transform', (d) => ('translate(' + devicePositionScale.x(d.XYCoordinate.x) + ',' + devicePositionScale.y(d.XYCoordinate.y) + ')'))
      .style('display', (d) => (d.show ? 'initial' : 'none'));
    deviceCircleMergedUpdateSelection
      .attr('r', d3Transform.k * deviceCircleRadius)
      // .attr('fill', (d) => colorScale(d.PowerUsage))
      .attr('fill', (d) => ('url(#radial-gradient-' + ((d.show && ((timelineType === TIMELINE_PERCENT && d.percent < timelineCurrentPercent) || (timelineType === TIMELINE_HOUR))) ? d.index : '') + ')'))
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
      .on('mouseout', function(d){ tooltip.style('display', 'none');});
  }

  function UpdateScale() {
    colorScale
      .domain(GetHeatmapExtent(dataset.SeatScheduleList, 'PowerUsage'));
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

    if (heatmapType === HEATMAP_PERCENT) {
      legendTitleTextSelection = legendsSelection
        .append('text')
          .attr('class', 'legend-title');
    }

    legendsSelection
      .attr('transform', 'translate(' + legendsTranslate.x + ',' + legendsTranslate.y + ')');

    legendMergedEnterUpdateSelection
      .attr('transform', (d, i) => 'translate(0,' + (i * legendRectSize.height + 5) + ')');

    legendInnerCircleSelection
      .attr('height', legendRectSize.height)
      .attr('width', legendRectSize.width)
      .attr('r', 9)
      .attr('fill', (d) => (d.active ? colorScale(d.value) : 'transparent'));

    legendOuterCircleSelection
      .attr('height', legendRectSize.height)
      .attr('width', legendRectSize.width)
      .attr('r', 12)
      .attr('fill', 'transparent')
      .attr('stroke', '#C9C9C9')
      .attr('stroke-width', 2);

    legendTextSelection
      .attr('x', legendRectSize.width)
      .attr('dy', 5)
      .style('text-transform', 'capitalize')
      .text((d) => d.text);

    if (heatmapType === HEATMAP_OCC_STATE) {
      legendOuterCircleSelection
        .style('cursor', 'pointer')
        .style('pointer-events', 'fill')
        .on('click', (d, i) => onClickLegend(i));
    }

    if (legendTitleTextSelection !== null) {
      legendTitleTextSelection
        .attr('transform', 'translate(-15, -15)')
        .style('text-transform', 'capitalize')
        .text(legendTitle);
    }
  }

  function DrawTimeline() {
    timelineSliderSize.width = canvasSize.width;

    timelineSliderSVGSelection = floorCanvasContainerSelection
      .append('svg')
        .attr('class', 'svg-timeline')
        .attr('height', timelineSliderSize.height)
        .attr('width', timelineSliderSize.width);

    timelineSliderScale = d3.scaleLinear()
      .domain(timelineType === TIMELINE_PERCENT ? timelineSliderScaleDomain.percent : timelineSliderScaleDomain.hour)
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
          .on('end', (d) => (_this.changedTimeline(timelineSliderScale.invert(d3.event.x)))));

    timelineSliderSelection
      .insert('g', '.track-overlay')
        .attr('class', 'ticks')
        .attr('transform', 'translate(0,' + 18 + ')')
        .style('font', '10px sans-serif')
      .selectAll('text')
      .data((d) => {
        var tickCount = timelineType === TIMELINE_HOUR ? 13 : 11;
        var tickMin = d3.min(timelineSliderScale.domain());
        var tickMax = d3.max(timelineSliderScale.domain());
        var tickStep = (tickMax - tickMin) / (tickCount - 1);
        var ticks = new Array(tickCount);
        for (var i = 0; i < tickCount; i ++) ticks[i] = tickMin + i * tickStep;
        return ticks;
      })
      .enter()
        .append('text')
          .attr('x', timelineSliderScale)
          .attr('text-anchor', 'middle')
          .text((d) => {
            switch (timelineType) {
              case TIMELINE_HOUR:
                return d3.timeFormat('%H:%M')(d);
              case TIMELINE_PERCENT:
                return d;
              default:
                return d;
            }
          });

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
          return function(t) {
            _this.changingTimeline(i(t));
            tooltipSlider.style('display', 'none');
          }
        });
  }

  this.changingTimeline = function(xOffset) {
    switch (timelineType) {
      case TIMELINE_HOUR:
        timelineCurrentHour = xOffset;
        break;
      case TIMELINE_PERCENT:
        timelineCurrentPercent = xOffset;
        break;
      default:
        timelineCurrentPercent = xOffset;
    }
    timelineSliderHandleSelection.attr('cx', timelineSliderScale(xOffset));

    tooltipSlider
      .style('left', (timelineSliderScale(xOffset) + 50) + 'px')
      .style('bottom', '60px')
      .style('display', 'inline-block')
      .html((d) => {
        var title = timelineType === TIMELINE_HOUR ? 'time' : 'percent';
        var value = timelineType === TIMELINE_HOUR ? d3.timeFormat('%H:%M')(xOffset) : _this.numberFormat(xOffset);
        return '<table><tbody><tr><td>' + title + '<span> : </span></td><td>' + value + '</td></tr></td></tr></tbody></table>';
      });

    DrawDevices();
  }

  this.changedTimeline = function(xOffset) {
    console.log(xOffset);
    tooltipSlider.style('display', 'none');
    if (timelineType === TIMELINE_HOUR)
      callbackTimelineChanged(xOffset);
  }

  this.ReDraw = function() {
    UpdateScale();
    DrawDefs();
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
    return [d3.min(data, (d) => (d[key])),
            (d3.min(data, (d) => (d[key])) + d3.max(data, (d) => (d[key]))) / 2,
            d3.max(data, (d) => (d[key]))];
  }

  function GetLegendData(data, key, legendsCNT, type) {
    if (data === null || !data) {
      console.error('Invalid heatmap data!')
      return null;
    }
    if (!data[0].hasOwnProperty(key)) {
      console.error('Invalid key!');
      return null;
    }
    var legendData = [];

    switch(type) {
      case HEATMAP_PERCENT:
        var heatmapExtent = GetHeatmapExtent(data, key);
        
        for (var i = 0; i < legendsCNT; i ++) {
          var legend_value = heatmapExtent[0] + i * (heatmapExtent[heatmapExtent.length - 1] - heatmapExtent[0]) / (legendsCNT - 1);
          legendData.push({
            text: _this.numberFormat(legend_value),
            value: legend_value,
            active: true
          });
        }
        break;
      case HEATMAP_OCC_STATE:
        legendData = [{
          text: 'occupied',
          value: 1,
          active: true
        }, {
          text: 'unoccupied',
          value: 0,
          active: true
        }];
        break;
      default:
        var heatmapExtent = GetHeatmapExtent(data, key);
        
        for (var i = 0; i < legendsCNT; i ++) {
          var legend_value = heatmapExtent[0] + i * (heatmapExtent[heatmapExtent.length - 1] - heatmapExtent[0]) / (legendsCNT - 1);
          legendData.push({
            text: _this.numberFormat(legend_value),
            value: legend_value,
            active: true
          });
        }
    }
        
    return legendData;
  }
  
  function GetDefsData(data, type) {
    switch(type) {
      case HEATMAP_PERCENT:
        return data.map((d) => ({
                  index: d.SeatId,
                  value: d.PowerUsage
                }));
        break;
      case HEATMAP_OCC_STATE:
        return [{
          index: 'occupied',
          value: 1
        }, {
          index: 'unoccupied',
          value: 0
        }];
        break;
      default:
        return data;
    }
  }

  function onClickLegend(i) {
    console.log(i);
    legendData[i].active = !legendData[i].active;
    dataset.SeatScheduleList.forEach((device) => {
      if (device.index === legendData[i].text) device.show = legendData[i].active;
    });
    _this.ReDraw();
  }
}
