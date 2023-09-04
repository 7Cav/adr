//This is included to generate arrays for large ammounts of billets. This is otherwise unused in the final product

let countString = "";
let i = 629;
let stopper = 644;

do {
  countString = `${countString},'${i}'`;
  i++;
} while (i <= stopper);

console.log(countString);
