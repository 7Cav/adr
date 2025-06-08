export default function GetCombatBadgeCoords(numAwards) {
  switch (numAwards) {
    case 1:
    case 2:
    case 3:
      return {
        //1
        dx: 530,
        dy: 233,
      };
    case 4:
    case 5:
    case 6:
      return {
        //1
        dx: 530,
        dy: 219,
      };
    case 7:
    case 8:
    case 9:
      return {
        //1
        dx: 545,
        dy: 204,
      };
    case 10:
    case 11:
    case 12:
    case 13:
    case 14:
      return {
        //1
        dx: 560,
        dy: 190,
      };
    case 15:
    case 16:
    case 17:
      return {
        //1
        dx: 560,
        dy: 176,
      };
    case 18:
    case 19:
      return {
        //1
        dx: 570,
        dy: 162,
      };
    case 20:
    case 21:
      return {
        //1
        dx: 570,
        dy: 148,
      };
    case 22:
    case 23:
      return {
        //1
        dx: 580,
        dy: 133,
      };
    case 24:
    case 25:
      return {
        //1
        dx: 580,
        dy: 120,
      };
    case 26:
    case 27:
      return {
        //1
        dx: 580,
        dy: 106,
      };
    case 28:
    case 29:
      return {
        //1
        dx: 570,
        dy: 92,
      };
    case 30:
    case 31:
    case 32:
      return {
        //1
        dx: 535,
        dy: 75,
      };
    case 33:
    case 34:
    case 35:
      return {
        //1
        dx: 545,
        dy: 80,
      };
    default:
      return null;
  }
}
