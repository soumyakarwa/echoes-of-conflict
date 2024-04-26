import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import RiTa from "https://cdn.jsdelivr.net/npm/rita@2.8.31/+esm";
import Sentiment from "https://cdn.jsdelivr.net/npm/sentiment@5.0.2/+esm";
import { containsWarTerm } from "./util.js";
import { createVisualization } from "./visualization.js";
import * as Constants from "./constants.js";

const sentiment = new Sentiment();

const svgElement = document.getElementById("chart");
const style = window.getComputedStyle(svgElement);

const height = parseInt(style.height);
const width = parseInt(style.width);
const outerRadius = width / 2 - 40;

const fetchData = async () => {
  const text = [];
  var currName;
  var currYears;
  for (var i = 0; i < Constants.presidentTerm.length; i++) {
    currName = Constants.presidentTerm[i].name;
    currYears = Constants.presidentTerm[i].year;
    for (var j = 0; j < currYears.length; j++) {
      text.push({
        name: currName,
        year: currYears[j],
        speech: await d3.text(`./assets/sotu/${currName}_${currYears[j]}.txt`),
      });
    }
  }

  return text;
};

const data = await fetchData();

const analysis = [];

data.forEach((d) => {
  const sentences = RiTa.sentences(d.speech);
  const warRelatedSentences = sentences.filter((sentence) =>
    containsWarTerm(sentence, Constants.warRelatedTerms)
  );
  const proportion = (warRelatedSentences.length / sentences.length) * 100;

  analysis.push({
    name: d.name,
    year: d.year,
    sentences: sentences,
    warRelatedSentences: warRelatedSentences,
    proportion: proportion,
  });
});

console.log(analysis);

const svg = d3
  .select("#chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("viewBox", `0 0 ${width} ${height}`)
  .append("g")
  .attr("transform", `translate(${width / 2}, ${height / 2 - 50})`);

const visualization = createVisualization(svg, analysis, outerRadius);
