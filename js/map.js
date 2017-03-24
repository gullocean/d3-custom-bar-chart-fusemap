function Map() {
  let accessToken = '';
  let containerID = '';
  let geojson = '';
  let tilejson = '';
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
   *  tilejson data for map
   */
  this.Tilejson = function(value) {
    if (!arguments.length) return tilejson;
    tilejson = value;
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
    tilejson = {
      tiles: [ "https://api.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=" + accessToken],
      minzoom: 0,
      maxzoom: zoomLevel + 12
    };
    
    L.mapbox.accessToken = accessToken;
    var options = {
      zoomControl: false
    };
    
    var map = L.mapbox.map(containerID, 'mapbox.streets', options)
      .setView(viewCenter, zoomLevel);

    var zoomControl = new L.control.zoom({position: 'topright'}).addTo(map);

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