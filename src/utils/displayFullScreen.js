import { canoePoloWhiteboard } from "../canoePoloWhiteboard";
import { getInitialBoatState } from "../initialBoatState";
import { saveChart } from "./saveChart.js";
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

  // const svg = d3.select("#whiteboard-svg");
  // const pitch = d3.select("#pitch");

  resetScreen("whiteboard-svg", true);

  // d3.select("#fullscreen-button")
  //   .classed("fa-maximize", false)
  //   .classed("fa-xmark", true);
  document.getElementById("fullscreen-button").classList.remove("fa-maximize");
  document.getElementById("fullscreen-button").classList.add("fa-xmark");
  document.getElementById("fullscreen-button").onclick = exitFullscreen;
};

export const exitFullscreen = () => {
  console.log("exiting");
  resetScreen("whiteboard-svg", false);
  // d3.select("#fullscreen-button")
  //   .classed("fa-xmark", false)
  //   .classed("fa-maximize", true);
  document.getElementById("fullscreen-button").classList.remove("fa-xmark");
  document.getElementById("fullscreen-button").classList.add("fa-maximize");
  document.getElementById("fullscreen-button").onclick = () =>
    displayFullScreen("chart");
  document.exitFullscreen();
};

export const resetScreen = (id, resetBoats) => {
  // console.log("reset");

  const svg = d3.select("#" + id);
  document.getElementById("chart").style.width = `${
    window.innerWidth * 0.99
  }px`;
  document.getElementById("chart").style.height = `${
    window.innerHeight * 0.99 - 50
  }px`;

  // console.log(
  //   svg.node().getBoundingClientRect().width,
  //   svg.node().getBoundingClientRect().height
  // );
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
