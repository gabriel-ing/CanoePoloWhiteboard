import * as d3 from "d3";
import { checkMobile } from "./utils/checkMobile";
import saveChart from "./utils/saveChart";
import { displayFullScreen, resetScreen } from "./utils/displayFullScreen";
import { canoePoloWhiteboard } from "./canoePoloWhiteboard";

window.resetScreen = resetScreen
window.mobile = checkMobile();
window.saveChart = saveChart;

const div = d3.select("#chart");
document.getElementById("chart").style.width = `${window.innerWidth * 0.99}px`;
document.getElementById("chart").style.height = `${
  window.innerHeight * 0.99 - 50
}px`;

window.displayFullScreen = displayFullScreen

const svg = div
.append("svg")
.attr("id", "whiteboard-svg")
.attr("preserveAspectRatio", "xMinYMin meet")
.attr("width", "100%")
.attr("height", "100%");

const whiteboard = canoePoloWhiteboard()

svg.call(whiteboard)