//This is included as a dev tool to do bulk billet list entries. run this outside of cavApps.
let countString = "";
let i = 629;
let stopper = 644;

do {
  countString = `${countString},'${i}'`;
  i++;
} while (i <= stopper);

console.log(countString);
