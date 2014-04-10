var visualization = function() {
     var svg, width = 1200,
     height = 800,
     ypad = height/7,
     timers = {},
     year = 1992,
     selected = {
         first: "",
         d1: "",
         second: "",
         d2: "",
     },
     iso = {},
     topodata = [],
    
     colors = d3.scale.linear().domain([-10, 10]).range(["#f00", "#3e8ed6"]),
     
     projection = d3.geo.mercator()
                        .scale((width + 1) / 2 / Math.PI)
                        .translate([width / 2, height / 2 + ypad])
                        .precision(.1),

    path = d3.geo.path().projection(projection),

    get_center = function (obj) {
        var p = {};
        if (obj.properties.name == "United States of America") {
            p = {
                x: 270,
                y: 380
            };
        }
        else if (obj.properties.name == "Russia") {
            p = {
                x: 950,
                y: 233 
            };
        }
        else if (obj.properties.name == "Canada") {
            p = {
                x: 250,
                y: 280
            };
        }
        else {
            var b = path.bounds(obj);
            p = {
                x:(b[1][0]+b[0][0])/2,
                y:(b[1][1]+b[0][1])/2
            };
        }
        return p;
    },
    
    /* builds the arcs between two countries and scales by their distance.
     * for an interactive example, see http://tributary.io/inlet/10185213
     * (link from 4/8/14)
     */
    get_arc_scale = function(p1, p2) {
        var dist = Math.sqrt((p1.x-p2.x)*(p1.x-p2.x)+(p1.y-p2.y)*(p1.y-p2.y))/1.5;
        return d3.scale.linear().domain([-10, 10]).range([-1*dist, dist]);
    },

    draw_arc = function(p1, p2, weight) {
        var scale = get_arc_scale(p1,p2);
        weight = scale(weight);
        var slope = (p1.y-p2.y)/(p1.x-p2.x),
            m = {
            x: (p1.x+p2.x)/2+weight*-1*slope,
            y: (p1.y+p2.y)/2+weight
        };
        return "M " + p1.x + " " + p1.y + " Q " + m.x + " " + m.y + " " + p2.x + " " + p2.y;
    },
    
    /* prevents every intermediate point on slider from being triggered */
    delaySlider = function(country_one, country_two, year) {
        clearTimeout(timers.slider);
        timers.slider = setTimeout(function() {
            if (country_one && country_two) {
                query(country_one, country_two, year);
            }
        }, 300);
    },
    
    query = function () {
        // get country codes for country_one and country_two
        // send query for country_one and country_two
        // slide down the map
        // display information on the screen
        var country_one = selected.d1,
            country_two = selected.d2,
            c1 = get_center(country_one), 
            c2 = get_center(country_two),
            path = [];
        
        console.log(year, iso[country_one.properties.name],iso[country_two.properties.name]);

        $.get("_click", {
            year:year,
            source:iso[country_one.properties.name],
            target:iso[country_two.properties.name]
        }).done(function(data) {
            var total, goldstein_key, p, totalLength;
            if (data) {
                d3.selectAll(".arc").remove();
                total = 0;

                /* replace this with d3 scale, maybe */
                for (goldstein_key in data) {
                    total += 1;
                }
                for (goldstein_key in data) {
                    goldstein_key = parseFloat(goldstein_key);
                    p = svg.append("path")
                      .attr("d", draw_arc(c1, c2, goldstein_key))
                      .attr("class", "arc")
                      .attr("stroke", colors(goldstein_key))
                      .attr("stroke-width", Math.log(data[goldstein_key])/total*30);
                      /* simplify this stroke-width formula */

                    totalLength = p.node().getTotalLength();
                    p.attr("stroke-dasharray", totalLength + " " + totalLength)
                      .attr("stroke-dashoffset", totalLength)
                      .transition()
                      .duration(2000)
                      .attr("stroke-dashoffset", 0);

                    path.push(p);
                }

            }
            else {
                // draw single line
                p = svg.append("path")
                    .attr("d", draw_arc(c1, c2, 0)) //1.5 is a magic number. see function
                    .attr("class", "arc");
                
                totalLength = p.node().getTotalLength();
                p.attr("stroke-dasharray", totalLength + " " + totalLength)
                    .attr("stroke-dashoffset", totalLength)
                    .transition()
                    .duration(2000)
                    .attr("stroke-dashoffset", 0);
                path.push(p);
            }
        });
    },
    query_source_selected = function() {
        $.get("_source", {
            year: year,
            source:iso[selected.d1.properties.name]
        }).done(function(d) {
            console.log(d);
        });
    },
    
    load = function() {
        console.log("Loading!");
        d3.json("/country_codes.json", function(err, res) {
            for (var i=0; i<res.length; i++) {
                iso[res[i].name] = res[i]["alpha-3"];
            }
        });

        d3.json("/countries.json", function(err, res) {
            topodata = topojson.feature(res, res.objects["countries.geo"]).features;
            $(document).ready(function() {
                draw();
            });
        });
    },
    draw = function() {
        svg = d3.select("#svg").append("svg")
            .attr("width", width)
            .attr("height", height);
        $("#timeline").slider({
            range: false,
            min: 1971,
            max: 2001,
            value: year,
            slide: function( event, ui ) {
                year = ui.value;
                $("#year").text(ui.value);
                delaySlider(selected.d1, selected.d2, year);
            }
        });
        svg.selectAll(".country")
            .data(topodata)
            .enter()
            .append("path")
            .attr("class", "country")
            .attr("d", path)
            .on("mouseover", function(d) {
                if (!selected.first) {
                    //$("#first").text(d.properties.name);
                    $("#first").text(d.properties.name);
                }
                else if (!second) {
                    $("#second").text(d.properties.name);
                    //query_mouseover(selected.d1, d.properties.name, year);
                }
            })
            .on("mouseout", function(d) {
                if (selected.first && !selected.second) {
                    $("#second").text(" ");
                }
                if (!selected.first) {
                    $("#first").text(" ");
                }
            })
            .on("click", function(d) {
                if (!selected.first) {
                    selected.first = this;
                    selected.d1=d;
                    query_source_selected();
                }
                else if (!selected.second) {
                    if (this != selected.first) {
                        selected.second = this;
                        selected.d2=d;
                        query();
                    }
                }
                else {
                    d3.selectAll(".arc").remove();
                    $(selected.first).attr("class", "country");
                    $(selected.second).attr("class", "country");
                    selected.first = this;
                    selected.d1 = d;
                    $("#first").text(d.properties.name);
                    selected.second = "";
                    selected.d2 = "";
                    query_source_selected();
                }
                $(this).attr("class", "selected");
            });
        };
    
    return {
        load: load,
        draw: draw
    };

}();

visualization.load();

$(document).ready(function() {
    console.log("Document ready!");
});
