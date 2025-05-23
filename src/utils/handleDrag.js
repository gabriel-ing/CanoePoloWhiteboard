export function handleRotation(e) {
  const parentNode = d3.select(this.parentNode);
  let d = parentNode.datum();

  let dx, dy;

  if (window.mobile) {
    const touch = e.touches[0];
    dx = touch.pageX;
    dy = touch.pageY;
  } else {
    dx = e.sourceEvent.pageX;
    dy = e.sourceEvent.pageY;
  }

  // console.log("d.x = ", d.x);
  // let newAngle = Math.atan2(dy, dx) * (180 / Math.PI);
  let a = { x: d.x, y: 0 };
  let b = { x: d.x, y: d.y };
  let c = { x: dx, y: dy };

  let angle = Number(find_angle(a, b, c)) * (180 / Math.PI);
  // console.log("pre-edit angle = ", angle.toFixed(2));
  if (dx > d.x) angle = 360 - angle;
  angle = 180 - angle;
  // console.log("new angle = ", angle.toFixed(2));

  d.r = angle;

  parentNode.attr(
    "transform",
    (d) => `translate(${d.x}, ${d.y}) rotate(${d.r})`
  );
}

export function handleDrag(e) {
  // console.log(e);
  const parentNode = d3.select(this.parentNode);
  let d = parentNode.datum(); // Get bound data
  // console.log(e.dx.toFixed(1), e.dy.toFixed(1));
  let dx, dy;
  if (!d.r) {
    d.r = d.r0;
  }
  if (window.mobile) {
    const touch = e.touches[0];

    dx = touch.pageX - window.dragStart[0];
    window.dragStart[0] = touch.pageX;

    dy = touch.pageY - window.dragStart[1];
    window.dragStart[1] = touch.pageY;

  } else {
    dx = e.sourceEvent.pageX - window.dragStart[0];
    window.dragStart[0] = e.sourceEvent.pageX;

    dy = e.sourceEvent.pageY - window.dragStart[1];
    window.dragStart[1] = e.sourceEvent.pageY;
    
  }

  d.x = d.x + dx;
  d.y = d.y + dy;
  parentNode.attr("transform", (d) => {
    return `translate(${d.x}, ${d.y}) rotate(${d.r})`;
  });
}

function find_angle(A, B, C) {
  var AB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
  var BC = Math.sqrt(Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2));
  var AC = Math.sqrt(Math.pow(C.x - A.x, 2) + Math.pow(C.y - A.y, 2));
  return Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB));
}

export function dragStart(e) {
  const parentNode = d3.select(this.parentNode);
  let d = parentNode.datum(); // Get bound data
  if (window.mobile) {
    window.dragStart = [e.touches[0].pageX, e.touches[0].pageY];
  } else {
    window.dragStart = [e.sourceEvent.pageX, e.sourceEvent.pageY];
  }

  // console.log(window.dragStart);
}
