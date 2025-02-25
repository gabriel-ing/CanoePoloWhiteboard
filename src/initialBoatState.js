import { min } from "d3";
export const getInitialBoatState = (width, height) => {
  const team1Pos = [
    {
      x: width / 9,
      y: height / 2,
      r0: 90,
      color: "#e6ceb2",
      id: 1,
      team: 1,
      visible: null,
    },
    {
      x: (width * 2) / 9,
      y: height / 3,
      r0: 90,
      color: "#e6ceb2",
      id: 2,
      team: 1,
      visible: null,
    },
    {
      x: (width * 2) / 9,
      y: (height * 2) / 3,
      r0: 90,
      color: "#e6ceb2",
      id: 3,
      team: 1,
      visible: null,
    },
    {
      x: (width * 3) / 9,
      y: height / 6,
      r0: 90,
      color: "#e6ceb2",
      id: 4,
      team: 1,
      visible: null,
    },
    {
      x: (width * 3) / 9,
      y: (height * 5) / 6,
      r0: 90,
      color: "#e6ceb2",
      id: 5,
      team: 1,
      visible: null,
    },
  ];
  const team2Pos = [
    {
      x: width - width / 9,
      y: height / 2,
      r0: -90,
      color: "#b2e6ce",
      id: 6,
      team: 2,
      visible: null,
    },
    {
      x: width - (width * 2) / 9,
      y: height / 3,
      r0: -90,
      color: "#b2e6ce",
      id: 7,
      team: 2,
      visible: null,
    },
    {
      x: width - (width * 2) / 9,
      y: (height * 2) / 3,
      r0: -90,
      color: "#b2e6ce",
      id: 8,
      team: 2,
      visible: null,
    },
    {
      x: width - (width * 3) / 9,
      y: height / 6,
      r0: -90,
      color: "#b2e6ce",
      id: 9,
      team: 2,
      visible: null,
    },
    {
      x: width - (width * 3) / 9,
      y: (height * 5) / 6,
      r0: -90,
      color: "#b2e6ce",
      id: 10,
      team: 2,
      visible: null,
    },
  ];
  //   console.log(team1Pos.slice(0, 4));
  // const positions = team1Pos.slice(0, nTeam1).concat(team2Pos.slice(0, nTeam2));

  return team1Pos.concat(team2Pos);
};

export const getInitialBallState = (width, height) => {
  return {
    x: width / 2 + 0.02 * width,
    y: height / 2 + 0.02 * height,
    r0: 0,
  };
};

export const getInitialBoatStateKickoff = (width, height) => {
  const boatHeight = min([width, height]) / 4;
  const team1Pos = [
    {
      x: 0 + boatHeight * 0.6,
      y: height / 2,
      r0: 90,
      color: "#e6ceb2",
      id: 1,
      team: 1,
      visible: null,
    },
    {
      x: 0,
      y: height / 3,
      r0: 90,
      color: "#e6ceb2",
      id: 2,
      team: 1,
      visible: null,
    },
    {
      x: 0,
      y: (height * 2) / 3,
      r0: 90,
      color: "#e6ceb2",
      id: 3,
      team: 1,
      visible: null,
    },
    {
      x: 0,
      y: height / 6,
      r0: 90,
      color: "#e6ceb2",
      id: 4,
      team: 1,
      visible: null,
    },
    {
      x: 0,
      y: (height * 5) / 6,
      r0: 90,
      color: "#e6ceb2",
      id: 5,
      team: 1,
      visible: null,
    },
  ];
  const team2Pos = [
    {
      x: width - (min([width, height]) / 4) * 0.6,
      y: height / 2,
      r0: -90,
      color: "#b2e6ce",
      id: 6,
      team: 2,
      visible: null,
    },
    {
      x: width,
      y: height / 3,
      r0: -90,
      color: "#b2e6ce",
      id: 7,
      team: 2,
      visible: null,
    },
    {
      x: width,
      y: (height * 2) / 3,
      r0: -90,
      color: "#b2e6ce",
      id: 8,
      team: 2,
      visible: null,
    },
    {
      x: width,
      y: height / 6,
      r0: -90,
      color: "#b2e6ce",
      id: 9,
      team: 2,
      visible: null,
    },
    {
      x: width,
      y: (height * 5) / 6,
      r0: -90,
      color: "#b2e6ce",
      id: 10,
      team: 2,
      visible: null,
    },
  ];
  //   console.log(team1Pos.slice(0, 4));
  // const positions = team1Pos.slice(0, nTeam1).concat(team2Pos.slice(0, nTeam2));

  return team1Pos.concat(team2Pos);
};

export const getOrangeDefensiveFormation = (width, height) => {
  const boatHeight = min([width, height]) / 4;
  return [
    {
      x: width / 9,
      y: height / 2,
      r0: 90,
      color: "#e6ceb2",
      id: 1,
      visible: null,
    },
    {
      x: (width * 2) / 9,
      y: (height * 2) / 5,
      r0: 135,
      color: "#e6ceb2",
      id: 2,
      visible: null,
    },
    {
      x: (width * 2) / 9,
      y: (height * 3) / 5,
      r0: 45,
      color: "#e6ceb2",
      id: 3,
      visible: null,
    },
    {
      x: (width * 3) / 9,
      y: (height * 3) / 10,
      r0: 120,
      color: "#e6ceb2",
      id: 4,
      visible: null,
    },
    {
      x: (width * 3) / 9,
      y: (height * 7) / 10,
      r0: 70,
      color: "#e6ceb2",
      id: 5,
      visible: null,
    },

    {
      x: width - width / 9,
      y: height / 2,
      r0: -90,
      color: "#b2e6ce",
      id: 6,
      visible: null,
    },
    {
      x: width - (width * 4) / 9,
      y: height / 3,
      r0: -90,
      color: "#b2e6ce",
      id: 7,
      visible: null,
    },
    {
      x: width / 2 + 0.3 * boatHeight,
      y: height / 2,
      r0: -90,
      color: "#b2e6ce",
      id: 8,
      visible: null,
    },
    {
      x: width / 2 + boatHeight,
      y: height / 6,
      r0: -90,
      color: "#b2e6ce",
      id: 9,
      visible: null,
    },
    {
      x: width / 2 + boatHeight,
      y: (height * 4.5) / 6,
      r0: -90,
      color: "#b2e6ce",
      id: 10,
      visible: null,
    },
  ];
};

export const getGreenDefensiveFormation = (width, height) => {
  const boatHeight = min([width, height]) / 4;
  return [
    {
      x: width / 2-0.1*boatHeight,
      y: height / 2,
      r0: 90,
      color: "#e6ceb2",
      id: 1,
      visible: null,
    },
    {
      x: (width * 2) / 9,
      y: (height * 2) / 5,
      r0: 100,
      color: "#e6ceb2",
      id: 2,
      visible: null,
    },
    {
      x: (width * 3) / 9,
      y: (height * 3) / 5,
      r0: 80,
      color: "#e6ceb2",
      id: 3,
      visible: null,
    },
    {
      x: (width * 4) / 9,
      y: (height * 3) / 10,
      r0: 85,
      color: "#e6ceb2",
      id: 4,
      visible: null,
    },
    {
      x: (width * 4) / 9,
      y: (height * 7) / 10,
      r0: 95,
      color: "#e6ceb2",
      id: 5,
      visible: null,
    },

    {
      x: width - 0.2*boatHeight,
      y: height / 2,
      r0: -90,
      color: "#b2e6ce",
      id: 6,
      visible: null,
    },
    {
      x: width/2 + boatHeight*1.4,
      y: height / 3,
      r0: -110,
      color: "#b2e6ce",
      id: 7,
      visible: null,
    },
    {
      x: width / 2 + 1.4*boatHeight,
      y: height / 2+0.8*boatHeight,
      r0: -60,
      color: "#b2e6ce",
      id: 8,
      visible: null,
    },
    {
      x: width - boatHeight,
      y: height *2.5/ 6,
      r0: -140,
      color: "#b2e6ce",
      id: 9,
      visible: null,
    },
    {
      x: width - boatHeight,
      y: (height * 3.5) / 6,
      r0: -50,
      color: "#b2e6ce",
      id: 10,
      visible: null,
    },
  ];
};

export const initialStateDict = {
  Kickoff: getInitialBoatStateKickoff,
  Even: getInitialBoatState,
  "Post Orange Goal": getOrangeDefensiveFormation,
  "Post Green Goal": getGreenDefensiveFormation,
};
