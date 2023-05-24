const arr = [1, 5, 6, 9];
const valueToRemove = 6;
const newArr = arr.filter(item => item !== valueToRemove);

console.log(newArr); // Output: [1, 5, 9]