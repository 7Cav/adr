export default function GetCitationCoordArray(numAwards) {
  const c1 = 188;
  const c2 = 232;
  const c3 = 276;

  const c1Cen = 210;
  const c2Cen = 254;

  const r1 = 282;
  const r2 = 264;

  switch (numAwards) {
    case 1:
      return [
        {
          //1
          dx: c2,
          dy: r1,
        },
      ];
    case 2:
      return [
        {
          //2
          dx: c1Cen,
          dy: r1,
        },
        {
          //1
          dx: c2Cen,
          dy: r1,
        },
      ];
    case 3:
      return [
        {
          //3
          dx: c1,
          dy: r1,
        },
        {
          //2
          dx: c2,
          dy: r1,
        },
        {
          //1
          dx: c3,
          dy: r1,
        },
      ];
    case 4:
      return [
        {
          //4
          dx: c2,
          dy: r2,
        },
        {
          //3
          dx: c1,
          dy: r1,
        },
        {
          //2
          dx: c2,
          dy: r1,
        },
        {
          //1
          dx: c3,
          dy: r1,
        },
      ];
    case 5:
      return [
        {
          //5
          dx: c1Cen,
          dy: r2,
        },
        {
          //4
          dx: c2Cen,
          dy: r2,
        },
        {
          //3
          dx: c1,
          dy: r1,
        },
        {
          //2
          dx: c2,
          dy: r1,
        },
        {
          //1
          dx: c3,
          dy: r1,
        },
      ];
    case 6:
      return [
        {
          //6
          dx: c1,
          dy: r2,
        },
        {
          //5
          dx: c2,
          dy: r2,
        },
        {
          //4
          dx: c3,
          dy: r2,
        },
        {
          //3
          dx: c1,
          dy: r1,
        },
        {
          //2
          dx: c2,
          dy: r1,
        },
        {
          //1
          dx: c3,
          dy: r1,
        },
      ];
    default:
      return;
  }
}
