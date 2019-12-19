let temperature, relativeHumidity, woodSpruce, surfaceQuality, mouldGrowthIndex, days;

let tempArray = [],
    rhArray = [];

function main() {
    // temperature = 10;
    // relativeHumidity = 80;
    surfaceQuality = 0;
    woodSpruce = 1;
    let mouldTrajekt = [];
    mouldGrowthIndex = 0;
    for (let temp = 1; temp <= 70 ; temp+=1 ){
        tempArray.push(temp);
        for (let rh = 70; rh <=100; rh += 1){
            mouldGrowthIndex = 0;
            temperature = temp;
            relativeHumidity = rh;

            if (!rhArray.includes(rh)){
                rhArray.push(rh);
            }

            for (let i = 1; i <= 100; i++) {
                // console.log(i);
                // mouldTrajekt.push({"day": i - 1, "mouldGrowth": mouldGrowthIndex});

                let growth = calculateMouldGrowth();
                // console.log(growth);
                mouldGrowthIndex = Math.max(Math.min(mouldGrowthIndex + growth, 6), 0);
                // console.log(mouldGrowthIndex);
            }


            mouldTrajekt.push({"temp": temp, "rh":rh, "mg":mouldGrowthIndex })


        }
    }



    console.log(mouldTrajekt);
    // plotMouldGrowth(mouldTrajekt);
    plotMouldHeatMap(mouldTrajekt);

    return mouldTrajekt;


}

function calculateTv() {

    let tv = Math.exp((-0.74 * Math.log(temperature)) - (12.72 * Math.log(relativeHumidity)) + (0.06 * woodSpruce) + 61.50);
    return tv

}

function calculateTm() {

    let tm = Math.exp((-0.68 * Math.log(temperature)) - (13.9 * Math.log(relativeHumidity)) + (0.14 * woodSpruce) - (0.33 * surfaceQuality) + 66.02);
    return tm
}

function calculateCriticalRelativeHumidity(temperature) {
    if (temperature > 20) {
        return 80
    } else {
        return (-0.00267 * Math.pow(temperature, 3) + (0.160 * Math.pow(temperature, 2)) - (3.13 * temperature) + 100)
    }
}

function calculateMMax() {
    let HCrit = calculateCriticalRelativeHumidity(temperature);
    return 1 + ((7 * ((HCrit - relativeHumidity) / (HCrit - 100))) - (2 * Math.pow(((HCrit - relativeHumidity) / (HCrit - 100)), 2)));
}

function calculateK1() {
    if (mouldGrowthIndex < 1) {
        return 1
    } else if (mouldGrowthIndex >= 1) {
        return 2 / ((calculateTv() / (calculateTm() - 1)))
    }
}

function calculateK2() {
    return 1 - Math.exp(2.3 * (mouldGrowthIndex - calculateMMax()))
}

function calculateMouldGrowth() {
    return (1 / (7 * Math.exp((-0.68 * Math.log(temperature)) + (-13.9 * Math.log(relativeHumidity)) + (0.14 * woodSpruce) + (-0.33 * surfaceQuality) + 66.02))) * calculateK1() * calculateK2()
}

function plotMouldHeatMap(mouldTrajekt) {
    var margin = {top: 10, right: 30, bottom: 30, left: 60},
        width = 800 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
    var svg = d3.select("#my_dataviz")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Build X scales and axis:
    var x = d3.scaleBand()
        .range([ 0, width ])
        .domain(tempArray)
        .padding(0.01);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))

// Build X scales and axis:
    var y = d3.scaleBand()
        .range([ height, 0 ])
        .domain(rhArray)
        .padding(0.01);
    svg.append("g")
        .call(d3.axisLeft(y));

// Build color scale
    var myColor = d3.scaleSequential()
        .domain(d3.extent(mouldTrajekt,function (d) {
            return d.mg;
        })).interpolator(d3.interpolateViridis);
console.log(mouldTrajekt);

        svg.selectAll()
            .data(mouldTrajekt, function(d) {return d.temp+':'+d.rh;})
            .enter()
            .append("rect")
            .attr("x", function(d) { return x(d.temp) })
            .attr("y", function(d) { return y(d.rh) })
            .attr("width", x.bandwidth() )
            .attr("height", y.bandwidth() )
            .style("fill", function(d) { return myColor(d.mg)} )


}

function plotMouldGrowth(growth) {

    var margin = {top: 10, right: 30, bottom: 30, left: 60},
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
    var svg = d3.select("#my_dataviz")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");



            var x = d3.scaleLinear()
                .domain(d3.extent(growth, function(d) { return +d.day; }))
                .range([ 0, width ]);
            svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x));

            // Add Y axis
            var y = d3.scaleLinear()
                .domain([0, d3.max(growth, function(d) { return +d.mouldGrowth; })])
                .range([ height, 0 ]);
            svg.append("g")
                .call(d3.axisLeft(y));

            // Add the line
            svg.append("path")
                .datum(growth)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    .x(function(d) { console.log(growth);return x(+d.day) })
                    .y(function(d) { return y(+d.mouldGrowth) })
                )



}



