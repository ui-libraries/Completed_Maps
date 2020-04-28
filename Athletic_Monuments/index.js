let mapFeatures = []
mainlayerJson.features.forEach(function(val) {
  mapFeatures.push(Object.keys(val.properties))
})



let myIcon = L.icon({
  iconUrl: 'my-icon.png',
  iconRetinaUrl: 'my-icon@2x.png',
  iconSize: [1, 1],
  iconAnchor: [1, 1],
  popupAnchor: [-1, -1]
})

let map = L.map('map', {
  layers: [basemap],
  center: L.latLng(38, -97),
  zoom: 5
})

function onEachFeature(feature, layer) {
  if (feature.properties) {
    let props = feature.properties

    let popup = `<h2>${props.Athlete}</h2><h3>${props.Description}</h3>${props.image}` // fill popup with specific desired content

    var toprightOptions = {
      maxWidth: 'auto',
      maxHeight: 320, // set maximum height of the popup content to 320 pixels
      offset: [175, 0], // set position to the top-right of clicked point
    }

    var bottomrightOptions = {
      maxWidth: 'auto',
      maxHeight: 320, // set maximum height of the popup content to 320 pixels
      offset: [175, 400], // set position to the bottom-right of clicked point
    }

    var topleftOptions = {
      maxWidth: 'auto',
      maxHeight: 320, // set maximum height of the popup content to 320 pixels
      offset: [-175, 0], // set position to the top-left of clicked point
    }

    var bottomleftOptions = {
      maxWidth: 'auto',
      maxHeight: 320, // set maximum height of the popup content to 320 pixels
      offset: [-175, 400], // set position to the bottom-left of clicked point
    }

    feature.layer = layer

    var pointLat = layer._latlng.lat; // get the latitude of each point
    var pointLng = layer._latlng.lng; // get the longitude of each point

    var bnds = map.getBounds(); // get the bounding coordinates of the map on initial zoom level
    var maxLat = bnds.getNorth(); // get the north most latitude
    var maxLng = bnds.getEast(); // get the east most longitude
    var minLat = bnds.getSouth(); // get the south most latitude
    var minLng = bnds.getWest(); // get the west most longitude

    // change the position of the popup to bottom-left if it is too far northeast
    if (pointLat > maxLat - ((maxLat - minLat) / 3) && pointLng > maxLng - ((maxLng - minLng) / 6)) {
      layer.bindPopup(popup, bottomleftOptions);
    }
    // change the position of the popup to bottom-right if it is too far north or northwest
    else if (pointLat > maxLat - ((maxLat - minLat) / 3) || pointLat > maxLat - ((maxLat - minLat) / 3) && pointLng < minLng + ((maxLng - minLng) / 6)) {
      layer.bindPopup(popup, bottomrightOptions);
    }
    // change the position of the popup to top-left if it is too far east or southeast
    else if (pointLng > maxLng - ((maxLng - minLng) / 6) || pointLat < minLat + ((maxLat - minLat) / 3) && pointLng > maxLng - ((maxLng - minLng) / 6)) {
      layer.bindPopup(popup, topleftOptions);
    }
    // otherwise, place the popup to the top-right
    else layer.bindPopup(popup, toprightOptions);

    // get the revised bounding coordinates of the map upon dragging or zooming
    map.on('dragend zoomend', function onDragEnd() {
      var boundings = map.getBounds();
      var maxY = boundings.getNorth();
      var minY = boundings.getSouth();
      var maxX = boundings.getEast();
      var minX = boundings.getWest();

      // change the position of the popup to bottom-left if it is too far northeast
      if (pointLat > maxY - ((maxY - minY) / 3) && pointLng > maxX - ((maxX - minX) / 6)) {
        layer.bindPopup(popup, bottomleftOptions);
      }
      // change the position of the popup to bottom-right if it is too far north or northwest
      else if (pointLat > maxY - ((maxY - minY) / 3) || pointLat > maxY - ((maxY - minY) / 3) && pointLng < minX + ((maxX - minX) / 6)) {
        layer.bindPopup(popup, bottomrightOptions);
      }
      // change the position of the popup to top-left if it is too far east or southeast
      else if (pointLng > maxX - ((maxX - minX) / 6) || pointLat < minY + ((maxY - minY) / 3) && pointLng > maxX - ((maxX - minX) / 6)) {
        layer.bindPopup(popup, topleftOptions);
      }
      // otherwise, place the popup to the top-right
      else layer.bindPopup(popup, toprightOptions);
    })

    // added the following code from https://stackoverflow.com/questions/51732698/leaflet-popup-update-resizing-solution-recreating-a-popup-everytime-unable
    // in order to update the popup before displaying so that images do not exceed the popup container upon the user's first click
    document.querySelector(".leaflet-popup-pane").addEventListener("load", function(event) {
      var tagName = event.target.tagName,
        pop = map._popup;
      // Also check if flag is already set.
      if (tagName === "IMG" && pop && !pop._updated) {
        pop._updated = true; // Set flag to prevent looping.
        pop.update();
      }
    }, true);

  }
}

let mainlayer = new L.geoJson(mainlayerJson, {
  onEachFeature: onEachFeature,
  pointToLayer: function(feature, latlng) {
    return L.circleMarker(latlng, markercolor)
  }
}).addTo(map)

let timelineLayer = L.geoJson(mainlayerJson, {
  onEachFeature: onEachFeature,
  pointToLayer: function(feature, latlng) {
    return L.circleMarker(latlng, timeMarkers)
  }
})

let searchLayer = L.geoJson(mainlayerJson, {
  onEachFeature: onEachFeature,
  pointToLayer: function(feature, latlng) {
    return L.circleMarker(latlng, CircleMarkers)
  }
})

let sliderControl = L.control.sliderControl({
  position: 'bottomleft',
  layer: timelineLayer,
  range: true,
  alwaysShowDate: true
})

let searchOptions = {
  position: 'topleft',
  title: 'Search',
  placeholder: 'Type here',
  maxResultLength: 10,
  caseSensitive: false,
  showInvisibleFeatures: true,
  layerToToggle: searchLayer,
  threshold: 0.5, // default is .5, will match imperfect results
  showResultFct: function(feature, container) {
    props = feature.properties
    let name = L.DomUtil.create('b', null, container)
    name.innerHTML = mapFeatures[0][0]
    container.appendChild(L.DomUtil.create('br', null, container))
    let cat = props[mapFeatures[0][0]]
    container.appendChild(document.createTextNode(cat))
  }
}

function displayFeatures(features, layer) {
  let popup = L.DomUtil.create('div', 'tiny-popup', map.getContainer())
  for (let id in features) {
    let feat = features[id]
    let cat = feat.properties.NAME
    let site = L.geoJson(feat, {
      pointToLayer: function(feature, latlng) {
        let marker = L.marker(latLng, {
          icon: myIcon,
          keyboard: false,
          riseOnHover: true
        })
        if (!L.touch) {
          marker.on('mouseover', function(position) {

          }).on('mouseout', function(position) {
            L.DomUtil.removeClass(popup, 'visible')
          })
        }
        return marker
      },
      onEachFeature: onEachFeature
    })
    if (layer !== undefined) {
      layer.addLayer(site)
    }
  }
  return layer
}

let bounds = L.latLngBounds(mainlayer)

//map.fitBounds(mainlayer.getBounds())

let overlays = {}
overlays[mainlayerName] = mainlayer

let baseMaps = {
  '<strong>Layer List</strong>': basemap
}

L.LegendControl = L.Control.extend({
  onAdd: function(map) {

    let div = L.DomUtil.create('div', 'info legend')
    let labels = []

    labels.push(
      `<i style="background: ${markercolor.fillColor}"></i> inactive`,
      `<i style="background: ${timeMarkers.fillColor}"></i> active`
    )

    div.innerHTML = labels.join('<br>')
    return div
  }
});

L.legendControl = function(options) {
  return new L.LegendControl(options);
}



L.control.layers(baseMaps, overlays, {
  collapsed: false
}).addTo(map)

let searchControl = L.control.fuseSearch(searchOptions)
map.addControl(searchControl)
map.addControl(sliderControl)

if (timeline === true) {
  L.legendControl({
    position: 'bottomright'
  }).addTo(map)
  sliderControl.startSlider()
}

searchControl.indexFeatures(mainlayerJson.features, mapFeatures[0])
