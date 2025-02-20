import * as d3 from "d3"


const width = 929;
const height = 504;
const nShades = 9;
const padding = 5;

let mobile = (function () {
  let check = false;
  (function (a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
        a,
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4),
      )
    )
      check = true;
  })(
    navigator.userAgent || navigator.vendor || window.opera,
  );
  return check;
})();
console.log(mobile);

let margin = { top: 20, right: 10, bottom: 0, left: 100 };
const svg = d3
  .select('#chart')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

const playingArea = svg
  .append('g')
  .attr('transform', `translate(15, 2)`);

playingArea
  .append('rect')
  .attr('width', 900)
  .attr('height', 500)
  .attr('x', 0)
  .attr('y', 0)

  .attr('stroke', '#cc6695')
  .attr('stroke-width', 2)
  .attr('fill', '#ecf2f9');
const goalHeight = 50;
const goalWidth = 10;
const goals = playingArea
  .selectAll('.goals')
  .data([0 - goalWidth, 900])
  .join('rect')
  .attr('x', (d) => d)
  .attr('y', 250 - goalHeight / 2)
  .attr('width', goalWidth)
  .attr('height', goalHeight);

const generateTeardropPath = (cx, cy, w, h) => {
  let pathD;
  pathD = `M150 60
           Q 150 60, 250 180
           A 128 128 0 1 1 50 180
           Q 150 60 150 60z`;

  const tipY = cy - h + w / 2;
  const tipX = cx;
  pathD = `M${tipX} ${tipY}
           C ${tipX} ${tipY},${cx + w / 2} ${cy}, ${cx + w / 2} ${cy}
           A ${w / 2} ${w / 2} 0 1 1 ${cx - w / 2} ${cy}
           C ${tipX} ${tipY},${tipX} ${tipY},${tipX} ${tipY}z`;

  // console.log(pathD);
  return pathD;
};

const generateBoatPath = (x, y, w, h) => {
  let pathD = `M ${x - w / 2} ${y},
  C ${x - w / 2} ${y}, ${x - w / 4} ${y + h}, ${x - w / 4} ${y + h},
  C ${x - w / 4} ${y + h},${x} ${y + h + h * 0.1},${x + w / 4} ${y + h}
  C ${x + w / 4} ${y + h}, ${x + w / 2} ${y},${x + w / 2} ${y}
  
  C ${x + w / 2} ${y}, ${x + w / 4} ${y - h}, ${x + w / 4} ${y - h}
   C ${x + w / 4} ${y - h}, ${x} ${y - h - h * 0.2}, ${x - w / 4} ${y - h}z`;
  console.log(pathD);
  return pathD;
};
function handleDrag(e) {
  // console.log(e);
  const parentNode = d3.select(this.parentNode);
  let d = parentNode.datum(); // Get bound data

  if (!d.r) {
    d.r = d.r0;
  }
  if (mobile) {
    const touch = e.touches[0];
    d.x = touch.pageX;
    d.y = touch.pageY;
  } else {
    d.x = e.sourceEvent.pageX;
    d.y = e.sourceEvent.pageY;
  }
  // console.log(e.x, e.y);
  // console.log(d.x, d.y);
  // // consol
  // console.log(e.sourceEvent.pageX, e.sourceEvent.pageX);

  parentNode.attr('transform', (d) => {
    // console.log(`translate(${d.x}, ${d.y}) rotate(${d.r})`);
    return `translate(${d.x}, ${d.y}) rotate(${d.r})`;
  });
}

function handleRotation(e) {
  const parentNode = d3.select(this.parentNode);
  let d = parentNode.datum();

  // Compute mouse position relative to node center
  let dx, dy;
  if (mobile) {
    const touch = e.touches[0];
    dx = touch.pageX - d.x;
    dy = touch.pageY - d.y;
  } else {
    dx = e.sourceEvent.pageX - d.x;
    dy = e.sourceEvent.pageY - d.y;
  }
  // Compute angle using atan2
  let newAngle = Math.atan2(dy, dx) * (180 / Math.PI); // Convert to degrees

  // Smooth rotation by interpolating towards the new angle
  d.r = d.r0 + 180 + newAngle; // Adjust the 0.1 factor for more/less smoothing
  // console.log
  parentNode.attr(
    'transform',
    (d) => `translate(${d.x}, ${d.y}) rotate(${d.r})`,
  );
  // simulation.alpha(1).restart();
}

// function update() {
//   svg.select('.node').join(
//     (enter) => {},
//     (update) => {
//       // console.log(update.node());
//       update.attr('transform', (d) => {
//         // console.log(d);
//         return `translate(${d.dx}, ${d.dy})`;
//       });
//     },
//   );
// }

let drag = d3.drag().on('drag', handleDrag);
let rotation = d3.drag().on('drag', handleRotation);

const boatData = [
  { x: 115, y: 250, r0: 90, color: '#e6ceb2', id: 1 },
  { x: 215, y: 320, r0: 90, color: '#e6ceb2', id: 2 },
  { x: 215, y: 180, r0: 90, color: '#e6ceb2', id: 3 },
  { x: 315, y: 100, r0: 90, color: '#e6ceb2', id: 4 },
  { x: 315, y: 400, r0: 90, color: '#e6ceb2', id: 5 },

  { x: 815, y: 250, r0: -90, color: '#b2e6ce', id: 1 },
  { x: 715, y: 320, r0: -90, color: '#b2e6ce', id: 2 },
  { x: 715, y: 180, r0: -90, color: '#b2e6ce', id: 3 },
  { x: 615, y: 100, r0: -90, color: '#b2e6ce', id: 4 },
  { x: 615, y: 400, r0: -90, color: '#b2e6ce', id: 5 },
];
const nodes = svg
  .selectAll('.node')
  .data(boatData)
  .join('g')
  .attr('class', 'node')
  .attr(
    'transform',
    (d) => `translate(${d.x},${d.y}) rotate(${d.r0})`,
  );

const boatWidth = 20;
const boatHeight = 60;
const boats = nodes
  .selectAll('.boat')
  .data((nodeData) => [nodeData])
  .join('path')
  .attr('class', 'boat')
  .attr('d', generateBoatPath(0, 0, boatWidth, boatHeight))
  .attr('fill', (d) => d.color)
  .attr('stroke', 'black')
  .attr('stroke-width', boatWidth / 10);

const rotationHandles = nodes
  .append('circle')
  .attr('cx', 0)
  .attr('cy', boatHeight + boatWidth / 2)
  .attr('r', boatWidth / 8)
  .attr('fill', '#0d1926')
  .attr('stroke', '#0d1926')
  .attr('stroke-width', 5);

const cockpits = nodes
  .append('circle')
  .attr('cx', 0)
  .attr('cy', 0)
  .attr('r', boatWidth / 2)
  .attr('opacity', 0.3);

const ids = nodes
  .selectAll('boatID')
  .data((nodeData) => [nodeData])
  .join('text')
  .attr('x', 0)
  .attr('y', boatWidth * 0.3)
  .attr('text-anchor', 'middle')
  .attr('font-size', boatWidth * 0.8)
  .text((d) => d.id);

if (mobile) {
  // ids.on('touchmove', drag);
  // ids.on('touchstart', drag);
  // cockpits.call(drag);
  boats.on('touchstart', (event) => {
    console.log(event);
  });
  boats.on('touchmove', handleDrag);
  rotationHandles.on('touchmove', handleRotation);
} else {
  console.log('false');
  ids.call(drag);
  cockpits.call(drag);
  boats.call(drag);
  rotationHandles.call(rotation);
}
