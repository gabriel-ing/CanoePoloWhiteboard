export const generateBoatPath = (x, y, w, h) => {
  let pathD = `M ${x - w / 2} ${y},
  C ${x - w / 2} ${y}, ${x - w / 4} ${y + h}, ${x - w / 4} ${y + h},
  C ${x - w / 4} ${y + h},${x} ${y + h + h * 0.1},${x + w / 4} ${y + h}
  C ${x + w / 4} ${y + h}, ${x + w / 2} ${y},${x + w / 2} ${y}
  
  C ${x + w / 2} ${y}, ${x + w / 4} ${y - h}, ${x + w / 4} ${y - h}
   C ${x + w / 4} ${y - h}, ${x} ${y - h - h * 0.2}, ${x - w / 4} ${y - h}z`;
  console.log(pathD);
  return pathD;
};
