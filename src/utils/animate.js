import { canoePoloWhiteboard } from "../canoePoloWhiteboard";
import { getDemoStates, getDemoBallStates } from "./getDemoStates";
import { Ball } from "../ball";

export const saveState = (rewrite = false) => {
  const svg = d3.select("#whiteboard-svg");
  const arr = svg.selectAll(".nodes").data();
  const newArr = structuredClone(arr);

  if (!rewrite) {
    if (window.ball) {
      const ballState = structuredClone(svg.selectAll(".ball").data()[0]);
      window.ballStates.push(ballState);
    }
    window.states.push(newArr);
    console.log("state-saved");
    
    setPositionSlider();
  } else {
    if (window.ball) {
      const ballState = structuredClone(svg.selectAll(".ball").data()[0]);
      window.ballStates[window.currentState]=ballState;
    }
    window.states[window.currentState] = newArr
  }
};

function setPositionSlider(n = null) {
  const positionSlider = document.getElementById("position-slider");
  positionSlider.disabled = false;
  positionSlider.max = window.states.length - 1;

  if (!n) {
    positionSlider.value = window.states.length - 1;
    document.getElementById("current-position").innerHTML = window.states.length;
  } else {
    positionSlider.value = n;
    document.getElementById("current-position").innerHTML = n+1;
  }

  
}
const speedConversion = {
  "0.25x": 4,
  "0.5x": 2,
  "0.75x": 1.5,
  "1x": 1,
  "2x": 0.5,
  "4x": 0.25,
};
export const reanimateStates = async (demo = false) => {
  const duration =
    speedConversion[document.getElementById("duration").value] * 1000;
  console.log("here");
  const svg = d3.select("#whiteboard-svg");
  let states = demo ? getDemoStates() : window.states;

  let ballStates = demo ? getDemoBallStates() : window.ballStates;
  for (let i = 0; i < states.length; i++) {
    // console.log(states[i]);

    setPositionSlider(i)
    const newWhiteboard = canoePoloWhiteboard()
      .boatState(states[i])
      .transitionDuration(i === 0 ? 500 : duration);

    svg.call(newWhiteboard);
    if (window.ball) {
      const newBall = Ball()
        .ballState(ballStates[i])
        .transitionDuration(i === 0 ? 500 : duration);
      svg.call(newBall);
    }
    let delayres = await delay(i === 0 ? 500 : duration);
  }
  console.log(states);
  // console.log(ballStates);
};
const delay = (delayInms) => {
  return new Promise((resolve) => setTimeout(resolve, delayInms));
};

export const animationInstructions = () => {
  alert(
    `How to Animate \n
    An animation is created by saving positions and then moving the boats directly between those positions. 
     Step 1: Save the initial positions with the 'Add Frame' button.
     Step 2: Move the boats to a new position and click 'Add Frame'. Change as many boats as you wish between states.
     Step 3: Repeat for any amount of positions
     Step 4: Click 'Play Animation' and the screen will animate between the frames
     
Want an example? Click to load the demo and then press 'Play Animation'!

After creating the animation, you can return to frames using the slider, and edit the frame you are on with the 'Rewrite frame' 

When you are happy with an animation, try it in 3D with the 'View in 3D' button! (note this is still in production)
`
  );
};

export const clearAnimation = () => {
  window.states = [];
  window.ballStates = [];
  document.getElementById("position-slider").disabled=true;
  document.getElementById("current-position").innerHTML='0'
};

export const savePositions = () => {
  const boatStates = window.states;
  const ballStates = window.ballStates;
  const svg = d3.select("#whiteboard-svg");
  const width = svg.node().getBoundingClientRect().width;
  const height = svg.node().getBoundingClientRect().height;
  console.log(ballStates);
  const obj = {
    boatStates: boatStates,
    ballStates: ballStates,
    width: width,
    height: height,
  };
  const json = JSON.stringify(obj);
  const positionsBlob = new Blob([json], { type: "application/json" });

  const fileURL = URL.createObjectURL(positionsBlob);
  const downloadLink = document.createElement("a");
  downloadLink.href = fileURL;
  downloadLink.download = `animation-positions.json`;
  document.body.appendChild(downloadLink);

  downloadLink.click();
};
export const loadPositions = async (demo = false, loadSession=false) => {
  console.log(document.getElementById("animation-file-input").value);
  let positions;

  if (demo) {
    const positions = await d3.json("demo.json");
    console.log(positions);
    const scaledPositions = scaleData(positions);
    window.states = scaledPositions.boatStates;
    window.ballStates = scaledPositions.ballStates;
    // document.getElementById("state-count").innerHTML = window.states.length;
    setPositionSlider();
    goToPosition(window.states.length - 1);
    return;
  }

  if (loadSession) { 
    const positions = JSON.parse(sessionStorage.getItem("states"))
    const scaledPositions = scaleData(positions);
    window.states = scaledPositions.boatStates;
    window.ballStates = scaledPositions.ballStates;
    // document.getElementById("state-count").innerHTML = window.states.length;
    setPositionSlider();
    goToPosition(window.states.length - 1);
    return;
  }

  let file = document.getElementById("animation-file-input").files[0];
  if (!file) {
    alert("No file selected");
    return;
  }
  const reader = new FileReader();
  reader.onload = async function (event) {
    console.log(event);
    try {
      const positions = JSON.parse(event.target.result); // Parse file content as JSON

      const scaledPositions = scaleData(positions);
      window.states = scaledPositions.boatStates;
      window.ballStates = scaledPositions.ballStates;
      document.getElementById("state-count").innerHTML = window.states.length;
      console.log(window.states, window.ballStates);
      setPositionSlider();
    } catch (error) {
      alert("Error - failed to read file");
      console.error(error);
    }
  };

  reader.readAsText(file); // Read file as text
};

const scaleData = (data) => {
  const svg = d3.select("#whiteboard-svg");
  const width = svg.node().getBoundingClientRect().width;
  const height = svg.node().getBoundingClientRect().height;

  const dataWidth = data.width;
  const dataheight = data.height;

  const scaledBallStates = data.ballStates.map((d) => {
    d.x = (d.x * width) / dataWidth;
    d.y = (d.y * height) / dataheight;
    return d;
  });

  const scaledBoatStates = data.boatStates.map((d) =>
    d.map((v) => {
      v.x = (v.x * width) / dataWidth;
      v.y = (v.y * height) / dataheight;
      return v;
    })
  );

  return { boatStates: scaledBoatStates, ballStates: scaledBallStates };
};

export const open3D = () => {
  const boatStates = window.states;
  const ballStates = window.ballStates;
  const svg = d3.select("#whiteboard-svg");
  const width = svg.node().getBoundingClientRect().width;
  const height = svg.node().getBoundingClientRect().height;
  console.log(ballStates);
  const obj = {
    boatStates: boatStates,
    ballStates: ballStates,
    width: width,
    height: height,
  };
  sessionStorage.setItem("states", JSON.stringify(obj));
  console.log(JSON.parse(sessionStorage.getItem("states")));
  const threeDLink = document.createElement("a");
  threeDLink.href = "https://gabriel-ing.github.io/CanoePolo3D/";
  document.body.appendChild(threeDLink);
  threeDLink.click();
};

export const goToPosition = (n) => {
  console.log(`Going to position ${n}`);
  const boatStates = window.states[n];
  const ballStates = window.ballStates[n];
  const svg = d3.select("#whiteboard-svg");
  svg.call(canoePoloWhiteboard().boatState(boatStates));
  svg.call(Ball().ballState(ballStates));
  document.getElementById("current-position").innerHTML = Number(n)+1;
};
// export const getDemoStates = () => {
//   const svg = d3.select("#whiteboard-svg");
//   const width = svg.node().getBoundingClientRect().width;
//   const height = svg.node().getBoundingClientRect().height;

//   const demoStatesCopy = structuredClone(demoStates);
//   const scaledStates = demoStatesCopy.map((d) =>
//     d.map((v) => {
//       v.x = (v.x * width) / demoWidth;
//       v.y = (v.y * height) / demoHeight;
//       return v;
//     })
//   );

//   return scaledStates;
// };
// export const getDemoBallStates = () => {
//   const svg = d3.select("#whiteboard-svg");
//   const width = svg.node().getBoundingClientRect().width;
//   const height = svg.node().getBoundingClientRect().height;
//   const demoBallStatesCopy = structuredClone(demoBallStates);

//   const scaledDemoBallStates = demoBallStatesCopy.map((d) => {
//     d.x = (d.x * width) / demoWidth;
//     d.y = (d.y * height) / demoHeight;
//     return d;
//   });
//   return scaledDemoBallStates;
// };
