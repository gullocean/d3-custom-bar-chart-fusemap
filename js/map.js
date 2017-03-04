function Map() {
  function map() {
    Init();
  }

  /*
   *  access token of developer
   */
  map.accessToken = function(value) {
    if (!arguments.length) return accessToken;
    accessToken = value;
    return map;
  }

  /*
   *  id of map-container
   */
  map.containerID = function(value) {
    if (!arguments.length) return containerID;
    containerID = value;
    return map;
  }

  /*
   *  geojson data for map
   */
  map.geojson = function(value) {
    if (!arguments.length) return geojson;
    geojson = value;
    return map;
  }

  /*
   *  tilejson data for map
   */
  map.tilejson = function(value) {
    if (!arguments.length) return tilejson;
    tilejson = value;
    return map;
  }

  /*
   *  center of view for map
   */
  map.viewCenter = function(value) {
    if (!arguments.length) return viewCenter;
    viewCenter = value;
    return map;
  }

  /*
   *  zoom level for map
   */
  map.zoomLevel = function(value) {
    if (!arguments.length) return zoomLevel;
    zoomLevel = value;
    return map;
  }

  function Init() {
    tilejson = {
      tiles: [ "https://api.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=" + accessToken],
      minzoom: zoomLevel - 2,
      maxzoom: zoomLevel + 2
    };
    
    var map = L.mapbox.map(containerID, tilejson).setView(viewCenter, zoomLevel);

    var myLayer = L.mapbox.featureLayer(geojson, {
      pointToLayer: function(feature, latlon) {
        return L.circleMarker(latlon, {
          fillColor: feature.color,
          fillOpacity: 1,
          stroke: false
        });
      },
      onEachFeature: function(feature, layer) {
        layer.bindPopup(feature.properties.show_on_map);
      },
      filter: function(feature, layer) {
        return feature.properties.show_on_map;
      }
    })
    // .bindPopup('<div>pop up</div>')
    .addTo(map);

    var popup = L.Popup({
        closeButton: false,
        closeOnClick: false
    });

    myLayer.on('click', function(e) {
      onClick(e.layer.feature);
      var popup = L.popup()
        .setLatLng(e.latlng)
        .setContent('<div>' + e.layer.feature.color + '</div>')
        .openOn(map);
    });

    var popup = L.popup({
      closeButton: false,
      closeOnClick: false
    });

    myLayer.on('mousemove', function(e) {
      if (!popup._isOpen)
      popup
        .setLatLng(e.layer._latlng)
        .setContent('<div>' + e.layer.feature.color + '</div>')
        .openOn(map);
    });

    myLayer.on('mouseout', function(e) {
      map.closePopup();
    });
  }

  function onClick(feature) {
    console.log(feature);
  }

  return map;
}