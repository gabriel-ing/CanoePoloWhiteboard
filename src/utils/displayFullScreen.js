import { canoePoloWhiteboard } from "../canoePoloWhiteboard";
import { getInitialBoatState } from "../initialBoatState";

export const displayFullScreen = async (id) => {
  var elem = document.getElementById(id);

  if (elem.requestFullscreen) {
    await elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) {
    /* Safari */
    await elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
    /* IE11 */
    await elem.msRequestFullscreen();
  }

  const svg = d3.select("#whiteboard-svg");
  const pitch = d3.select("#pitch");

  resetScreen("whiteboard-svg");

  svg
    .append("path")
    .attr("d", d3.symbol(d3.symbolCross).size(pitch.attr("width") / 8))
    .attr("transform", `translate(${pitch.attr("width") - 20},30) rotate(45)`)
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .attr("fill", "rgba(0,0,0,0.2)")

    .on("click", function (event) {
      document.exitFullscreen();
      this.remove();
    });
};

export const resetScreen = (id, resetBoats) => {
  console.log("reset");

  const svg = d3.select("#" + id);
  document.getElementById("chart").style.width = `${
    window.innerWidth * 0.99
  }px`;
  document.getElementById("chart").style.height = `${
    window.innerHeight * 0.99 - 50
  }px`;

  console.log(svg.node().getBoundingClientRect().width, svg.node().getBoundingClientRect().height)
  let boatState;
  if (resetBoats) {
    boatState = getInitialBoatState(
      svg.node().getBoundingClientRect().width,
      svg.node().getBoundingClientRect().height
    );
  } else {
    boatState = svg.selectAll(".nodes").data();
  }
  // let boatState = svg.selectAll(".nodes").data()
  console.log(svg.node().getBoundingClientRect().width);

  console.log(boatState);
  const whiteboard = canoePoloWhiteboard().boatState(boatState);
  svg.call(whiteboard);
};
