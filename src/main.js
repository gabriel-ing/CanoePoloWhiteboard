import * as d3 from "d3";
import { checkMobile } from "./utils/checkMobile";
import { saveChart, saveChartPng } from "./utils/saveChart.js";
import { displayFullScreen, resetScreen } from "./utils/displayFullScreen";
import { canoePoloWhiteboard } from "./canoePoloWhiteboard";
import {
  getInitialBoatStateKickoff,
  initialStateDict,
} from "./initialBoatState.js";
import {
  animationInstructions,
  clearAnimation,
  loadPositions,
  goToPosition,
  reanimateStates,
  savePositions,
  saveState,
  open3D,
} from "./utils/animate.js";
import { Ball } from "./ball.js";
window.open3D = open3D;
window.ball = true; //document.getElementById("ball-checkbox").checked;
window.resetState = getInitialBoatStateKickoff;
// document.getElementById("options-panel").display = "none";
// document.getElementById("options-panel").visibility = "hidden";
document.getElementById("ball-checkbox").addEventListener("change", (event) => {
  window.ball = event.target.checked;
  svg.selectAll(".ball").style("display", event.target.checked ? null : "none");
});

window.optionsClick = () => {
  document.getElementById("options-panel").display = true;
  document.getElementById("options-panel").visibility = "true";
};

window.addEventListener("resize", resetScreen, false);


document
  .getElementById("animation-file-input")
  .addEventListener("change", (event) => {
    loadPositions(false);
  });

window.showInfo = () => {
  alert(`Welcome to the Canoe Polo Whiteboard! 
      Its a basic tactics tool for Canoe Polo.

      To start using it, just click on the boats and or ball and drag them around. The black circle at the back of each boat is the 'rotation handle' - click here to rotate the boat.

      Once you get going, try animating it - there is a separate info button on the animation panel!
    
    `);
};
//Button functions:
window.resetScreen = resetScreen;
window.mobile = checkMobile();
window.saveChart = saveChart;
window.savePng = saveChartPng;
// Animation functions:
window.currentPosition = 0;
window.states = [];
window.ballStates = [];
window.saveState = saveState;
window.reanimateStates = reanimateStates;
window.clearAnimation = clearAnimation;
window.animationInstructions = animationInstructions;
window.savePositions = savePositions;
window.loadPositions = loadPositions;
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

// alert(`Welcome!
//   This is an online whiteboard for demonstrating and visualising Canoe Polo tactics.
//   It works simply enough - the boats and ball can be dragged around the board. At the back of each boat there is a black circle which is a rotation handle - click and drag this to rotate the boat.

//   Theres also a basic animation function - you can save sets of positions of the boat and balls with "save position"  and then "Play Animation" and it will smoothly move all the components between each position making a simple animation. You can also save or reload animations. If you would like to see an example animation click "load demo" followed by "Play animation"

//   There are buttons to go full-screen, to save an image and to reset the boats in the top right hand corner.

//   `);

document
  .getElementById("position-slider")
  .addEventListener("change", (event) => {
    window.currentPosition = event.target.value;
    console.log(window.currentPosition);
    goToPosition(event.target.value);
  });

document.getElementById("chart-container").style.width = `${
  window.innerWidth * 0.99
}px`;
document.getElementById("chart-container").style.height = `${
  window.innerHeight * 0.90
}px`;

window.displayFullScreen = displayFullScreen;

const div = d3.select("#chart");
const svg = div
  .append("svg")
  .attr("id", "whiteboard-svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("width", "100%")
  .attr("height", "100%");

const width = svg.node().getBoundingClientRect().width;
const height = svg.node().getBoundingClientRect().height;
svg
  .append("rect")
  .attr("width", width)
  .attr("id", "background-rect")
  .attr("height", height)
  .attr("fill", "#d9e5f2");

// console.log(window.resetState(width, height));
const whiteboard = canoePoloWhiteboard().boatState(
  window.resetState(width, height)
);

svg.call(whiteboard);

if (window.ball) {
  const ball = Ball();
  svg.call(ball);
}
document.getElementById("nTeam1").addEventListener("change", (event) => {
  const team = 1;
  const maxId = +event.target.value;
  const adjustedData = d3
    .selectAll(".nodes")
    .data()
    .map((d) => {
      if (d.id > maxId && d.team === team) {
        d.visible = "none";
      } else if (d.team === team) {
        d.visible = null;
      }
      return d;
    });

  whiteboard.boatState(adjustedData);
  svg.call(whiteboard);
  // const filtered= data.filter(d=> d.id<=event.target.value)
});
document.getElementById("nTeam2").addEventListener("change", (event) => {
  const team = 2;
  const maxId = +event.target.value + 5;
  // console.log(maxId);

  const adjustedData = d3
    .selectAll(".nodes")
    .data()
    .map((d) => {
      if (d.id > maxId && d.team === team) {
        d.visible = "none";
      } else if (d.team === team) {
        d.visible = null;
      }
      return d;
    });
  console.log(adjustedData);

  whiteboard.boatState(adjustedData);
  svg.call(whiteboard);
  // d3.selectAll(".nodes")
  //   .filter((d) => d.id <= maxId && d.team === team)
  //   .style("display", null);
  // const filtered= data.filter(d=> d.id<=event.target.value)
});

document.getElementById("reset-state").addEventListener("change", (event) => {
  window.resetState = initialStateDict[event.target.value];
  resetScreen(true);
});

if (sessionStorage.getItem("states")) {
  console.log(sessionStorage.getItem("states"));
  loadPositions(false, true);
}
