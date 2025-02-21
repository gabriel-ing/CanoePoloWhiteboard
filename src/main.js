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
import { Ball } from "./ball.js";

window.ball = document.getElementById("ball-checkbox").checked;
document.getElementById("ball-checkbox").addEventListener("change", (event) => {
  window.ball = event.target.checked;
  if (window.ball) {
    const ball = Ball();
    svg.call(ball);
  } else {
    svg.selectAll(".ball").remove();
  }
});
//Button functions:
window.resetScreen = resetScreen;
window.mobile = checkMobile();
window.saveChart = saveChart;
window.savePng = saveChartPng;

// Animation functions:
window.states = [];
window.ballStates = [];
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

const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;

if (windowHeight > windowWidth)
  alert(
    `It looks like your screen is in portrait, this app will work better in landscape so I recommend rotating your screen and reloading the page!`
  );

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

const whiteboard = canoePoloWhiteboard();

svg.call(whiteboard);

if (window.ball) {
  const ball = Ball();
  svg.call(ball);
}
