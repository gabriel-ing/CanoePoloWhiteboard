export const getInitialBoatState = (width, height, nTeam1 = 5, nTeam2 = 5) => {
  const team1Pos = [
    { x: width / 9, y: height / 2, r0: 90, color: "#e6ceb2", id: 1, team: 1 },
    {
      x: (width * 2) / 9,
      y: height / 3,
      r0: 90,
      color: "#e6ceb2",
      id: 2,
      team: 1,
    },
    {
      x: (width * 2) / 9,
      y: (height * 2) / 3,
      r0: 90,
      color: "#e6ceb2",
      id: 3,
      team: 1,
    },
    {
      x: (width * 3) / 9,
      y: height / 6,
      r0: 90,
      color: "#e6ceb2",
      id: 4,
      team: 1,
    },
    {
      x: (width * 3) / 9,
      y: (height * 5) / 6,
      r0: 90,
      color: "#e6ceb2",
      id: 5,
      team: 1,
    },
  ];
  const team2Pos = [
    {
      x: width - width / 9,
      y: height / 2,
      r0: -90,
      color: "#b2e6ce",
      id: 1,
      team: 2,
    },
    {
      x: width - (width * 2) / 9,
      y: height / 3,
      r0: -90,
      color: "#b2e6ce",
      id: 2,
      team: 2,
    },
    {
      x: width - (width * 2) / 9,
      y: (height * 2) / 3,
      r0: -90,
      color: "#b2e6ce",
      id: 3,
      team: 2,
    },
    {
      x: width - (width * 3) / 9,
      y: height / 6,
      r0: -90,
      color: "#b2e6ce",
      id: 4,
      team: 2,
    },
    {
      x: width - (width * 3) / 9,
      y: (height * 5) / 6,
      r0: -90,
      color: "#b2e6ce",
      id: 5,
      team: 2,
    },
  ];
  //   console.log(team1Pos.slice(0, 4));
  const positions = team1Pos.slice(0, nTeam1).concat(team2Pos.slice(0, nTeam2));
  //   console.log(positions);
  return positions;
};

export const getInitialBallState = (width, height) => {
  return {
    x: width / 2 + 0.02 * width,
    y: height / 2 + 0.02 * height,
    r0: 0,
  };
};

export const getDefensiveFormation = (width, height) => {
  return [
    { x: width / 9, y: height / 2, r0: 90, color: "#e6ceb2", id: 1 },
    {
      x: (width * 2) / 9,
      y: (height * 2) / 5,
      r0: 135,
      color: "#e6ceb2",
      id: 2,
    },
    {
      x: (width * 2) / 9,
      y: (height * 3) / 5,
      r0: 45,
      color: "#e6ceb2",
      id: 3,
    },
    {
      x: (width * 3) / 9,
      y: (height * 3) / 10,
      r0: 120,
      color: "#e6ceb2",
      id: 4,
    },
    {
      x: (width * 3) / 9,
      y: (height * 7) / 10,
      r0: 70,
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
