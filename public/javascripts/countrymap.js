$(document).ready(function() {

    var path = d3.geo.path();

    var svg = d3.select("body").append("svg")
        .attr("width", 960)
        .attr("height", 500);

      svg.selectAll(".state")
          .data(topojson.feature(us, us.objects.states).features)
        .enter().append("path")
          .attr("class", "state")
          .attr("d", path);
});
