function Map() {
  let accessToken = '';
  let containerID = '';
  let geojson = '';
  let viewCenter = null;
  let zoomLevel = 1;

  /*
   *  access token of developer
   */
  this.AccessToken = function(value) {
    if (!arguments.length) return accessToken;
    accessToken = value;
  }

  /*
   *  id of map-container
   */
  this.ContainerID = function(value) {
    if (!arguments.length) return containerID;
    containerID = value;
  }

  /*
   *  geojson data for map
   */
  this.Geojson = function(value) {
    if (!arguments.length) return geojson;
    geojson = value;
  }

  /*
   *  center of view for map
   */
  this.ViewCenter = function(value) {
    if (!arguments.length) return viewCenter;
    viewCenter = value;
  }

  /*
   *  zoom level for map
   */
  this.ZoomLevel = function(value) {
    if (!arguments.length) return zoomLevel;
    zoomLevel = value;
  }

  this.Init = function() {
    L.mapbox.accessToken = accessToken;

    var map_options = {
      attributionControl: false,
      legendControl: true,
      zoomControl: false,
      minZoom: 0,
      maxZoom: 18
    };
    
    var map = L.mapbox.map(containerID, null, map_options)
      .setView(viewCenter, zoomLevel);
    map
      .legendControl
        .addLegend('<div class="heatmap-legend">test div</div>')
        .setPosition('bottomleft');

    var zoomControl = L.control.zoom({position: 'topright'}).addTo(map);

    var styleLayer = L.mapbox.styleLayer('mapbox://styles/mapbox/streets-v9').addTo(map);

    var positionLayer = L.mapbox.featureLayer().addTo(map);

    positionLayer.on('layeradd', function(e) {
      var marker = e.layer,
        feature = marker.feature;
      marker.setIcon(L.divIcon(feature.properties.icon));
    });
    positionLayer.setGeoJSON(geojson);

    positionLayer.on('click', function(e) {
      onClick(e.layer);
    });

    positionLayer.on('mouseover', function(e) {
      e.layer.openPopup();
    });

    positionLayer.on('mouseout', function(e) {
      e.layer.closePopup();
    });
  }

  function onClick(feature) {
    console.log(feature);
  }
}