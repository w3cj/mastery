var SkillTree = function(svg, nodes, edges, showWeeks){
    var thisGraph = this;
        thisGraph.idct = 0;

    thisGraph.nodes = nodes || [];
    thisGraph.edges = edges || [];

    thisGraph.state = {
      selectedNode: null,
      selectedEdge: null,
      mouseDownNode: null,
      mouseDownLink: null,
      justDragged: false,
      justScaleTransGraph: false,
      lastKeyDown: -1,
      shiftNodeDrag: false,
      selectedText: null
    };

    // define arrow markers for graph links
    var defs = svg.append('svg:defs');
    defs.append('svg:marker')
      .attr('id', 'end-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', "32")
      .attr('markerWidth', 3.5)
      .attr('markerHeight', 3.5)
      .attr('orient', 'auto')
      .append('svg:path')
      .attr('d', 'M0,-5L10,0L0,5');

    // define arrow markers for leading arrow
    defs.append('svg:marker')
      .attr('id', 'mark-end-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 7)
      .attr('markerWidth', 3.5)
      .attr('markerHeight', 3.5)
      .attr('orient', 'auto')
      .append('svg:path')
      .attr('d', 'M0,-5L10,0L0,5');

    thisGraph.svg = svg;
    thisGraph.svgG = svg.append("g")
          .classed(thisGraph.consts.graphClass, true)
          .attr("transform", "translate(151,47) scale(0.64)")
    var svgG = thisGraph.svgG;

    // displayed when dragging between nodes
    thisGraph.dragLine = svgG.append('svg:path')
          .attr('class', 'link dragline hidden')
          .attr('d', 'M0,0L0,0')
          .style('marker-end', 'url(#mark-end-arrow)');

    // svg nodes and edges
    thisGraph.paths = svgG.append("g").selectAll("g");
    thisGraph.circles = svgG.append("g").selectAll("g");

    if(showWeeks) {
      svgG.append("text")
      .attr("y", 225)//magic number here
      .attr("x", -170)
      .attr('text-anchor', 'middle')
      .attr("class", "week-title")//easy to style with CSS
      .text("Week 1");

      svgG.append("line")//making a line for legend
      .attr("x1", -200)
      .attr("x2", 1000)
      .attr("y1", 235)
      .attr("y2", 235)
      .style("stroke-dasharray","5,5")//dashed array for line
      .style("stroke", "black");

      svgG.append("text")
      .attr("y", 520)//magic number here
      .attr("x", -170)
      .attr('text-anchor', 'middle')
      .attr("class", "week-title")//easy to style with CSS
      .text("Week 2");

      svgG.append("line")//making a line for legend
      .attr("x1", -200)
      .attr("x2", 1000)
      .attr("y1", 530)
      .attr("y2", 530)
      .style("stroke-dasharray","5,5")//dashed array for line
      .style("stroke", "black");

      svgG.append("text")
      .attr("y", 780)//magic number here
      .attr("x", -170)
      .attr('text-anchor', 'middle')
      .attr("class", "week-title")//easy to style with CSS
      .text("Week 3");

      svgG.append("line")//making a line for legend
      .attr("x1", -200)
      .attr("x2", 1000)
      .attr("y1", 790)
      .attr("y2", 790)
      .style("stroke-dasharray","5,5")//dashed array for line
      .style("stroke", "black");

      svgG.append("text")
      .attr("y", 1040)//magic number here
      .attr("x", -170)
      .attr('text-anchor', 'middle')
      .attr("class", "week-title")//easy to style with CSS
      .text("Week 4");
    }

    thisGraph.drag = d3.behavior.drag()
          .origin(function(d){
            return {x: d.x, y: d.y};
          })
          .on("drag", function(args){
            thisGraph.state.justDragged = true;
            thisGraph.dragmove.call(thisGraph, args);
          })
          .on("dragend", function() {
            // todo check if edge-mode is selected
          });

    svg.on("mousedown", function(d){thisGraph.svgMouseDown.call(thisGraph, d);});
    svg.on("mouseup", function(d){thisGraph.svgMouseUp.call(thisGraph, d);});

    // listen for dragging
    var dragSvg = d3.behavior.zoom()
          .translate([151,47]).scale(.64)
          .on("zoom", function(){
            thisGraph.zoomed.call(thisGraph);
            return true;
          })
          .on("zoomstart", function(){
            var ael = d3.select("#" + thisGraph.consts.activeEditId).node();
            if (ael){
              ael.blur();
            }
            if (!d3.event.sourceEvent.shiftKey) d3.select('body').style("cursor", "move");
          })
          .on("zoomend", function(){
            d3.select('body').style("cursor", "auto");
          });

    svg.call(dragSvg).on("dblclick.zoom", null);

    // listen for resize
    window.onresize = function(){thisGraph.updateWindow(svg);};
  };

  SkillTree.prototype.loadGraph = function(jsonObj) {
    var thisGraph = this;
    thisGraph.deleteGraph(true);
    thisGraph.nodes = jsonObj.nodes;
    thisGraph.setIdCt(jsonObj.nodes.length + 1);
    var newEdges = jsonObj.edges;
    newEdges.forEach(function(e, i){
      newEdges[i] = {source: thisGraph.nodes.filter(function(n){return n.id == e.source;})[0],
                  target: thisGraph.nodes.filter(function(n){return n.id == e.target;})[0]};
    });
    thisGraph.edges = newEdges;
    thisGraph.updateGraph();
  }

  SkillTree.prototype.setIdCt = function(idct){
    this.idct = idct;
  };

  SkillTree.prototype.consts =  {
    selectedClass: "selected",
    connectClass: "connect-node",
    circleGClass: "conceptG",
    graphClass: "graph",
    activeEditId: "active-editing",
    BACKSPACE_KEY: 8,
    DELETE_KEY: 46,
    ENTER_KEY: 13,
    nodeRadius: 50
  };

  /* PROTOTYPE FUNCTIONS */

  SkillTree.prototype.dragmove = function(d) {
    var thisGraph = this;
    d.x += d3.event.dx;
    d.y +=  d3.event.dy;
    thisGraph.updateGraph();
  };

  SkillTree.prototype.deleteGraph = function(skipPrompt){
    var thisGraph = this,
        doDelete = true;
    if (!skipPrompt){
      doDelete = window.confirm("Press OK to delete this graph");
    }
    if(doDelete){
      thisGraph.nodes = [];
      thisGraph.edges = [];
      thisGraph.updateGraph();
    }
  };

  /* insert svg line breaks: taken from http://stackoverflow.com/questions/13241475/how-do-i-include-newlines-in-labels-in-d3-charts */
  SkillTree.prototype.insertTitleLinebreaks = function (gEl, title) {
    var words = title.split(/\s+/g),
        nwords = words.length;
    var el = gEl.append("text")
          .attr("text-anchor","middle")
          .attr("dy", "-" + (nwords-1)*7.5);

    for (var i = 0; i < words.length; i++) {
      var tspan = el.append('tspan').text(words[i]);
      if (i > 0)
        tspan.attr('x', 0).attr('dy', '15');
    }
  };

  // mousedown on main svg
  SkillTree.prototype.svgMouseDown = function(){
    this.state.graphMouseDown = true;
  };

  // mouseup on main svg
  SkillTree.prototype.svgMouseUp = function(){
    var thisGraph = this,
        state = thisGraph.state;
    if (state.justScaleTransGraph) {
      // dragged not clicked
      state.justScaleTransGraph = false;
    }
    state.graphMouseDown = false;
  };

  // call to propagate changes to graph
  SkillTree.prototype.updateGraph = function(){

    var thisGraph = this,
        consts = thisGraph.consts,
        state = thisGraph.state;

    thisGraph.paths = thisGraph.paths.data(thisGraph.edges, function(d){
      return String(d.source.id) + "+" + String(d.target.id);
    });
    var paths = thisGraph.paths;
    // update existing paths
    paths.style('marker-end', 'url(#end-arrow)')
      .classed(consts.selectedClass, function(d){
        return d === state.selectedEdge;
      })
      .attr("d", function(d){
        return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
      });

    // add new paths
    paths.enter()
      .append("path")
      .style('marker-end','url(#end-arrow)')
      .classed("link", true)
      .attr("d", function(d){
        return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
      });

    // remove old links
    paths.exit().remove();

    // update existing nodes
    thisGraph.circles = thisGraph.circles.data(thisGraph.nodes, function(d){ return d.id;});
    thisGraph.circles.attr("transform", function(d){return "translate(" + d.x + "," + d.y + ")";});

    // add new nodes
    var newGs= thisGraph.circles.enter()
          .append("g")
          .on('mouseup', function(d) {
            thisGraph.showStandards(d.standards);
          });

    newGs.classed(consts.circleGClass, true)
      .attr("transform", function(d){return "translate(" + d.x + "," + d.y + ")";})

    newGs.append("circle")
      .attr("r", String(consts.nodeRadius));

    newGs.each(function(d){
      thisGraph.insertTitleLinebreaks(d3.select(this), d.title);
    });

    // remove old nodes
    thisGraph.circles.exit().remove();
  };

  SkillTree.prototype.zoomed = function(){
    this.state.justScaleTransGraph = true;
    d3.select("." + this.consts.graphClass)
      .attr("transform", "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")");
  };

  SkillTree.prototype.updateWindow = function(svg){
    var docEl = document.documentElement,
        bodyEl = document.getElementsByTagName('body')[0];
    var x = window.innerWidth || docEl.clientWidth || bodyEl.clientWidth;
    var y = window.innerHeight|| docEl.clientHeight|| bodyEl.clientHeight;
    svg.attr("width", x).attr("height", y);
  };

  SkillTree.prototype.setColors = function(performances) {
    d3.selectAll('g.conceptG circle').attr('class', function(d) {
      if(performances[d.standards[0]] != undefined) {
        return 'conceptG-' + performances[d.standards[0]];
      } else {
        return 'conceptG-0';
      }
    });
  }

export default SkillTree;
