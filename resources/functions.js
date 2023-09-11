var createTextStyle = function(feature, resolution, labelText, labelFont,
                               labelFill, placement, bufferColor,
                               bufferWidth) {

    if (feature.hide || !labelText) {
        return; 
    } 

    if (bufferWidth == 0) {
        var bufferStyle = null;
    } else {
        var bufferStyle = new ol.style.Stroke({
            color: bufferColor,
            width: bufferWidth
        })
    }
    
    var textStyle = new ol.style.Text({
        font: labelFont,
        text: labelText,
        textBaseline: "middle",
        textAlign: "left",
        offsetX: 8,
        offsetY: 3,
        placement: placement,
        maxAngle: 0,
        fill: new ol.style.Fill({
          color: labelFill
        }),
        stroke: bufferStyle
    });

    return textStyle;
};


function stripe(stripeWidth, gapWidth, angle, color) {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    canvas.width = screen.width;
    canvas.height = stripeWidth + gapWidth;
    context.fillStyle = color;
    context.lineWidth = stripeWidth;
    context.fillRect(0, 0, canvas.width, stripeWidth);
    innerPattern = context.createPattern(canvas, 'repeat');

    var outerCanvas = document.createElement('canvas');
    var outerContext = outerCanvas.getContext('2d');
    outerCanvas.width = screen.width;
    outerCanvas.height = screen.height;
    outerContext.rotate((Math.PI / 180) * angle);
    outerContext.translate(-(screen.width/2), -(screen.height/2));
    outerContext.fillStyle = innerPattern;
    outerContext.fillRect(0,0,screen.width,screen.height);

    return outerContext.createPattern(outerCanvas, 'no-repeat');
};


function initializeEmptyPlot() {
    const width = 490;
    const height = 290;
    const margins = { top: 20, right: 20, bottom: 30, left: 50 };

    // Assuming these are the months.
    const months = ["Jan","Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const xScale = d3.scaleBand()
        .domain(months)
        .range([margins.left, width - margins.right]);

    // You can adjust this yScale domain as per your requirement.
    const yScale = d3.scaleLinear()
        .domain([0, 100])  // example domain
        .range([height - margins.bottom, margins.top]);

    d3.select("#graph").selectAll("svg").remove();

    const svg = d3.select("#graph").append("svg")
        .attr("width", width)
        .attr("height", height);

    // Horizontal grid lines
    svg.selectAll("line.horizontalGrid")
        .data(yScale.ticks())
        .enter()
        .append("line")
        .attr("class", "horizontalGrid")
        .attr("x1", margins.left)
        .attr("x2", width - margins.right)
        .attr("y1", function(d){ return yScale(d);})
        .attr("y2", function(d){ return yScale(d);})
        .attr("fill", "none")
        .attr("shape-rendering", "crispEdges")
        .attr("stroke", "lightgrey")
        .attr("stroke-width", "1px");

    // Vertical grid lines
    svg.selectAll("line.verticalGrid")
        .data(xScale.domain())
        .enter()
        .append("line")
        .attr("class", "verticalGrid")
        .attr("y1", margins.top)
        .attr("y2", height - margins.bottom)
        .attr("x1", function(d){ return xScale(d) + xScale.bandwidth()/2;})
        .attr("x2", function(d){ return xScale(d) + xScale.bandwidth()/2;})
        .attr("fill", "none")
        .attr("shape-rendering", "crispEdges")
        .attr("stroke", "lightgrey")
        .attr("stroke-width", "1px");

    // X-axis
    svg.append("g")
        .attr("transform", "translate(0," + (height - margins.bottom) + ")")
        .call(d3.axisBottom(xScale));

    // Y-axis
    svg.append("g")
        .attr("transform", "translate(" + margins.left + ",0)")
        .call(d3.axisLeft(yScale));
}

// Call the initialization function on page load
window.onload = initializeEmptyPlot;




function renderTimeSeries(mean_series, std_series, obs_series) {
    // Assuming your graph container has an ID of 'graph'
    const graphContainer = document.getElementById('graph');

    // Get the width of the container
    const containerWidth = graphContainer.clientWidth;
    
    // Use a percentage of the container's width for the graph's width
    const width = containerWidth * 0.95; // 95% of the container's width

    // Set height relative to width for consistent aspect ratio
    const height = width * 0.7;

    // Set margins relative to width and height
    const margins = {
        top: height * 0.02,     // 5% of height
        right: width * 0.02,    // 4% of width
        bottom: height * 0.1,   // 10% of height
        left: width * 0.11     // 10% of width
    };

    const color = d3.scaleOrdinal()
    .domain(["Baseline", "Range", "In range", "Anomaly"])
    .range(["blue", "orange", "green", "red"]);

    // Assuming these are the months. Adjust as needed.
    const months = ["Jan","Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const xScale = d3.scaleBand()
        .domain(months)
        .range([margins.left, width - margins.right]);

    const yScale = d3.scaleLinear()
        .domain([d3.min(mean_series, (d, i) => d - std_series[i]), d3.max(mean_series, (d, i) => d + std_series[i])])
        .range([height - margins.bottom, margins.top]);
        d3.select("#graph").selectAll("svg").remove();
    const svg = d3.select("#graph").append("svg")
        .attr("width", width)
        .attr("height", height);

        
    // Line generators
    const line = d3.line()
        .x((d, i) => xScale(months[i]))
        .y(d => yScale(d));

    const upperBoundLine = d3.line()
        .x((d, i) => xScale(months[i]))
        .y((d, i) => yScale(d + std_series[i]));

    const lowerBoundLine = d3.line()
        .x((d, i) => xScale(months[i]))
        .y((d, i) => yScale(d - std_series[i]));

    // Plotting the mean line
    svg.append("path")
        .datum(mean_series)
        .attr("d", line)
        .attr("stroke", "blue")
        .attr("stroke-width", 2)
        .attr("fill", "none");

    // Plotting the upper bound (mean + std)
    svg.append("path")
        .datum(mean_series)
        .attr("d", upperBoundLine)
        .attr("stroke", "orange")
        .attr("stroke-dasharray", "5,5")
        .attr("fill", "none");

    // Plotting the lower bound (mean - std)
    svg.append("path")
        .datum(mean_series)
        .attr("d", lowerBoundLine)
        .attr("stroke", "orange")
        .attr("stroke-dasharray", "5,5")
        .attr("fill", "none");

    // Plotting the observed series as points
    svg.selectAll(".dot")
        .data(obs_series)
        .enter().append("circle") // Uses the enter().append() method
        .attr("class", "dot") // Assign a class for styling
        .attr("cx", function(d, i) { return xScale(months[i]) })
        .attr("cy", function(d) { return yScale(d) })
        .attr("r", 3) // Make points smaller
        .attr("fill", function(d, i) { // Change color based on value
            if (d < mean_series[i] - std_series[i] || d > mean_series[i] + std_series[i]) {
                return "red";
            } else {
                return "green";
            }
        });

        // Horizontal grid lines
        svg.selectAll("line.horizontalGrid")
            .data(yScale.ticks())
            .enter()
            .append("line")
            .attr("class", "horizontalGrid")
            .attr("x1", margins.left)
            .attr("x2", width - margins.right)
            .attr("y1", function(d){ return yScale(d);})
            .attr("y2", function(d){ return yScale(d);})
            .attr("fill", "none")
            .attr("shape-rendering", "crispEdges")
            .attr("stroke", "lightgrey")
            .attr("stroke-width", "1px");

        // Vertical grid lines
        svg.selectAll("line.verticalGrid")
            .data(xScale.domain())
            .enter()
            .append("line")
            .attr("class", "verticalGrid")
            .attr("y1", margins.top)
            .attr("y2", height - margins.bottom)
            .attr("x1", function(d){ return xScale(d) + xScale.bandwidth()/2;})
            .attr("x2", function(d){ return xScale(d) + xScale.bandwidth()/2;})
            .attr("fill", "none")
            .attr("shape-rendering", "crispEdges")
            .attr("stroke", "lightgrey")
            .attr("stroke-width", "1px");


// Reduced the size of the enclosing rectangle
svg.append("rect")
    .attr("x", width - 85)  // Adjust position and size as needed
    .attr("y", 10)
    .attr("width", 65)   // Reduced width
    .attr("height", color.domain().length * 15 )  // Reduced height per item
    .style("fill", "white")
    .style("stroke", "black")
    .style("stroke-width", "1px");

var legendSpacing = 15;  // Reduced the spacing between legend items

var legend = svg.selectAll(".legend")
    .data(color.domain())
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate(0," + i * legendSpacing + ")"; });  // Used legendSpacing

// Use line instead of rect for the first set of legend items
legend.filter(function(d, i) { return i < color.domain().length - 2; })
    .append("line")
    .attr("x1", width - 35)  // Define the starting point of line (x-coordinate)
    .attr("y1", 16)          // Define the starting point of line (y-coordinate)
    .attr("x2", width - 25)  // Define the ending point of line (x-coordinate)
    .attr("y2", 16)          // Define the ending point of line (y-coordinate)
    .style("stroke", color)
    .style("stroke-width", "2px");  // Adjust stroke width as necessary

legend.filter(function(d, i) { return i >= color.domain().length - 2; })
    .append("circle")
    .attr("cx", width - 30 + 2.5)
    .attr("cy", 16 + 2.5)  // Adjusted y-value
    .attr("r", 2.5)
    .style("fill", color);

legend.append("text")
    .attr("x", width - 40)
    .attr("y", 16)  // Adjusted y-value for text
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .style("font-size", "8px")
    .text(function(d) { return d; });


    // X-axis
    svg.append("g")
        .attr("transform", "translate(0," + (height - margins.bottom) + ")")
        .call(d3.axisBottom(xScale));

    // Y-axis
    svg.append("g")
        .attr("transform", "translate(" + margins.left + ",0)")
        .call(d3.axisLeft(yScale));


    // X Axis label
    svg.append("text")
        .attr("class", "xlabel")
        .attr("x", width / 2 )
        .attr("y", height + margins.bottom)
        .style("text-anchor", "middle")
        .text("Your X Axis Label");

// Y Axis label
svg.append("text")
    .attr("class", "ylabel")
    .attr("transform", "rotate(-90)")
    .attr("y", margins.left * +0.5)  // Adjusted position relative to the left margin
    .attr("x", -(height / 2))  // Centers the label in the middle of the chart height
    .attr("dy", "-1em")  // Adjusts the vertical position relative to the rotation point
    .style("text-anchor", "middle")
    .style("font-size", "10px")  // Adjust the font size here
    .text("Temperature (K)");

    }




function updateLegend(min, max) {
    const canvas = document.getElementById("legendCanvas");
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    
    // Sample the color scale at 10 points
    for (let i = 0; i <= 1; i += 0.1) {
        const color = window.d3Color_Forest(min + i * (max - min));
        gradient.addColorStop(i, color);
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update labels
    document.getElementById("minValue").textContent = min.toFixed(2);
    document.getElementById("maxValue").textContent = max.toFixed(2);
}

