

var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');
var sketch;

closer.onclick = function() {
    container.style.display = 'none';
    closer.blur();
    return false;
};
var overlayPopup = new ol.Overlay({
    element: container
});

var expandedAttribution = new ol.control.Attribution({
    collapsible: false
});

var map = new ol.Map({
    controls: ol.control.defaults({attribution:false}).extend([
        expandedAttribution
    ]),
    target: document.getElementById('map'),
    renderer: 'canvas',
    overlays: [overlayPopup],
    layers: layersList,
    view: new ol.View({
         maxZoom: 28, minZoom: 1
    })
});

var layerSwitcher = new ol.control.LayerSwitcher({tipLabel: "Layers"});
map.addControl(layerSwitcher);
layerSwitcher.element.classList.add('ol-control-bottom-left');

// Expand the layer switcher panel after adding to the map
layerSwitcher.showPanel();

// Override the LayerSwitcher's default behavior for several events
['click', 'mouseover', 'mouseout'].forEach(function(evtType) {
    layerSwitcher.element.addEventListener(evtType, function(event) {
        event.stopPropagation();
        layerSwitcher.showPanel(); // Ensure it remains open
    });
});

// Prevent the LayerSwitcher from reacting to a map click or hover, which could close it
map.getTargetElement().addEventListener('click', function(event) {
    event.stopPropagation();
});

map.getView().fit([1422944.660449, 6051803.232526, 1458485.014839, 6095131.002836], map.getSize());

var NO_POPUP = 0
var ALL_FIELDS = 1

/**
 * Returns either NO_POPUP, ALL_FIELDS or the name of a single field to use for
 * a given layer
 * @param layerList {Array} List of ol.Layer instances
 * @param layer {ol.Layer} Layer to find field info about
 */
function getPopupFields(layerList, layer) {
    // Determine the index that the layer will have in the popupLayers Array,
    // if the layersList contains more items than popupLayers then we need to
    // adjust the index to take into account the base maps group
    var idx = layersList.indexOf(layer) - (layersList.length - popupLayers.length);
    return popupLayers[idx];
}


var collection = new ol.Collection();
var featureOverlay = new ol.layer.Vector({
    map: map,
    source: new ol.source.Vector({
        features: collection,
        useSpatialIndex: false // optional, might improve performance
    }),
    style: [new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#f00',
            width: 1
        }),
        fill: new ol.style.Fill({
            color: 'rgba(255,0,0,0.1)'
        }),
    })],
    updateWhileAnimating: true, // optional, for instant visual feedback
    updateWhileInteracting: true // optional, for instant visual feedback
});

var doHighlight = false;
var doHover = false;

var highlight;
var autolinker = new Autolinker({truncate: {length: 30, location: 'smart'}});
var onPointerMove = function(evt) {
    if (!doHover && !doHighlight) {
        return;
    }
    var pixel = map.getEventPixel(evt.originalEvent);
    var coord = evt.coordinate;
    var popupField;
    var currentFeature;
    var currentLayer;
    var currentFeatureKeys;
    var clusteredFeatures;
    var popupText = '<ul>';
    map.forEachFeatureAtPixel(pixel, function(feature, layer) {
        // We only care about features from layers in the layersList, ignore
        // any other layers which the map might contain such as the vector
        // layer used by the measure tool
        if (layersList.indexOf(layer) === -1) {
            return;
        }
        var doPopup = false;
        for (k in layer.get('fieldImages')) {
            if (layer.get('fieldImages')[k] != "Hidden") {
                doPopup = true;
            }
        }
        currentFeature = feature;
        currentLayer = layer;
        clusteredFeatures = feature.get("features");
        var clusterFeature;
        if (typeof clusteredFeatures !== "undefined") {
            if (doPopup) {
                for(var n=0; n<clusteredFeatures.length; n++) {
                    clusterFeature = clusteredFeatures[n];
                    currentFeatureKeys = clusterFeature.getKeys();
                    popupText += '<li><table>'
                    for (var i=0; i<currentFeatureKeys.length; i++) {
                        if (currentFeatureKeys[i] != 'geometry') {
                            popupField = '';
                            if (layer.get('fieldLabels')[currentFeatureKeys[i]] == "inline label") {
                            popupField += '<th>' + layer.get('fieldAliases')[currentFeatureKeys[i]] + ':</th><td>';
                            } else {
                                popupField += '<td colspan="2">';
                            }
                            if (layer.get('fieldLabels')[currentFeatureKeys[i]] == "header label") {
                                popupField += '<strong>' + layer.get('fieldAliases')[currentFeatureKeys[i]] + ':</strong><br />';
                            }
                            if (layer.get('fieldImages')[currentFeatureKeys[i]] != "ExternalResource") {
                                popupField += (clusterFeature.get(currentFeatureKeys[i]) != null ? autolinker.link(clusterFeature.get(currentFeatureKeys[i]).toLocaleString()) + '</td>' : '');
                            } else {
                                popupField += (clusterFeature.get(currentFeatureKeys[i]) != null ? '<img src="images/' + clusterFeature.get(currentFeatureKeys[i]).replace(/[\\\/:]/g, '_').trim()  + '" /></td>' : '');
                            }
                            popupText += '<tr>' + popupField + '</tr>';
                        }
                    } 
                    popupText += '</table></li>';    
                }
            }
        } else {
            currentFeatureKeys = currentFeature.getKeys();
            if (doPopup) {
                popupText += '<li><table>';
                for (var i=0; i<currentFeatureKeys.length; i++) {
                    if (currentFeatureKeys[i] != 'geometry') {
                        popupField = '';
                        if (layer.get('fieldLabels')[currentFeatureKeys[i]] == "inline label") {
                            popupField += '<th>' + layer.get('fieldAliases')[currentFeatureKeys[i]] + ':</th><td>';
                        } else {
                            popupField += '<td colspan="2">';
                        }
                        if (layer.get('fieldLabels')[currentFeatureKeys[i]] == "header label") {
                            popupField += '<strong>' + layer.get('fieldAliases')[currentFeatureKeys[i]] + ':</strong><br />';
                        }
                        if (layer.get('fieldImages')[currentFeatureKeys[i]] != "ExternalResource") {
                            popupField += (currentFeature.get(currentFeatureKeys[i]) != null ? autolinker.link(currentFeature.get(currentFeatureKeys[i]).toLocaleString()) + '</td>' : '');
                        } else {
                            popupField += (currentFeature.get(currentFeatureKeys[i]) != null ? '<img src="images/' + currentFeature.get(currentFeatureKeys[i]).replace(/[\\\/:]/g, '_').trim()  + '" /></td>' : '');
                        }
                        popupText += '<tr>' + popupField + '</tr>';
                    }
                }
                popupText += '</table></li>';
            }
        }
    });
    if (popupText == '<ul>') {
        popupText = '';
    } else {
        popupText += '</ul>';
    }

    if (doHighlight) {
        if (currentFeature !== highlight) {
            if (highlight) {
                featureOverlay.getSource().removeFeature(highlight);
            }
            if (currentFeature) {
                var styleDefinition = currentLayer.getStyle().toString();

                if (currentFeature.getGeometry().getType() == 'Point') {
                    var radius = styleDefinition.split('radius')[1].split(' ')[1];

                    highlightStyle = new ol.style.Style({
                        image: new ol.style.Circle({
                            fill: new ol.style.Fill({
                                color: "#ffff00"
                            }),
                            radius: radius
                        })
                    })
                } else if (currentFeature.getGeometry().getType() == 'LineString') {

                    var featureWidth = styleDefinition.split('width')[1].split(' ')[1].replace('})','');

                    highlightStyle = new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: '#ffff00',
                            lineDash: null,
                            width: featureWidth
                        })
                    });

                } else {
                    highlightStyle = new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: '#ffff00'
                        })
                    })
                }
                featureOverlay.getSource().addFeature(currentFeature);
                featureOverlay.setStyle(highlightStyle);
            }
            highlight = currentFeature;
        }
    }

    if (doHover) {
        if (popupText) {
            overlayPopup.setPosition(coord);
            content.innerHTML = popupText;
            container.style.display = 'block';        
        } else {
            container.style.display = 'none';
            closer.blur();
        }
    }
};


var selectedFeature;
        
map.on('singleclick', function(evt) {

    var year = document.getElementById('yearSelector').value; // Get the selected year from the dropdown
    var obsVariableName = 'obs_series_' + year; // Construct the dynamic variable name

    var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
        return feature; // Return the feature directly.
    });

    if (feature) {
        // Reset style of the previously selected feature, if it exists.
        if (selectedFeature) {
            selectedFeature.setStyle(undefined);
        }

        // If the clicked feature is the same as the selected one, don't restyle it.
        if (selectedFeature !== feature) {
            var hexData = feature.getProperties();
            var meanSeries = hexData.mean_series;
            var stdSeries = hexData.std_series;
            var obsSeries = hexData[obsVariableName];
            console.log(obsVariableName)
            renderTimeSeries(meanSeries, stdSeries, obsSeries);

            // Add a style change to the clicked hexagon.
            feature.setStyle(new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'blue',
                    width: 1
                })
            }));

            selectedFeature = feature; // Store reference to the currently selected feature.
        }
    }
});






// Assuming you're using ol (OpenLayers)
const slider = document.getElementById("month-slider");
const monthDisplay = document.getElementById("month-display");
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];


window.onload = function() {
    // When the page loads, set the initial legend for January (index 0)
    const initialMonthIndex = 0;
    setLegendForMonth(initialMonthIndex);
};


function setLegendForMonth(monthIndex) {
    // Recalculate means for selected month
    const calculateMeans = (features) => features.map(feature => feature.get('mean_series')[monthIndex]);

    const firstMeans_industry = calculateMeans(features_Industry);
    const firstMeans_Forest = calculateMeans(features_Forest);
    const firstMeans_urban = calculateMeans(features_urban);

    // Combine all means to find overall min and max
    const allMeans = firstMeans_industry.concat(firstMeans_Forest).concat(firstMeans_urban);

    const min = d3.min(allMeans);
    const max = d3.max(allMeans);

    window.d3Color_Forest = d3.scaleSequential(d3.interpolateSpectral).domain([max, min]);

    lyr_Industry.setStyle(style_Forest);
    lyr_Industry.changed();

    lyr_Forest.setStyle(style_Forest);
    lyr_Forest.changed();

    lyr_urban.setStyle(style_Forest);
    lyr_urban.changed();

    updateLegend(min, max);
}


slider.addEventListener('input', function() {
    const selectedMonth = parseInt(slider.value);
    monthDisplay.textContent = months[selectedMonth];
    setLegendForMonth(selectedMonth);
});