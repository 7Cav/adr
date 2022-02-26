//This is included to aid in development for large ammounts of billets. This is otherwise unused in the final product

let countString = '';
let i = 227;
let stopper = 285
 
do {
  countString = `${countString},'${i}'`;
  i++;
} while (i <= stopper);
 
console.log(countString)