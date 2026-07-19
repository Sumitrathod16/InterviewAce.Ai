import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, 'problems.json');
const rawData = fs.readFileSync(jsonPath, 'utf8');
const baseProblems = JSON.parse(rawData).slice(0, 9);

const categories = ['Arrays', 'Strings', 'Algorithms', 'Math', 'Dynamic Programming', 'Recursion', 'Sorting', 'Search', 'Bit Manipulation'];
const difficulties = ['Easy', 'Medium', 'Hard'];

const generatedProblems = [...baseProblems];
const countToGenerate = 1000 - baseProblems.length;

console.log(`Starting generation of ${countToGenerate} coding problems...`);

for (let i = 1; i <= countToGenerate; i++) {
  const category = categories[i % categories.length];
  const difficulty = difficulties[i % difficulties.length];
  const problemNumber = i + baseProblems.length;
  
  const templateIndex = i % 5;
  let title = '';
  let problemId = '';
  let description = '';
  let jsCode = '';
  let pyCode = '';
  let javaCode = '';
  let tests = [];

  if (templateIndex === 0) {
    problemId = `array_multiply_${i}`;
    title = `${problemNumber}. Multiply Array Elements by ${i + 1}`;
    description = `Given an array of integers nums and an integer multiplier, return a new array where each element is multiplied by ${i + 1}.\n\nConstraints:\n- nums length is between 0 and 1000.\n- Elements are standard integers.`;
    jsCode = `function multiplyArray(nums) {\n  // Write your code here\n}`;
    pyCode = `def multiplyArray(nums):\n    # Write your code here\n    pass`;
    javaCode = `class Solution {\n    public int[] multiplyArray(int[] nums) {\n        // Write your code here\n        return new int[0];\n    }\n}`;
    tests = [
      { input: `[1, 2, 3]`, expected: `[${1 * (i + 1)},${2 * (i + 1)},${3 * (i + 1)}]` },
      { input: `[0, -1]`, expected: `[0,${-1 * (i + 1)}]` }
    ];
  } else if (templateIndex === 1) {
    problemId = `string_repeat_${i}`;
    title = `${problemNumber}. Repeat String ${i + 2} Times`;
    description = `Given a string s, return a new string that repeats s exactly ${i + 2} times.\n\nConstraints:\n- String length is between 1 and 100.`;
    jsCode = `function repeatString(s) {\n  // Write your code here\n}`;
    pyCode = `def repeatString(s):\n    # Write your code here\n    pass`;
    javaCode = `class Solution {\n    public String repeatString(String s) {\n        // Write your code here\n        return "";\n    }\n}`;
    tests = [
      { input: `"abc"`, expected: `"${"abc".repeat(i + 2)}"` },
      { input: `"a"`, expected: `"${"a".repeat(i + 2)}"` }
    ];
  } else if (templateIndex === 2) {
    problemId = `math_power_${i}`;
    title = `${problemNumber}. Power of ${i + 2}`;
    description = `Given an integer n, return the value of n raised to the power of ${i + 2}.\n\nConstraints:\n- n is a positive integer between 1 and 10.`;
    jsCode = `function powerOf(n) {\n  // Write your code here\n}`;
    pyCode = `def powerOf(n):\n    # Write your code here\n    pass`;
    javaCode = `class Solution {\n    public int powerOf(int n) {\n        // Write your code here\n        return 0;\n    }\n}`;
    tests = [
      { input: `2`, expected: `${Math.pow(2, i + 2)}` },
      { input: `3`, expected: `${Math.pow(3, i + 2)}` }
    ];
  } else if (templateIndex === 3) {
    problemId = `array_filter_greater_${i}`;
    title = `${problemNumber}. Filter Numbers Greater Than ${i}`;
    description = `Given an array of integers nums, return a new array containing only the numbers strictly greater than ${i}.\n\nConstraints:\n- nums length is between 0 and 1000.`;
    jsCode = `function filterGreater(nums) {\n  // Write your code here\n}`;
    pyCode = `def filterGreater(nums):\n    # Write your code here\n    pass`;
    javaCode = `import java.util.ArrayList;\nimport java.util.List;\nclass Solution {\n    public List<Integer> filterGreater(int[] nums) {\n        // Write your code here\n        return new ArrayList<>();\n    }\n}`;
    tests = [
      { input: `[${i - 2}, ${i}, ${i + 2}, ${i + 5}]`, expected: `[${i + 2},${i + 5}]` }
    ];
  } else {
    problemId = `string_prefix_check_${i}`;
    title = `${problemNumber}. String Has Prefix Variant ${i}`;
    description = `Given a string s, return true if the string starts with the prefix "var${i}", or false otherwise.\n\nConstraints:\n- String length is between 1 and 500.`;
    jsCode = `function hasPrefix(s) {\n  // Write your code here\n}`;
    pyCode = `def hasPrefix(s):\n    # Write your code here\n    pass`;
    javaCode = `class Solution {\n    public boolean hasPrefix(String s) {\n        // Write your code here\n        return false;\n    }\n}`;
    tests = [
      { input: `"var${i}abc"`, expected: `true` },
      { input: `"abcvar${i}"`, expected: `false` }
    ];
  }

  generatedProblems.push({
    problemId,
    title,
    difficulty,
    description,
    category,
    starterCode: {
      javascript: jsCode,
      python: pyCode,
      java: javaCode
    },
    tests
  });
}

fs.writeFileSync(jsonPath, JSON.stringify(generatedProblems, null, 2));
console.log(`🎉 Successfully generated and wrote ${generatedProblems.length} problems to problems.json!`);
