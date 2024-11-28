//This is included as a dev tool to generate bulk billet list entries in sequential order. run this outside of cavApps.
let countString = "";
let i = 629;
let stopper = 644;

do {
  countString = `${countString},'${i}'`;
  i++;
} while (i <= stopper);

console.log(countString);
