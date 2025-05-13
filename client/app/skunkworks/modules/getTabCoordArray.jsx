export default function GetYearsInServiceCoordArray(numAwards) {
  let dx = 717;

  switch (numAwards) {
    case 1:
      return [
        {
          //1
          dx: dx,
          dy: 145,
        },
      ];
    case 2:
      return [
        {
          //1
          dx: dx,
          dy: 145,
        },
        {
          //2
          dx: dx,
          dy: 174,
        },
      ];
    case 3:
      return [
        {
          //1
          dx: dx,
          dy: 145,
        },
        {
          //2
          dx: dx,
          dy: 174,
        },
        {
          //3
          dx: dx,
          dy: 204,
        },
      ];
    case 4:
      return [
        {
          //1
          dx: dx,
          dy: 145,
        },
        {
          //2
          dx: dx,
          dy: 174,
        },
        {
          //3
          dx: dx,
          dy: 204,
        },
        {
          //4
          dx: dx,
          dy: 234,
        },
      ];
    default:
      return null;
  }
}
