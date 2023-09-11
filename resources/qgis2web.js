

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
    var year = document.getElementById('yearSelector').value; // Get the selected year from the dropdown

    const initialMonthIndex = 0;
    setLegendForMonth(initialMonthIndex,year);
};


function setLegendForMonth(monthIndex,year) {
    // Recalculate means for selected month
    const calculateMeans = (features) => features.map(feature => feature.get('obs_series_' + year)[monthIndex]);
    console.log('mean_series_' + year)

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
    year
    lyr_urban.setStyle(style_Forest);
    lyr_urban.changed();

    updateLegend(min, max);
}


slider.addEventListener('input', function() {
    var year = document.getElementById('yearSelector').value; // Get the selected year from the dropdown
    const selectedMonth = parseInt(slider.value);
    monthDisplay.textContent = months[selectedMonth];
    setLegendForMonth(selectedMonth, year);
});


document.getElementById('yearSelector').addEventListener('change', function() {
    var year = this.value;
    const slider = document.getElementById("month-slider");

    const selectedMonth = parseInt(slider.value);
    if (selectedFeature) { // Only update if there's a selected feature
        var year = this.value;
        var obsVariableName = 'obs_series_' + year;

        var hexData = selectedFeature.getProperties();
        var meanSeries = hexData.mean_series;
        var stdSeries = hexData.std_series;
        var obsSeries = hexData[obsVariableName];

        renderTimeSeries(meanSeries, stdSeries, obsSeries);
    }

    setLegendForMonth(selectedMonth, year);
});
