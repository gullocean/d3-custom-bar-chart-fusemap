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
