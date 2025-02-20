import * as d3 from "d3";
import { checkMobile } from "./utils/checkMobile";
import { saveChart, saveChartPng } from "./utils/saveChart.js";
import { displayFullScreen, resetScreen } from "./utils/displayFullScreen";
import { canoePoloWhiteboard } from "./canoePoloWhiteboard";
import { getDefensiveFormation } from "./initialBoatState.js";

window.resetScreen = resetScreen;
window.mobile = checkMobile();
window.saveChart = saveChart;
window.savePng = saveChartPng;

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
