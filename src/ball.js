import { dragStart, handleDrag } from "./utils/handleDrag";
const ballColor = "#264a73"
export const Ball = () => {
  let ballState;
  let transitionDuration = 1000;
  const my = (svg) => {
    const width = svg.node().getBoundingClientRect().width;
    const height = svg.node().getBoundingClientRect().height;
    const radius = width / 120;
    if (!ballState)
      ballState = {
        x: width / 2 + 0.02 * width,
        y: height / 2 + 0.02 * height,
        r0: 0,
      };
    svg
      .selectAll(".ball")
      .data([ballState])
      .join(
        (enter) => {
          const g = enter
            .append("g")
            .attr("transform", (d) => `translate(${d.x},  ${d.y})`)
            .attr("class", "ball");

          const circle = g
            .append("circle")
            .attr("stroke-width", 2)
            .attr("stroke", "black")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("fill", ballColor)
            .attr("r", radius);

          if (window.mobile) {
            circle.on("touchstart", dragStart).on("touchmove", handleDrag);
          } else {
            let drag = d3.drag().on("start", dragStart).on("drag", handleDrag);
            circle.call(drag);
          }
        },
        (update) => {
          update
            .transition()
            .ease(d3.easeLinear)
            .duration(transitionDuration)
            .attr("transform", (d) => {
              //   console.log(d);
              return `translate(${d.x},  ${d.y})`;
            });
          update.selectAll(".ball").attr("r", radius);
        }
      );
  };
  my.ballState = function (_) {
    return arguments.length ? ((ballState = _), my) : my;
  };
  my.transitionDuration = function (_) {
    return arguments.length ? ((transitionDuration = _), my) : my;
  };
  return my;
};
