
$(document).ready(function() {
    var colors = d3.scale.linear().domain([-10, 10]).range(["#f00", "#0ff"]);
    var width = 1200;
    var height = 800;
    var ypad = height/7;
    var lines = [];
    var projection = d3.geo.mercator()
    .scale((width + 1) / 2 / Math.PI)
    .translate([width / 2, height / 2 + ypad])
    .precision(.1);


    var path = d3.geo.path().projection(projection);
    var svg = d3.select("#svg").append("svg")
        .attr("width", width)
        .attr("height", height);

    function get_center(obj) {
        if (obj.properties.name == "United States of America") {
            return [270, 380];
        }
        if (obj.properties.name == "Russia") {
            return [950, 223];
        }
        if (obj.properties.name == "Canada") {
            return [276, 222];
        }
        var b = path.bounds(obj);
        return [(b[1][0]+b[0][0])/2, (b[1][1]+b[0][1])/2];
    }

    
    var first = "";
    var country_one = "";

    var second = "";
    var country_two = "";

    var iso = {};
    d3.json("/country_codes.json", function(err, res) {
        for (var i=0; i<res.length; i++) {
            iso[res[i].name] = res[i]["alpha-3"];
        }
    }); 
    d3.json("/countries.json", function(err, res) {
      svg.selectAll(".country")
          .data(topojson.feature(res, res.objects["countries.geo"]).features)
        .enter().append("path")
          .attr("class", "country")
          .attr("d", path)
        .on("mouseover", function(d) {
            if (!first) {
                //$("#first").text(d.properties.name);
                $("#first").text(d.properties.name);
            }
            else if (!second) {
                $("#second").text(d.properties.name);
                query_mouseover(country_one, d.properties.name, $(year).text());
            }
        })
        .on("mouseout", function(d) {
            if (first && !second) {
                $("#second").text(" ");
            }
            if (!first) {
                $("#first").text(" ");
            }
        })
        .on("click", function(d) {
            if (!first) {
                first = this;
                country_one=d;
            }
            else if (!second) {
                if (this != first) {
                    second = this;
                    country_two=d;
                    lines = query(country_one, country_two, $(year).text());
                }
            }
            else {
                d3.selectAll(".arc").remove();
                $(first).attr("class", "country");
                $(second).attr("class", "country");
                first = this;
                country_one = d;
                $("#first").text(d.properties.name);
                second = "";
                country_two = "";
            }
            $(this).attr("class", "selected");
        });

    });

    $("#timeline").slider({
        range: false,
        min: 1971,
        max: 2001,
        value: 1986,
        slide: function( event, ui ) {
            year = ui.value;
            $("#year").text(ui.value);
            if (country_one && country_two) {
                query(country_one, country_two, ui.value);
            }
            //query_slide(year, country_one, country_two);
        }
    });
    
    function query(country_one, country_two, year) {
        // get country codes for country_one and country_two
        // send query for country_one and country_two
        // slide down the map
        // display information on the screen
        $("#info").text("The return info will go here\nYeah\nYeah")
            .hide()
            .css("opacity", 0)
            .slideDown(200,
                    function() {
                        $(this).animate({opacity:1}, 200);
                    });
        
        console.log(year, iso[country_one.properties.name],iso[country_two.properties.name]);
        var c1 = get_center(country_one); 
        var c2 = get_center(country_two);
        $.get("_click", {
            year:year,
            source:iso[country_one.properties.name],
            target:iso[country_two.properties.name]
        }).done(function(data) {
            if (data) {
                d3.selectAll(".arc").remove();
                var total = 0;
                for (var datum in data) {
                    total += 1;
                }
                for (var datum in data) {
                    console.log(datum);
                    var path = svg.append("path")
                    .datum([c1, c2])
                    .attr("d", function(d) {
                        var start = d[0];
                        var end = d[1];
                        console.log(start, end);

                        var dx = start[0] - end[0],
                            dy = start[1] - end[1],
                            dr = Math.sqrt(dx * dx + dy * dy) * datum/1.5;
                        return "M" + start[0] + "," + start[1] + "A" + dr + "," + dr + " 0 0,1 " + end[0] + "," + end[1];
                    }).attr("class", "arc")
                      .attr("stroke", colors(datum))
                      .attr("stroke-width", Math.log(data[datum])/total*30);
                  
                  var totalLength = path.node().getTotalLength();
                  path.attr("stroke-dasharray", totalLength + " " + totalLength)
                      .attr("stroke-dashoffset", totalLength)
                      .transition()
                    .duration(2000)
                    .attr("stroke-dashoffset", 0);
                    }

                }
            else {
                // draw lines
                var path = svg.append("path")
                    .datum([c1, c2])
                    .attr("d", function(d) {
                        var start = d[0];
                        var end = d[1];
                        console.log(start, end);

                        var dx = start[0] - end[0],
                            dy = start[1] - end[1],
                            dr = Math.sqrt(dx * dx + dy * dy);
                        //var parsed = "M" + start[0] + "," + start[1] + " L " + end[0] +","+ end[1];

                        //console.log(parsed);
                        //return parsed;
                        return "M" + start[0] + "," + start[1] + "A" + dr + "," + dr + " 0 0,1 " + end[0] + "," + end[1];
                    }).attr("class", "arc");
                
                  var totalLength = path.node().getTotalLength();
                  path.attr("stroke-dasharray", totalLength + " " + totalLength)
                      .attr("stroke-dashoffset", totalLength)
                      .transition()
                    .duration(2000)
                    .attr("stroke-dashoffset", 0);
                    }
                });
        

          
          return path;
    }
    function query_slide(year, country_one, country_two) {
    }
    function query_mouseover(country_one, country_two, year) {
    }

});


