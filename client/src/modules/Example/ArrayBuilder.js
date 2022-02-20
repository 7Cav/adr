let countString = '';
let i = 227;
let stopper = 285
 
do {
  countString = `${countString},'${i}'`;
  i++;
} while (i <= stopper);
 
console.log(countString)