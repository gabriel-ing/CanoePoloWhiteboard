import { getInitialBoatState } from "./initialBoatState";
import { generateBoatPath } from "./utils/generateBoatPath";
import { handleDrag, handleRotation } from "./utils/handleDrag";
import * as d3 from "d3";

export const canoePoloWhiteboard = () => {
  let boatState;
  let transitionDuration=1000;

  const my = (svg) => {
    //   console.log(screen.height);

    const width = svg.node().getBoundingClientRect().width;
    const height = svg.node().getBoundingClientRect().height;
    console.log(width, height)
    const smallAxis = d3.min([width, height])
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    if (!boatState) {
      boatState = getInitialBoatState(width, height);
    }

    const playingArea = svg
      .selectAll(".playingArea")
      .data([{width: width, height: height}])
      .join("g")
      .attr("transform", d=>`translate(${d.width*0.01}, ${d.height*0.01})`)
      .attr("class", "playingArea");

    playingArea
      .selectAll("#pitch")
      .data(playingAreaData => [playingAreaData])
      .join("rect")
      .attr("width", d => d.width*0.98)
      .attr("height",d=>d.height*0.98)
      .attr("x", 0)
      .attr("y", 0)
      .attr("id", "pitch")
      .attr("stroke", "#cc6695")
      .attr("stroke-width", 2)
      .attr("fill", "#ecf2f9");

    const goalHeight = height/10;
    const goalWidth = width*0.005;

    const goals = playingArea
      .selectAll(".goals")
      .data([0 - goalWidth, width *0.98])
      .join("rect")
      .attr("x", (d) => d)
      .attr("class", "goals")
      .attr("y", height / 2 - goalHeight / 2)
      .attr("width", goalWidth)
      .attr("height", goalHeight);

    let drag = d3.drag().on("drag", handleDrag);
    let rotation = d3.drag().on("drag", handleRotation);

    const nodes = svg
      .selectAll(".nodes")
      .data(boatState)
      .join(
        (enter) => {
          const g = enter
            .append("g")
            .attr("class", "nodes")
            .attr(
              "transform",
              (d) => `translate(${d.x},${d.y}) rotate(${d.r0})`
            );

          const boatWidth = smallAxis / 20;
          const boatHeight = smallAxis / 7;
          const boats = g
            .selectAll(".boat")
            .data((nodeData) => [nodeData])
            .join("path")
            .attr("class", "boat")
            .attr("d", generateBoatPath(0, 0, boatWidth, boatHeight))
            .attr("fill", (d) => d.color)
            .attr("stroke", "black")
            .attr("stroke-width", boatWidth / 10);

          const rotationHandles = g
            .append("circle")
            .attr("cx", 0)
            .attr("cy", boatHeight + boatWidth / 2)
            .attr("r", boatWidth / 8)
            .attr("fill", "#0d1926")
            .attr("stroke", "#0d1926")
            .attr("class", "rotation-handles")
            .attr("stroke-width", 5);

          const cockpits = g
            .append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", boatWidth / 2)
            .attr("opacity", 0.3);

          const ids = g
            .selectAll("boatID")
            .data((nodeData) => [nodeData])
            .join("text")
            .attr("x", 0)
            .attr("y", boatWidth * 0.3)
            .attr("text-anchor", "middle")
            .attr("font-size", boatWidth * 0.8)
            .text((d) => d.id);

          if (window.mobile) {
            // ids.on('touchmove', drag);
            ids.on("touchmove", handleDrag);
            cockpits.on("touchmove", handleDrag);
            boats.on("touchmove", handleDrag);
            rotationHandles.on("touchmove", handleRotation);
          } else {
            // console.log("false");
            ids.call(drag);
            cockpits.call(drag);
            boats.call(drag);
            rotationHandles.call(rotation);
          }
        },
        (update) =>
          update.transition().duration(transitionDuration).attr(
            "transform",
            (d) => d.r? `translate(${d.x},${d.y}) rotate(${d.r})`: `translate(${d.x},${d.y}) rotate(${d.r0})`
          )
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
  return my;
};
