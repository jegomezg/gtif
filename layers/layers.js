var wms_layers = [];

var format_Industry = new ol.format.GeoJSON();
var features_Industry = format_Industry.readFeatures(json_Industry_1, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});

var format_Forest = new ol.format.GeoJSON();
var features_Forest = format_Industry.readFeatures(json_Forest_3, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});

var format_urban = new ol.format.GeoJSON();
var features_urban = format_Industry.readFeatures(json_urban_2, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});

// Calculate firstMeans and d3Color here
var firstMeans_industry = features_Industry.map(function(feature) {
    return feature.get('mean_series')[0];
});

var firstMeans_Forest = features_Forest.map(function(feature) {
    return feature.get('mean_series')[0];
});

var firstMeans_Forest = features_urban.map(function(feature) {
    return feature.get('mean_series')[0];
});

var min_Industry = d3.min(firstMeans_industry);
var max_industry = d3.max(firstMeans_industry);

var min_Forest = d3.min(firstMeans_Forest);
var max_Forest = d3.max(firstMeans_Forest);

var min_arban = d3.min(firstMeans_Forest);
var max_urban = d3.max(firstMeans_Forest);

// Make d3Color a global variable
window.d3Color_Industry = d3.scaleSequential(d3.interpolateSpectral).domain([max_industry, min_Industry]);
window.d3Color_Forest = d3.scaleSequential(d3.interpolateSpectral).domain([max_Forest, min_Forest]);
window.d3Color_urban = d3.scaleSequential(d3.interpolateSpectral).domain([min_arban, max_urban]);



var jsonSource_Industry = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_Industry.addFeatures(features_Industry);
var lyr_Industry = new ol.layer.Vector({
                declutter: true,
                source:jsonSource_Industry, 
                style: style_Forest, // No need to pass features as a parameter
                interactive: true,
                title: ' Industrial unities'
            });

var baseMapLayer = new ol.layer.Tile({
    source: new ol.source.OSM()
});


var jsonSource_Forest = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_Forest.addFeatures(features_Forest);
var lyr_Forest = new ol.layer.Vector({
                declutter: true,
                source:jsonSource_Forest, 
                style: style_Forest, // No need to pass features as a parameter
                interactive: true,
                title: 'Mixed Forest'
            });

var baseMapLayer = new ol.layer.Tile({
    source: new ol.source.OSM()
});

var jsonSource_urban = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_urban.addFeatures(features_urban);
var lyr_urban = new ol.layer.Vector({
                declutter: true,
                source:jsonSource_urban, 
                style: style_Forest, // No need to pass features as a parameter
                interactive: true,
                title: 'Continous urban fabric'
            });



var lyr_repro_1 = new ol.layer.Image({
    opacity: 0.3,
    title: "Land Cover Class",
    
    
    source: new ol.source.ImageStatic({
       url: "./layers/Land_Cover.png",
       attributions: ' ',
       projection: 'EPSG:3857',
       alwaysInRange: true,
       imageExtent: [1422459.789963, 6055368.136943, 1460340.220974, 6091458.763981]
    })
});


var baseMapLayer = new ol.layer.Tile({
    source: new ol.source.OSM()
});

wms_layers.unshift(baseMapLayer);




var layersList = [baseMapLayer,lyr_repro_1,lyr_Industry,lyr_Forest,lyr_urban];
