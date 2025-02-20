export const getInitialBoatState = (width, height) => {
  return [
    { x: width / 9, y: height / 2, r0: 90, color: "#e6ceb2", id: 1 },
    { x: (width * 2) / 9, y: height / 3, r0: 90, color: "#e6ceb2", id: 2 },
    {
      x: (width * 2) / 9,
      y: (height * 2) / 3,
      r0: 90,
      color: "#e6ceb2",
      id: 3,
    },
    { x: (width * 3) / 9, y: height / 6, r0: 90, color: "#e6ceb2", id: 4 },
    {
      x: (width * 3) / 9,
      y: (height * 5) / 6,
      r0: 90,
      color: "#e6ceb2",
      id: 5,
    },

    { x: width - width / 9, y: height / 2, r0: -90, color: "#b2e6ce", id: 1 },
    {
      x: width - (width * 2) / 9,
      y: height / 3,
      r0: -90,
      color: "#b2e6ce",
      id: 2,
    },
    {
      x: width - (width * 2) / 9,
      y: (height * 2) / 3,
      r0: -90,
      color: "#b2e6ce",
      id: 3,
    },
    {
      x: width - (width * 3) / 9,
      y: height / 6,
      r0: -90,
      color: "#b2e6ce",
      id: 4,
    },
    {
      x: width - (width * 3) / 9,
      y: (height * 5) / 6,
      r0: -90,
      color: "#b2e6ce",
      id: 5,
    },
  ];
};
