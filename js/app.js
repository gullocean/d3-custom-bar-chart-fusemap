const weekdayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

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

function getScrollBarWidth () {
  var inner = document.createElement('p');
  inner.style.width = "100%";
  inner.style.height = "200px";

  var outer = document.createElement('div');
  outer.style.position = "absolute";
  outer.style.top = "0px";
  outer.style.left = "0px";
  outer.style.visibility = "hidden";
  outer.style.width = "200px";
  outer.style.height = "150px";
  outer.style.overflow = "hidden";
  outer.appendChild (inner);

  document.body.appendChild (outer);
  var w1 = inner.offsetWidth;
  outer.style.overflow = 'scroll';
  var w2 = inner.offsetWidth;
  if (w1 == w2) w2 = outer.clientWidth;

  document.body.removeChild (outer);

  return (w1 - w2);
};

function Find(values, tagName, tagValue) {
  if (!values.length) return null;

  for (var i = 0; i < values.length; i ++)
    if (values[i][tagName] === tagValue) return values[i];

  return null;
}

function FindAll(values, tagName, tagValue) {
  if (!values.length) return null;

  var retVal = [];

  for (var i = 0; i < values.length; i ++)
    if (values[i][tagName] === tagValue) retVal.push(values[i]);

  return retVal;
}

function Weekday2Date(weekdayName) {
  var weekdayNo = weekdayNames.indexOf(weekdayName.toLowerCase());
  if (weekdayNo < 0) return weekdayName;

  return moment().add(weekdayNo - moment().day(), 'days').toDate();
}

function FormatJsonForBarchart(jsonData) {
  var formatedData = [];

  if (jsonData.GraphPointsList.length === 0) {
    console.log('There is no GraphPointsList!');
    return null;
  }

  if (jsonData.GraphPointsList[0].GraphPointList.length === 0) {
    console.log('There is no GraphPointList!');
    return null;
  }

  var itemNames = jsonData.GraphPointsList.map((d) => d.ItemName);
  var xAxisKeys = [];
  jsonData.GraphPointsList[0].GraphPointList.forEach((d) =>{
    if (d.Yaxis !== null)
      xAxisKeys.push(new Date(d.Xaxis));
  });

  formatedData = new Array(xAxisKeys.length);

  xAxisKeys.forEach(function(xAxisKey, index) {
    formatedData[index] = {};
    formatedData[index].itemName = xAxisKey;
    formatedData[index].items = [];
  });

  jsonData.GraphPointsList.forEach(function(point, floorIndex) {
    point.GraphPointList.forEach(function(graphPoint, dayIndex) {
      if (graphPoint.Yaxis !== null) {
        formatedData[dayIndex].items.push({
          Xaxis: new Date(graphPoint.Xaxis),
          Yaxis: +graphPoint.Yaxis,
          itemName: point.ItemName,
          barWidthFactor: 0
        });
      }
    });
  });

  return formatedData;
}

function FormatJsonForHeatmap(jsonData) {
  var formatedData = [];
  jsonData.GraphPointsList.forEach(function(graphPointsList, floorIndex) {
    formatedData.push({
      itemName: graphPointsList.ItemName,
      items: []
    });

    graphPointsList.GraphPointList.forEach(function(graphPoint) {
      if (graphPoint.Yaxis !== null) {
        formatedData[floorIndex].items.push({
          itemName: formatedData[floorIndex].itemName,
          Xaxis: new Date(graphPoint.Xaxis),
          Yaxis: +graphPoint.Yaxis
        });
      }
    });
  });
  return formatedData;
}

function FormatCSVForBarchart(csvData, xTag, yTag, itemNameTag, sortFlag) {
  var formatedData = [];

  csvData.forEach(function(d) {
    if (Find(formatedData, 'itemName', d[xTag]) !== null) return;
    
    var items = FindAll(csvData, xTag, d[xTag]);
    var formatedItem = {};
    formatedItem.itemName = d[xTag];
    formatedItem.items = [];
    items.forEach(function(item) {
      if (item[yTag] !== null) {
        formatedItem.items.push({
          Xaxis: Weekday2Date(item[xTag]),
          Yaxis: +item[yTag],
          itemName: item[itemNameTag],
          barWidthFactor: 0
        });
      }
    });
    if (sortFlag) {
      formatedItem.items.sort(function(a, b) {
        if ((typeof a.itemName) === 'string')
          return weekdayNames.indexOf(a.itemName.toLowerCase()) > weekdayNames.indexOf(b.itemName.toLowerCase());
        return moment(a.itemName).day() < moment(b.itemName).day();
      });
    }
    formatedData.push(formatedItem);
  });
  formatedData.forEach(function(d) {
    d.itemName = Weekday2Date(d.itemName);
  });

  return formatedData;
}

function FormatCSVForHeatmap(csvData, xTag, yTag, itemNameTag, sortFlag) {
  var formatedData = [];
  csvData.forEach(function(d) {
    if (Find(formatedData, 'itemName', d[itemNameTag]) !== null) return;
    var items = FindAll(csvData, itemNameTag, d[itemNameTag]);
    var formatedItem = {};
    formatedItem.itemName = d[itemNameTag];
    formatedItem.items = [];
    items.forEach(function(item) {
      formatedItem.items.push({
        Xaxis: Weekday2Date(item[xTag]),
        Yaxis: +item[yTag],
        itemName: d[itemNameTag]
      });
    });
    if (sortFlag) {
      formatedItem.items.sort(function(a, b) {
        if ((typeof a.Xaxis) === 'string')
          return weekdayNames.indexOf(a.Xaxis.toLowerCase()) < weekdayNames.indexOf(b.Xaxis.toLowerCase());
        return moment(a.Xaxis).day() > moment(b.Xaxis).day();
      });
    }
    formatedData.push(formatedItem);
  });
  if (sortFlag) {
    formatedData.sort(function(a, b) {
      if ((typeof a.itemName) === 'string') {
        return weekdayNames.indexOf(a.itemName.toLowerCase()) > weekdayNames.indexOf(b.itemName.toLowerCase());
      }
      return moment(a.itemName).day() < moment(b.itemName).day();
    });
  }
  return formatedData;
}

function FormatJsonForOccupancy(occupancyData) {
  return occupancyData;
}

function startLoading() {
  $("body").addClass("loading");
}

function stopLoading() {
  $("body").removeClass("loading");
}
