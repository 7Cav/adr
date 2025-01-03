export default function GetCoordArray(numAwards) {
  let c1 = 493;
  let c2 = 537;
  let c3 = 581;
  let c4 = 625;

  let r1 = 287;
  let r2 = 273;
  let r3 = 259;
  let r4 = 245;
  let r5 = 231;
  let r6 = 217;
  let r7 = 203;
  let r8 = 189;
  let r9 = 175;
  let r10 = 161;
  let r11 = 147;
  let r12 = 133;
  let r13 = 119;

  switch (numAwards) {
    case 30:
      return [
        // {
        //dx: c3,
        //dy: r13,
        //},
        {
          dx: c4,
          dy: r13,
        },
        {
          dx: c3,
          dy: r12,
        },
        {
          dx: c4,
          dy: r12,
        },
        {
          dx: c3,
          dy: r11,
        },
        {
          dx: c4,
          dy: r11,
        },
        {
          dx: c3,
          dy: r10,
        },
        {
          dx: c4,
          dy: r10,
        },
        {
          dx: c3,
          dy: r9,
        },
        {
          dx: c4,
          dy: r9,
        },
        {
          dx: c3,
          dy: r8,
        },
        {
          dx: c4,
          dy: r8,
        },
        {
          dx: c3,
          dy: r7,
        },
        {
          dx: c4,
          dy: r7,
        },
        {
          dx: c3,
          dy: r6,
        },
        {
          dx: c4,
          dy: r6,
        },
        {
          dx: c3,
          dy: r5,
        },
        {
          dx: c4,
          dy: r5,
        },
      ];
  }
}
