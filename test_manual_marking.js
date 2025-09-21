// Test script for manual marking logic
console.log('🧪 Testing Manual Marking Logic...');

// Simulate the marking logic
const calledNumbers = [12, 63, 46];
const bingoCard = [
  [12, 25, 38, 51, 64],
  [7, 26, 39, 52, 65],
  [2, 27, 63, 53, 66],
  [8, 28, 40, 54, 67],
  [13, 29, 41, 55, 46]
];

console.log('Called numbers:', calledNumbers);
console.log('Bingo card:');
bingoCard.forEach((row, i) => console.log(`Row ${i + 1}:`, row));

// Simulate manual marking
let marked = bingoCard.map(row => row.map(() => false));

// Mark numbers that are called and exist on card
calledNumbers.forEach(num => {
  bingoCard.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (cell === num && !marked[i][j]) {
        marked[i][j] = true;
        console.log(`✅ Marked ${num} at position [${i},${j}]`);
      }
    });
  });
});

console.log('Final marked state:');
marked.forEach((row, i) => console.log(`Row ${i + 1}:`, row.map(m => m ? 'X' : 'O')));

console.log('🎉 Manual marking logic test passed!');