import * as d3 from "d3";
import { checkMobile } from "./checkMobile";
import { handleDrag, handleRotation } from "./handleDrag";
import { generateBoatPath } from "./generateBoatPath";

window.mobile = checkMobile();

const div = d3.select("#chart");
document.getElementById("chart").style.width = `${window.innerWidth * 0.99}px`;
document.getElementById("chart").style.height = `${
  window.innerHeight * 0.99
}px`;

console.log(screen.height);
const svg = div
  .append("svg")
  .attr("id", "whiteboard-svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("width", "100%")
  .attr("height", "100%");

const width = svg.node().getBoundingClientRect().width;
const height = svg.node().getBoundingClientRect().height;
svg.attr("viewBox", `0 0 ${width} ${height}`);

const playingArea = svg.append("g").attr("transform", `translate(15, 2)`);

playingArea
  .append("rect")
  .attr("width", width - 30)
  .attr("height", height - 30)
  .attr("x", 0)
  .attr("y", 0)

  .attr("stroke", "#cc6695")
  .attr("stroke-width", 2)
  .attr("fill", "#ecf2f9");

const goalHeight = 50;
const goalWidth = 10;

const goals = playingArea
  .selectAll(".goals")
  .data([0 - goalWidth, width - 30])
  .join("rect")
  .attr("x", (d) => d)
  .attr("class", "goals")
  .attr("y", height / 2 - goalHeight / 2)
  .attr("width", goalWidth)
  .attr("height", goalHeight);

let drag = d3.drag().on("drag", handleDrag);
let rotation = d3.drag().on("drag", handleRotation);

const boatData = [
  { x: width/9, y: height / 2, r0: 90, color: "#e6ceb2", id: 1 },
  { x: width*2/9, y: height / 3, r0: 90, color: "#e6ceb2", id: 2 },
  { x: width*2/9, y: (height * 2) / 3, r0: 90, color: "#e6ceb2", id: 3 },
  { x: width*3/9, y: height / 6, r0: 90, color: "#e6ceb2", id: 4 },
  { x: width*3/9, y: (height * 5) / 6, r0: 90, color: "#e6ceb2", id: 5 },

  { x: width - width/9, y: height / 2, r0: -90, color: "#b2e6ce", id: 1 },
  { x: width - width*2/9, y: height / 3, r0: -90, color: "#b2e6ce", id: 2 },
  { x: width - width*2/9, y: (height * 2) / 3, r0: -90, color: "#b2e6ce", id: 3 },
  { x: width - width*3/9, y: height / 6, r0: -90, color: "#b2e6ce", id: 4 },
  { x: width - width*3/9, y: (height * 5) / 6, r0: -90, color: "#b2e6ce", id: 5 },
];
const nodes = svg
  .selectAll(".node")
  .data(boatData)
  .join("g")
  .attr("class", "node")
  .attr("transform", (d) => `translate(${d.x},${d.y}) rotate(${d.r0})`);

const boatWidth = width/40;
const boatHeight = width/12;
const boats = nodes
  .selectAll(".boat")
  .data((nodeData) => [nodeData])
  .join("path")
  .attr("class", "boat")
  .attr("d", generateBoatPath(0, 0, boatWidth, boatHeight))
  .attr("fill", (d) => d.color)
  .attr("stroke", "black")
  .attr("stroke-width", boatWidth / 10);

const rotationHandles = nodes
  .append("circle")
  .attr("cx", 0)
  .attr("cy", boatHeight + boatWidth / 2)
  .attr("r", boatWidth / 8)
  .attr("fill", "#0d1926")
  .attr("stroke", "#0d1926")
  .attr("stroke-width", 5);

const cockpits = nodes
  .append("circle")
  .attr("cx", 0)
  .attr("cy", 0)
  .attr("r", boatWidth / 2)
  .attr("opacity", 0.3);

const ids = nodes
  .selectAll("boatID")
  .data((nodeData) => [nodeData])
  .join("text")
  .attr("x", 0)
  .attr("y", boatWidth * 0.3)
  .attr("text-anchor", "middle")
  .attr("font-size", boatWidth * 0.8)
  .text((d) => d.id);

if (mobile) {
  // ids.on('touchmove', drag);
  ids.on('touchmove', handleDrag);
  cockpits.on('touchmove', handleDrag);
  boats.on("touchmove", handleDrag);
  rotationHandles.on("touchmove", handleRotation);
} else {
  console.log("false");
  ids.call(drag);
  cockpits.call(drag);
  boats.call(drag);
  rotationHandles.call(rotation);
}
