export function handleRotation(e) {
  const parentNode = d3.select(this.parentNode);
  let d = parentNode.datum();

  let dx, dy;
  if (window.mobile) {
    const touch = e.touches[0];
    dx = touch.pageX - d.x;
    dy = touch.pageY - d.y;
  } else {
    dx = e.sourceEvent.pageX - d.x;
    dy = e.sourceEvent.pageY - d.y;
  }

  let newAngle = Math.atan2(dy, dx) * (180 / Math.PI);

  d.r = d.r0  + newAngle;

  parentNode.attr(
    "transform",
    (d) => `translate(${d.x}, ${d.y}) rotate(${d.r})`
  );
}

export function handleDrag(e) {
    // console.log(e);
    const parentNode = d3.select(this.parentNode);
    let d = parentNode.datum(); // Get bound data
  
    if (!d.r) {
      d.r = d.r0;
    }
    if (window.mobile) {
      const touch = e.touches[0];
      d.x = touch.pageX;
      d.y = touch.pageY;
    } else {
      d.x = e.sourceEvent.pageX;
      d.y = e.sourceEvent.pageY;
    }
  
    parentNode.attr("transform", (d) => {
      return `translate(${d.x}, ${d.y}) rotate(${d.r})`;
    });
  }
  