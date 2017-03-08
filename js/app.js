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

  return moment().add(weekdayNo - moment().day(), 'days').toDate();
}

function FormatJsonForBarchart(json) {
  var formatedData = [];

  if (json.GraphPointsList.length === 0) {
    console.log('There is no GraphPointsList!');
    return null;
  }

  if (json.GraphPointsList[0].GraphPointList.length === 0) {
    console.log('There is no GraphPointList!');
    return null;
  }

  var itemNames = json.GraphPointsList.map((d) => d.ItemName);
  var xAxisKeys = json.GraphPointsList[0].GraphPointList.map((d) => new Date(d.Xaxis));

  formatedData = new Array(xAxisKeys.length);

  xAxisKeys.forEach(function(xAxisKey, index) {
    formatedData[index] = {};
    formatedData[index].itemName = new Date(xAxisKey.getTime());
    formatedData[index].items = [];
  });

  json.GraphPointsList.forEach(function(point, floorIndex) {
    point.GraphPointList.forEach(function(graphPoint, dayIndex) {
      // if (graphPoint.Yaxis !== null && +graphPoint.Yaxis !== 0)
        formatedData[dayIndex].items.push({
          Xaxis: 0,
          Yaxis: +graphPoint.Yaxis,
          itemName: point.ItemName
        });
    });
  });

  return formatedData;
}

function FormatJsonForHeatmap(json) {
  // 
}

function FormatCSVForBarchart(csv, xTag, yTag, itemNameTag) {
  var formatedData = [];

  csv.forEach(function(d) {
    if (Find(formatedData, 'itemName', d[itemNameTag]) !== null) return;
    
    var items = FindAll(csv, itemNameTag, d[itemNameTag]);
    var formatedItem = {};
    formatedItem.itemName = d[itemNameTag];
    formatedItem.items = [];
    items.forEach(function(item) {
      if (item[yTag] !== null && (+item[yTag]) !== 0) {
        formatedItem.items.push({
          Xaxis: 1,
          Yaxis: +item[yTag],
          itemName: item[xTag]
        });
      }
    });
    formatedData.push(formatedItem);
  });
  formatedData.forEach(function(d) {
    d.itemName = Weekday2Date(d.itemName);
  });
  formatedData.sort(function(a, b) {
    return moment(a.itemName).day() > moment(b.itemName).day();
  });

  return formatedData;
}

function FormatCSVForHeatmap(csv) {
  // 
}
