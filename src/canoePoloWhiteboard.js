import {
  getInitialBoatState,
  getInitialBoatStateKickoff,
} from "./initialBoatState";
import { generateBoatPath } from "./utils/generateBoatPath";
import { handleDrag, handleRotation, dragStart } from "./utils/handleDrag";
import * as d3 from "d3";

const teamColors = {
  1: {
    baseColor: "#b58cd9",
    outline: "#9d66cc",
    cockpitColor: "#ffffff",
    number: "#4f2673",
    handleColor: "#35194d",
  },
  2: {
    baseColor: "#66cc9d",
    outline: "#3fc084",
    cockpitColor: "#ffffff",
    number: "#26734f",
    handleColor: "#0d261a",
  },
};

export const canoePoloWhiteboard = () => {
  let boatState;
  let transitionDuration = 1000;

  const my = (svg) => {
    //   console.log(screen.height);

    const width = svg.node().getBoundingClientRect().width;
    const height = svg.node().getBoundingClientRect().height;
    // console.log(width, height)
    const smallAxis = d3.min([width, height]);
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const boatWidth = smallAxis / 20;
    const boatHeight = smallAxis / 4;
    const goalHeight = height / 10;
    const goalWidth = width * 0.005;

    if (!boatState) {
      boatState = initialStateFunction(width, height, boatHeight);
    }

    const playingArea = svg
      .selectAll(".playingArea")
      .data([{ width: width, height: height }])
      .join("g")
      .attr(
        "transform",
        (d) => `translate(${d.width * 0.01}, ${d.height * 0.01})`
      )
      .attr("class", "playingArea");

    playingArea
      .selectAll("#pitch")
      .data((playingAreaData) => [playingAreaData])
      .join("rect")
      .attr("width", (d) => d.width * 0.98)
      .attr("height", (d) => d.height * 0.98)
      .attr("x", 0)
      .attr("y", 0)
      .attr("id", "pitch")
      .attr("stroke", "#264a73")
      .attr("stroke-width", 2)
      .attr("fill", "#ffffff");

    const goals = playingArea
      .selectAll(".goals")
      .data([0 - goalWidth, width * 0.98])
      .join("rect")
      .attr("x", (d) => d)
      .attr("class", "goals")
      .attr("y", height / 2 - goalHeight / 2)
      .attr("width", goalWidth)
      .attr("height", goalHeight);

    const lines = playingArea
      .selectAll(".area-lines")
      .data([2 * boatHeight, width * 0.98 - 2 * boatHeight])
      .join("line")
      .attr("class", "area-lines")
      .attr("x1", (d) => d)
      .attr("x2", (d) => d)
      .attr("y1", 0)
      .attr("y2", height * 0.98)
      .attr("stroke", "#cc6695")
      .attr("stroke-width", 0.3);

    let drag = d3.drag().on("start", dragStart).on("drag", handleDrag);
    let rotation = d3.drag().on("drag", handleRotation);

    const nodes = svg
      .selectAll(".nodes")
      .data(boatState, (d) => d.id)
      .join(
        (enter) => {
          const g = enter
            .append("g")
            .attr("class", "nodes")
            .attr(
              "transform",
              (d) => `translate(${d.x},${d.y}) rotate(${d.r0})`
            )
            .style("display", (d) => d.visible);
          let boats;
          if (-1 < navigator.userAgent.search("Firefox")) {
            boats = g
              .selectAll(".boat")
              .data((nodeData) => [nodeData])
              .join("ellipse")
              .attr("class", "boat")
              .attr("cx", 0)
              .attr("cy", 0)
              .attr("rx", boatWidth/2)
              .attr("ry", boatHeight/2)
              .attr("fill", (d) => teamColors[d.team].baseColor)
              .attr("stroke", (d) => teamColors[d.team].outline)
              .attr("stroke-width", boatWidth / 20);
          } else {
            boats = g
              .selectAll(".boat")
              .data((nodeData) => [nodeData])
              .join("path")
              .attr("class", "boat")
              .attr("d", generateBoatPath(0, 0, boatWidth, boatHeight))
              .attr("fill", (d) => teamColors[d.team].baseColor)
              .attr("stroke", (d) => teamColors[d.team].outline)
              .attr("stroke-width", boatWidth / 20);
          }
          const rotationHandles = g
            .append("circle")
            .attr("cx", 0)
            .attr("cy", boatHeight / 2 + boatWidth / 2)
            .attr("r", boatWidth / 8)
            .attr("fill", (d) => teamColors[d.team].handleColor)
            .attr("stroke", (d) => teamColors[d.team].handleColor)
            .attr("class", "rotation-handles")
            .attr("stroke-width", 2);

          const cockpits = g
            .append("circle")
            .attr("class", "cockpits")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", boatWidth / 2)
            .attr("opacity", 0.7)
            .attr("fill", (d) => teamColors[d.team].cockpitColor);

          const ids = g
            .selectAll(".boatID")
            .data((nodeData) => [nodeData])
            .join("text")
            .attr("class", "boatID")
            .attr("x", 0)
            .attr("fill", (d) => teamColors[d.team].number)
            .attr("y", boatWidth * 0.3)
            .attr("text-anchor", "middle")
            .attr("font-size", boatWidth * 0.8)
            .attr("transform", (d) => `rotate(${-d.r0})`)
            .text((d) => d.id);

          if (window.mobile) {
            // ids.on('touchmove', drag);
            ids.on("touchstart", dragStart).on("touchmove", handleDrag);
            cockpits.on("touchstart", dragStart).on("touchmove", handleDrag);
            boats.on("touchstart", dragStart).on("touchmove", handleDrag);
            rotationHandles.on("touchmove", handleRotation);
          } else {
            // console.log("false");
            ids.call(drag);
            cockpits.call(drag);
            boats.call(drag);
            rotationHandles.call(rotation);
          }
        },
        (update) => {
          update
            .transition()
            .ease(d3.easeLinear)
            .duration(transitionDuration)
            .attr("transform", (d) =>
              d.r
                ? `translate(${d.x},${d.y}) rotate(${d.r})`
                : `translate(${d.x},${d.y}) rotate(${d.r0})`
            )
            .style("display", (d) => d.visible);
          update
            .selectAll(".boat")
            .attr("fill", (d) => d.color)
            .attr("d", generateBoatPath(0, 0, boatWidth, boatHeight));
          update.selectAll(".cockpits").attr("r", boatWidth / 2);

          update
            .selectAll(".rotation-handles")
            .attr("cy", boatHeight / 2 + boatWidth / 2)
            .attr("r", boatWidth / 8);

          update
            .selectAll(".boatID")
            .attr("y", boatWidth * 0.3)
            .attr("font-size", boatWidth * 0.8);
        }
      );

    // const arrows = nodes
    //   .selectAll(".arrow")
    //   .append("line")
    //   .attr("x1", 0)
    //   .attr("y1", -boatWidth / 2)
    //   .attr("x2", 0)
    //   .attr("y2", -boatHeight / 3);
  };
  my.boatState = function (_) {
    return arguments.length ? ((boatState = _), my) : my;
  };
  my.transitionDuration = function (_) {
    return arguments.length ? ((transitionDuration = _), my) : my;
  };
  return my;
};
