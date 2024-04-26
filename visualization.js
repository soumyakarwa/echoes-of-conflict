// visualization.js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as Constants from "./constants.js";

export function createVisualization(svg, analysis, outerRadius) {
  const xScale = d3
    .scaleBand()
    .range([Constants.initialAngle, Constants.finalAngle])
    .domain(analysis.map((d) => d.year))
    .padding(0.03);

  const yScale = d3
    .scaleLinear()
    .range([Constants.innerRadius, outerRadius])
    .domain([0, d3.max(analysis, (d) => d.proportion)]);

  const tooltip = createToolTip(svg);
  const visualization = createBars(svg, analysis, xScale, yScale, tooltip);

  d3.select("#worldWar1-button").on("click", function (event) {
    highlightCertainWarYears(
      svg,
      analysis,
      "worldWar1",
      Constants.buttonStates
    );
  });
  d3.select("#worldWar2-button").on("click", function (event) {
    highlightCertainWarYears(
      svg,
      analysis,
      "worldWar2",
      Constants.buttonStates
    );
  });
  d3.select("#koreanWar-button").on("click", function (event) {
    highlightCertainWarYears(
      svg,
      analysis,
      "koreanWar",
      Constants.buttonStates
    );
  });
  d3.select("#vietnamWar-button").on("click", function (event) {
    highlightCertainWarYears(
      svg,
      analysis,
      "vietnamWar",
      Constants.buttonStates
    );
  });
  d3.select("#globalWOT-button").on("click", function (event) {
    highlightCertainWarYears(
      svg,
      analysis,
      "globalWOT",
      Constants.buttonStates
    );
  });

  return visualization;
}

/**
 *
 * @param {*} svg
 * @param {*} analysis
 * @param {*} clickedWar
 * @param {*} years
 * @param {*} state
 */
function highlightCertainWarYears(svg, analysis, clickedWar, state) {
  // Update the state for the current war
  state[clickedWar] = !state[clickedWar];

  // Update the color of the button based on the state
  d3.select(`#${clickedWar}-button`)
    .style(
      "background-color",
      state[clickedWar] ? Constants.redColor : "#fffeee"
    )
    .style("color", state[clickedWar] ? "#fffeee" : "#1c1c20");

  // Select all bars and update their fill color based on the state of each button
  svg
    .selectAll("rect")
    .data(analysis)
    .transition()
    .duration(300)
    .attr("fill", function (d) {
      if (
        (state.worldWar1 && Constants.worldWar1Years.includes(d.year)) ||
        (state.worldWar2 && Constants.worldWar2Years.includes(d.year)) ||
        (state.koreanWar && Constants.koreanWarYears.includes(d.year)) ||
        (state.vietnamWar && Constants.vietnamWarYears.includes(d.year)) ||
        (state.globalWOT && Constants.globalWarOnTerrorYears.includes(d.year))
      ) {
        return Constants.redColor;
      } else {
        return Constants.yellowColor;
      }
    });
}

function createToolTip(svg) {
  const tooltip = svg
    .append("text")
    .attr("class", "tooltip")
    .style("text-anchor", "middle")
    .style("alignment-baseline", "central")
    .style("font-size", "1.1rem")
    .attr("fill", "#fffeee")
    .style("opacity", 0)
    .attr("transform", `translate(0, 0)`);

  tooltip
    .append("tspan")
    .attr("class", "tooltip-details1")
    .attr("x", 0)
    .attr("dy", "-1.2em");

  tooltip
    .append("tspan")
    .attr("class", "tooltip-president")
    .attr("x", 0)
    .attr("dy", "1.2em");

  tooltip
    .append("tspan")
    .attr("class", "tooltip-details2")
    .attr("x", 0)
    .attr("dy", "1.2em");

  return tooltip;
}

/**
 *
 * @param {*} svg
 * @param {*} analysis
 * @param {*} innerRadius
 * @param {*} xScale
 * @param {*} yScale
 * @returns radial bars
 */
function createBars(svg, analysis, xScale, yScale, tooltip) {
  var radialLines;
  var labels;

  const bars = svg
    .selectAll("rect")
    .data(analysis)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("height", Constants.barHeight)
    .attr("width", 0)
    .attr("fill", Constants.yellowColor)
    .attr(
      "transform",
      (d) =>
        `rotate(${
          ((xScale(d.year) + xScale.bandwidth() / 2) * 180) / Math.PI
        }) translate(${Constants.innerRadius},0)`
    );

  bars
    .on("mouseover", function (event, d) {
      d3.select(this)
        .attr("fill", Constants.redColor)
        .attr("cursor", "pointer");
      d3.select(".tooltip-president").text(`President ${d.name}`);

      // Set the tooltip text for the year and proportion details
      d3.select(".tooltip-details1").text(`${d.year}`);

      d3.select(".tooltip-details2").text(`${d.proportion.toFixed(2)}%`);

      tooltip.style("opacity", 1);
    })
    .on("mouseout", function (event, d) {
      d3.select(this).attr("fill", Constants.yellowColor);
      tooltip.style("opacity", 0);
    });

  bars
    .transition()
    .delay((d, i) => i * Constants.delayTime)
    .attr("width", (d) => calcBarHeight(yScale(d.proportion)))
    .on("end", function (d) {
      if (analysis.indexOf(d) === analysis.length - 1) {
        radialLines = createRadialGridLines(svg, analysis, xScale, yScale);
        labels = addYearLabels(svg, analysis, xScale, yScale);
      }
    });
  return [bars, radialLines, labels];
}

/**
 *
 * @param {*} svg
 * @param {*} analysis
 * @param {*} xScale
 * @param {*} yScale
 * @returns
 */
function addYearLabels(svg, analysis, xScale, yScale) {
  const dataLabels = svg
    .selectAll(null)
    .data(analysis)
    .enter()
    .append("text")
    .attr("transform", (d) => {
      var textRotationAngle = 0;
      var translateX = yScale(d.proportion) + 4;
      var translateY = Constants.barHeight;
      const angle = ((xScale(d.year) + xScale.bandwidth() / 2) * 180) / Math.PI;

      if (
        angle > Constants.labelInitialAngle &&
        angle < Constants.labelFinalAngle
      ) {
        textRotationAngle = 180;
        translateX = yScale(d.proportion) + 4;
        translateY = 0;
      } else {
        textRotationAngle = 0;
        translateX = yScale(d.proportion) + 4;
        translateY = Constants.barHeight;
      }

      return `rotate(${angle}) translate(${translateX}, ${translateY}) rotate(${textRotationAngle})`;
    })
    .attr("text-anchor", (d) => {
      const angle = ((xScale(d.year) + xScale.bandwidth() / 2) * 180) / Math.PI;
      if (
        angle > Constants.labelInitialAngle &&
        angle < Constants.labelFinalAngle
      ) {
        return "end";
      } else {
        return "start";
      }
    })
    .style("font-size", Constants.labelFontSize)
    .attr("fill", "#fffeee")
    .attr("opacity", 0)
    .text((d) => d.year);

  // Delay the start of the label fade-in so it occurs after the bar transition
  dataLabels
    .transition()
    .duration(Constants.loadingDuration)
    .attr("opacity", 1);

  return dataLabels;
}

/**
 *
 * @param {*} svg
 * @param {*} analysis
 * @param {*} innerRadius
 * @param {*} xScale
 * @param {*} yScale
 */
function createRadialGridLines(svg, analysis, xScale, yScale) {
  const firstBarAngleDegrees = (((13.9 * 2 * Math.PI) / 16) * 180) / Math.PI;
  console.log(firstBarAngleDegrees);
  const maxDataValue = d3.max(analysis, (d) => d.proportion);

  const roundedMax = Math.floor(maxDataValue / 10) * 10;
  const gridValues = d3.range(1, roundedMax / 10 + 1).map((d) => d * 10);

  const gridBar = svg
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("height", Constants.barHeight / 3)
    .attr("width", calcBarHeight(yScale(maxDataValue)))
    .attr("opacity", 0)
    .attr("fill", "#fffeee")
    .attr(
      "transform",
      (d) =>
        `rotate(${firstBarAngleDegrees}) translate(${Constants.innerRadius},${Constants.barHeight})`
    );

  const gridLines = svg
    .selectAll("circle.grid-line")
    .data(gridValues)
    .enter()
    .append("circle")
    .classed("grid-line", true)
    .attr("r", (d) => yScale(d))
    .attr("fill", "none")
    .attr("stroke", "#1c1c20");

  const gridLabels = svg
    .selectAll("text.grid-label")
    .data(gridValues)
    .enter()
    .append("text")
    .classed("grid-label", true)
    .attr("x", (d) => calcBarHeight(yScale(d)))
    .attr("y", 0)
    .attr("text-anchor", "middle")
    .text((d) => `${d}%`)
    .style("font-size", Constants.radialLabelSize)
    .style("font-weight", "600")
    .attr("fill", "#fffeee")
    .attr("opacity", 0)
    .attr("transform", (d) => {
      const x = yScale(d) - Constants.innerRadius;
      const additionalRotation = firstBarAngleDegrees + 93;

      return `rotate(${firstBarAngleDegrees}) translate(${Constants.innerRadius},0) rotate(${additionalRotation}, ${x}, -15)`;
    });

  gridBar.transition().duration(Constants.loadingDuration).attr("opacity", 1);
  gridLabels
    .transition()
    .duration(Constants.loadingDuration)
    .attr("opacity", 1);

  return [gridLines, gridLabels, gridBar];
}

/**
 *
 * @param {*} val
 * @param {*} innerRadius
 * @returns
 */
function calcBarHeight(val) {
  return val - Constants.innerRadius;
}
