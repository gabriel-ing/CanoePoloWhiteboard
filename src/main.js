import * as d3 from "d3";
import { checkMobile } from "./utils/checkMobile";
import { saveChart, saveChartPng } from "./utils/saveChart.js";
import { displayFullScreen, resetScreen } from "./utils/displayFullScreen";
import { canoePoloWhiteboard } from "./canoePoloWhiteboard";
import { getDefensiveFormation } from "./initialBoatState.js";
import {
  animationInstructions,
  clearAnimation,
  reanimateStates,
  saveState,
} from "./utils/animate.js";

//Button functions:
window.resetScreen = resetScreen;
window.mobile = checkMobile();
window.saveChart = saveChart;
window.savePng = saveChartPng;

// Animation functions:
window.states = [];
window.saveState = saveState;
window.reanimateStates = reanimateStates;
window.clearAnimation = clearAnimation;
window.animationInstructions = animationInstructions;

// document.getElementById("orange-boats").addEventListener("change", (event) => {
//   const team = 1;
//   console.log(event.target.value);

//   const filtered = d3.selectAll(".nodes").filter((d) => {
//     console.log(d);
//     return d.id > event.target.value;
//   }).remove(); //.remove()
//   // const filtered= data.filter(d=> d.id<=event.target.value)
//   console.log(filtered);
// });

const div = d3.select("#chart");
document.getElementById("chart").style.width = `${window.innerWidth * 0.99}px`;
document.getElementById("chart").style.height = `${
  window.innerHeight * 0.99 - 50
}px`;

window.displayFullScreen = displayFullScreen;

const svg = div
  .append("svg")
  .attr("id", "whiteboard-svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("width", "100%")
  .attr("height", "100%");

window.changeState = () => {
  const state = getDefensiveFormation(
    svg.node().getBoundingClientRect().width,
    svg.node().getBoundingClientRect().height
  );
  const newState = canoePoloWhiteboard().boatState(state);
  svg.call(newState);
};
const whiteboard = canoePoloWhiteboard();

svg.call(whiteboard);
