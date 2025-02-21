import { canoePoloWhiteboard } from "../canoePoloWhiteboard";
import { getDemoStates } from "./getDemoStates";
export const saveState = () => {
  const svg = d3.select("#whiteboard-svg");
  const arr = svg.selectAll(".nodes").data();
  const newArr = structuredClone(arr);
  //   console.log(arr[0]);
  window.states.push(newArr);
  console.log("state-saved");
  document.getElementById("state-count").innerHTML = window.states.length;
};

export const reanimateStates = async (demo = false) => {
  //   console.log(window.states);
  const duration = document.getElementById("duration").value * 1000;
  console.log("here");
  const svg = d3.select("#whiteboard-svg");
  let states = demo? getDemoStates() : window.states
    
  for (let i = 0; i < states.length; i++) {
    console.log(states[i]);

    const newWhiteboard = canoePoloWhiteboard()
      .boatState(states[i])
      .transitionDuration(i === 0 ? 500 : duration);

    svg.call(newWhiteboard);
    let delayres = await delay(i === 0 ? 500 : duration);
  }
  console.log(states);
};
const delay = (delayInms) => {
  return new Promise((resolve) => setTimeout(resolve, delayInms));
};

export const animationInstructions = () => {
  alert(
    `How to Animate \n
    An animation is created by saving positions and then moving the boats directly between those positions. 
     Step 1: Save the initial positions with the 'Save State' button.
     Step 2: Move the boats to a new position and click 'Save State'. You may change as many boats as you wish between states.
     Step 3: Repeat for any amount of positions
     Step 4: Choose the duration of the animation between each state (note total duration = time per state X number of states)
     Step 5: Click 'Animate' and the screen will animate the pre-defined states
     
Want an example? Click demo!`
  );
};

export const clearAnimation = () => {
  window.states = [];
  document.getElementById("state-count").innerHTML = window.states.length;
};
