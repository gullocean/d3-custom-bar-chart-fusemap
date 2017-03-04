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
