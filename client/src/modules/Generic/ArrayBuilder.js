//This is included to generate arrays for large ammounts of billets. This is otherwise unused in the final product

let countString = '';
let i = 590;
let stopper = 626
 
do {
  countString = `${countString},'${i}'`;
  i++;
} while (i <= stopper);
 
console.log(countString)