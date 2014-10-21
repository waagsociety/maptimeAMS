---
---

var buildings = [],
    interval = {{ site.animation-interval }};
var strokeWidth = {{ site.building-stroke-width }};

var width = document.body.clientWidth,
   height = document.body.clientHeight;

var svg = d3.select("#building g");
var svgBlurred = d3.select("#building-blurred g");

var projection = d3.geo.mercator();
var path = d3.geo.path().projection(projection);

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drawBuildings(svg, strokes) {
  svg
		.selectAll("path").remove();

  svg
		.selectAll("path")
		.data(strokes)
		.enter().append("path")
		.attr("d", path)
    .attr("class", function(d, i) { return "color" + (i + 1); })
    .style("stroke-width", function(d, i) { return ((strokes.length - i) * 2 - 1) * strokeWidth; });
}

function resize() {
  var blurredTop = -d3.select("#maptime")[0][0].getBoundingClientRect().top;
  svgBlurred.attr("transform", "translate(0 " + blurredTop + ")");
  d3.select("#blur-rect")
     .attr("width", document.body.clientWidth)
     .attr("height", document.body.clientHeight);
}

window.addEventListener("resize", resize);

function newBuilding() {
  d3.select("#timer").attr("class", "");

  width = document.body.clientWidth;
  height = document.body.clientHeight;

  var building = buildings[getRandomInt(0, buildings.length)];

  var address = d3.select("#address a")
      .attr("href", "http://www.openstreetmap.org/#map=18/" + building.properties.centroid.reverse().join("/"));
  address.selectAll("span").remove();
  address.append("span")
    .html(building.properties.straatnaam + ' ' + building.properties.huisnummer);
  address.append("span")
    .attr("class", "light")
    .html(", " + building.properties.postcode + ' Amsterdam');

  projection.scale(1).translate([0, 0]);

  var buildingStrokes = [building, building, building, building, building, building];

  var b = path.bounds(building),
      s = .90 / Math.max(
        (b[1][0] - b[0][0]) / (width - strokeWidth * buildingStrokes.length * 2),
        (b[1][1] - b[0][1]) / (height - strokeWidth * buildingStrokes.length * 2)
      ),
      t = [
        (width - s * (b[1][0] + b[0][0])) / 2,
        (height - s * (b[1][1] + b[0][1])) / 2
      ];
  projection.scale(s).translate(t);

  drawBuildings(svg, buildingStrokes);
  drawBuildings(svgBlurred, buildingStrokes);

  var blurredTop = -d3.select("#maptime")[0][0].getBoundingClientRect().top;
  svgBlurred.attr("transform", "translate(0 " + blurredTop + ")");

  d3.select("#timer").attr("class", "animate-width");
}

d3.json("{{ site.baseurl }}/data/buildings.json", function(error, json) {
  buildings = json.features;
  newBuilding();
  resize();
  setInterval(newBuilding, interval);
});
