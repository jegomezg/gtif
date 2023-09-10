var style_Industry = function(feature, resolution){
    var context = {
        feature: feature,
        variables: {}
    };
    var mean_series = feature.get('mean_series');
    var first_mean = mean_series[0];
    var color = window.d3Color_Industry(first_mean);
    // Adjusted the color to spectral based on the first mean value
    var rgbaColor = color;
    var labelText = "";
    var size = 0;
    var labelFont = "10px, sans-serif";
    var labelFill = "#FFA500";
    var bufferColor = "#FFA500";
    var bufferWidth = 0;
    var textAlign = "left";
    var offsetX = 8;
    var offsetY = 3;
    var placement = 'point';
    if ("" !== null) {
        labelText = String("");
    }
    var style = [ new ol.style.Style({
        stroke: new ol.style.Stroke({color: 'rgba(35,35,35,1.0)', lineDash: null, lineCap: 'butt', lineJoin: 'miter', width: 0}),fill: new ol.style.Fill({color: rgbaColor}),
        text: createTextStyle(feature, resolution, labelText, labelFont,
                              labelFill, placement, bufferColor,
                              bufferWidth)
    })];

    return style;
};


var style_Forest = function(feature, resolution){
    var context = {
        feature: feature,
        variables: {}
    };
    var mean_series = feature.get('mean_series');
    
    // Grab the current month index from the slider's value
    const selectedMonth = parseInt(document.getElementById("month-slider").value);

    var current_mean = mean_series[selectedMonth];
    var color = window.d3Color_Forest(current_mean);
    var rgbaColor = color;
    var labelText = "";
    var labelFont = "10px, sans-serif";
    var labelFill = "#FFA500";
    var bufferColor = "#FFA500";
    var bufferWidth = 0;
    var placement = 'point';
    if ("" !== null) {
        labelText = String("");
    }
    var style = [ new ol.style.Style({
        stroke: new ol.style.Stroke({color: 'rgba(35,35,35,1.0)', lineDash: null, lineCap: 'butt', lineJoin: 'miter', width: 0}),fill: new ol.style.Fill({color: rgbaColor}),
        text: createTextStyle(feature, resolution, labelText, labelFont,
                              labelFill, placement, bufferColor,
                              bufferWidth)
    })];

    return style;
};


