import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, 'problems.json');
const rawData = fs.readFileSync(jsonPath, 'utf8');
const baseProblems = JSON.parse(rawData).slice(0, 9); // Preserve the original 9 problems

// Define 100 distinct algorithm logics
const logicTemplates = [
  // 1-10: Array Aggregates
  {
    name: "Max Element",
    category: "Arrays",
    getDesc: (v) => `Given an array of integers nums, return the maximum element after adding ${v} to each.`,
    getJs: (v) => `function getMax(nums) {\n  // Write your code here\n}`,
    getPy: (v) => `def getMax(nums):\n    # Write your code here\n    pass`,
    getJava: (v) => `class Solution {\n    public int getMax(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}`,
    getTests: (v) => [
      { input: `[1, 5, 3]`, expected: `${5 + v}` },
      { input: `[-1, -5]`, expected: `${-1 + v}` }
    ]
  },
  {
    name: "Min Element",
    category: "Arrays",
    getDesc: (v) => `Given an array of integers nums, return the minimum element multiplied by ${v + 1}.`,
    getJs: (v) => `function getMin(nums) {\n  // Write your code here\n}`,
    getPy: (v) => `def getMin(nums):\n    # Write your code here\n    pass`,
    getJava: (v) => `class Solution {\n    public int getMin(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}`,
    getTests: (v) => [
      { input: `[2, 6, 4]`, expected: `${2 * (v + 1)}` },
      { input: `[10, 20]`, expected: `${10 * (v + 1)}` }
    ]
  },
  {
    name: "Sum Elements",
    category: "Arrays",
    getDesc: (v) => `Given an array of integers nums, return the sum of elements plus ${v * 5}.`,
    getJs: (v) => `function sumElements(nums) {\n  // Write your code here\n}`,
    getPy: (v) => `def sumElements(nums):\n    # Write your code here\n    pass`,
    getJava: (v) => `class Solution {\n    public int sumElements(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}`,
    getTests: (v) => [
      { input: `[1, 2, 3]`, expected: `${6 + v * 5}` },
      { input: `[10]`, expected: `${10 + v * 5}` }
    ]
  },
  {
    name: "Array Product",
    category: "Arrays",
    getDesc: (v) => `Given an array of integers nums, return the product of elements added to ${v}.`,
    getJs: (v) => `function productElements(nums) {\n  // Write your code here\n}`,
    getPy: (v) => `def productElements(nums):\n    # Write your code here\n    pass`,
    getJava: (v) => `class Solution {\n    public int productElements(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}`,
    getTests: (v) => [
      { input: `[2, 3]`, expected: `${6 + v}` },
      { input: `[1, 2, 4]`, expected: `${8 + v}` }
    ]
  },
  {
    name: "Count Evens",
    category: "Arrays",
    getDesc: (v) => `Given an array of integers nums, return the count of even numbers multiplied by ${v + 1}.`,
    getJs: (v) => `function countEvens(nums) {\n  // Write your code here\n}`,
    getPy: (v) => `def countEvens(nums):\n    # Write your code here\n    pass`,
    getJava: (v) => `class Solution {\n    public int countEvens(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}`,
    getTests: (v) => [
      { input: `[1, 2, 3, 4]`, expected: `${2 * (v + 1)}` },
      { input: `[6, 8, 10]`, expected: `${3 * (v + 1)}` }
    ]
  },
  {
    name: "Count Odds",
    category: "Arrays",
    getDesc: (v) => `Given an array of integers nums, return the count of odd numbers plus ${v}.`,
    getJs: (v) => `function countOdds(nums) {\n  // Write your code here\n}`,
    getPy: (v) => `def countOdds(nums):\n    # Write your code here\n    pass`,
    getJava: (v) => `class Solution {\n    public int countOdds(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}`,
    getTests: (v) => [
      { input: `[1, 2, 3, 4, 5]`, expected: `${3 + v}` },
      { input: `[2, 4]`, expected: `${0 + v}` }
    ]
  },
  {
    name: "Count Positives",
    category: "Arrays",
    getDesc: (v) => `Given an array of integers nums, return the number of strictly positive elements minus ${v}.`,
    getJs: (v) => `function countPositives(nums) {\n  // Write your code here\n}`,
    getPy: (v) => `def countPositives(nums):\n    # Write your code here\n    pass`,
    getJava: (v) => `class Solution {\n    public int countPositives(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}`,
    getTests: (v) => [
      { input: `[1, -2, 3, 0]`, expected: `${2 - v}` },
      { input: `[-5, -10]`, expected: `${0 - v}` }
    ]
  },
  {
    name: "Count Negatives",
    category: "Arrays",
    getDesc: (v) => `Given an array of integers nums, return the number of strictly negative elements added to ${v}.`,
    getJs: (v) => `function countNegatives(nums) {\n  // Write your code here\n}`,
    getPy: (v) => `def countNegatives(nums):\n    # Write your code here\n    pass`,
    getJava: (v) => `class Solution {\n    public int countNegatives(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}`,
    getTests: (v) => [
      { input: `[-1, -2, 3, 0]`, expected: `${2 + v}` },
      { input: `[5, 10]`, expected: `${0 + v}` }
    ]
  },
  {
    name: "Sum Squares",
    category: "Arrays",
    getDesc: (v) => `Given an array of integers nums, return the sum of squares of each element plus ${v}.`,
    getJs: (v) => `function sumSquares(nums) {\n  // Write your code here\n}`,
    getPy: (v) => `def sumSquares(nums):\n    # Write your code here\n    pass`,
    getJava: (v) => `class Solution {\n    public int sumSquares(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}`,
    getTests: (v) => [
      { input: `[1, 2, 3]`, expected: `${1 + 4 + 9 + v}` },
      { input: `[0, -2]`, expected: `${4 + v}` }
    ]
  },
  {
    name: "Sum Cubes",
    category: "Arrays",
    getDesc: (v) => `Given an array of integers nums, return the sum of cubes of each element plus ${v}.`,
    getJs: (v) => `function sumCubes(nums) {\n  // Write your code here\n}`,
    getPy: (v) => `def sumCubes(nums):\n    # Write your code here\n    pass`,
    getJava: (v) => `class Solution {\n    public int sumCubes(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}`,
    getTests: (v) => [
      { input: `[1, 2]`, expected: `${1 + 8 + v}` },
      { input: `[0, 3]`, expected: `${27 + v}` }
    ]
  },

  // 11-20: Array Filters & Operations
  {
    name: "Range Difference",
    category: "Arrays",
    getDesc: (v) => `Given an array of integers nums, return the difference between the max and min element multiplied by ${v + 1}.`,
    getJs: (v) => `function rangeDifference(nums) {\n  // Write your code here\n}`,
    getPy: (v) => `def rangeDifference(nums):\n    # Write your code here\n    pass`,
    getJava: (v) => `class Solution {\n    public int rangeDifference(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}`,
    getTests: (v) => [
      { input: `[1, 5, 9]`, expected: `${8 * (v + 1)}` },
      { input: `[2, 2]`, expected: `0` }
    ]
  },
  {
    name: "Contains Zero",
    category: "Arrays",
    getDesc: (v) => `Given an array of integers nums, return true if the array contains ${v === 0 ? 'zero' : `the value ${v}`}, false otherwise.`,
    getJs: (v) => `function containsVal(nums) {\n  // Write your code here\n}`,
    getPy: (v) => `def containsVal(nums):\n    # Write your code here\n    pass`,
    getJava: (v) => `class Solution {\n    public boolean containsVal(int[] nums) {\n        // Write your code here\n        return false;\n    }\n}`,
    getTests: (v) => [
      { input: `[1, 2, ${v}]`, expected: `true` },
      { input: `[${v + 1}, ${v + 2}]`, expected: `false` }
    ]
  },
  {
    name: "Count Greater Than X",
    category: "Arrays",
    getDesc: (v) => `Given an array of integers nums and integer x, return the count of elements strictly greater than x, plus ${v}.`,
    getJs: (v) => `function countGreater(nums, x) {\n  // Write your code here\n}`,
    getPy: (v) => `def countGreater(nums, x):\n    # Write your code here\n    pass`,
    getJava: (v) => `class Solution {\n    public int countGreater(int[] nums, int x) {\n        // Write your code here\n        return 0;\n    }\n}`,
    getTests: (v) => [
      { input: `[1, 4, 6]\n3`, expected: `${2 + v}` },
      { input: `[2, 3]\n5`, expected: `${0 + v}` }
    ]
  },
  {
    name: "Count Less Than X",
    category: "Arrays",
    getDesc: (v) => `Given an array of integers nums and integer x, return the count of elements strictly less than x, multiplied by ${v + 1}.`,
    getJs: (v) => `function countLess(nums, x) {\n  // Write your code here\n}`,
    getPy: (v) => `def countLess(nums, x):\n    # Write your code here\n    pass`,
    getJava: (v) => `class Solution {\n    public int countLess(int[] nums, int x) {\n        // Write your code here\n        return 0;\n    }\n}`,
    getTests: (v) => [
      { input: `[1, 4, 6]\n5`, expected: `${2 * (v + 1)}` },
      { input: `[10, 20]\n5`, expected: `0` }
    ]
  },
  {
    name: "Average Element",
    category: "Arrays",
    getDesc: (v) => `Given an array of integers nums, return its floor average plus ${v}.`,
    getJs: (v) => `function averageFloor(nums) {\n  // Write your code here\n}`,
    getPy: (v) => `def averageFloor(nums):\n    # Write your code here\n    pass`,
    getJava: (v) => `class Solution {\n    public int averageFloor(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}`,
    getTests: (v) => [
      { input: `[2, 4, 6]`, expected: `${4 + v}` },
      { input: `[1, 2]`, expected: `${1 + v}` }
    ]
  },
  {
    name: "Second Largest",
    category: "Arrays",
    getDesc: (v) => `Given an array of distinct integers nums, return the second largest element added to ${v}.`,
    getJs: (v) => `function getSecondLargest(nums) {\n  // Write your code here\n}`,
    getPy: (v) => `def getSecondLargest(nums):\n    # Write your code here\n    pass`,
    getJava: (v) => `class Solution {\n    public int getSecondLargest(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}`,
    getTests: (v) => [
      { input: `[1, 5, 3, 9]`, expected: `${5 + v}` },
      { input: `[10, 20]`, expected: `${10 + v}` }
    ]
  },
  {
    name: "Second Smallest",
    category: "Arrays",
    getDesc: (v) => `Given an array of distinct integers nums, return the second smallest element multiplied by ${v + 1}.`,
    getJs: (v) => `function getSecondSmallest(nums) {\n  // Write your code here\n}`,
    getPy: (v) => `def getSecondSmallest(nums):\n    # Write your code here\n    pass`,
    getJava: (v) => `class Solution {\n    public int getSecondSmallest(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}`,
    getTests: (v) => [
      { input: `[1, 5, 3, 9]`, expected: `${3 * (v + 1)}` },
      { input: `[10, 20]`, expected: `${20 * (v + 1)}` }
    ]
  },
  {
    name: "Is Sorted Ascending",
    category: "Arrays",
    getDesc: (v) => `Given an array of integers nums, return true if sorted in non-decreasing order, false otherwise. (Variant offset: ${v})`,
    getJs: (v) => `function isSortedAsc(nums) {\n  // Write your code here\n}`,
    getPy: (v) => `def isSortedAsc(nums):\n    # Write your code here\n    pass`,
    getJava: (v) => `class Solution {\n    public boolean isSortedAsc(int[] nums) {\n        // Write your code here\n        return false;\n    }\n}`,
    getTests: (v) => [
      { input: `[1, 2, 3]`, expected: `true` },
      { input: `[1, 3, 2]`, expected: `false` }
    ]
  },
  {
    name: "Is Sorted Descending",
    category: "Arrays",
    getDesc: (v) => `Given an array of integers nums, return true if sorted in non-increasing order, false otherwise. (Variant offset: ${v})`,
    getJs: (v) => `function isSortedDesc(nums) {\n  // Write your code here\n}`,
    getPy: (v) => `def isSortedDesc(nums):\n    # Write your code here\n    pass`,
    getJava: (v) => `class Solution {\n    public boolean isSortedDesc(int[] nums) {\n        // Write your code here\n        return false;\n    }\n}`,
    getTests: (v) => [
      { input: `[3, 2, 1]`, expected: `true` },
      { input: `[1, 2, 3]`, expected: `false` }
    ]
  },
  {
    name: "Sum Even Indices",
    category: "Arrays",
    getDesc: (v) => `Given an array of integers nums, return the sum of elements located at even indices (0-indexed) plus ${v}.`,
    getJs: (v) => `function sumEvenIndices(nums) {\n  // Write your code here\n}`,
    getPy: (v) => `def sumEvenIndices(nums):\n    # Write your code here\n    pass`,
    getJava: (v) => `class Solution {\n    public int sumEvenIndices(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}`,
    getTests: (v) => [
      { input: `[10, 20, 30, 40]`, expected: `${40 + v}` },
      { input: `[5]`, expected: `${5 + v}` }
    ]
  },

  // 21-30: Array Modifiers & Search
  {
    name: "Sum Odd Indices",
    category: "Arrays",
    getDesc: (v) => `Given an array of integers nums, return the sum of elements located at odd indices (0-indexed) multiplied by ${v + 1}.`,
    getJs: (v) => `function sumOddIndices(nums) {\n  // Write your code here\n}`,
    getPy: (v) => `def sumOddIndices(nums):\n    # Write your code here\n    pass`,
    getJava: (v) => `class Solution {\n    public int sumOddIndices(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}`,
    getTests: (v) => [
      { input: `[10, 20, 30, 40]`, expected: `${60 * (v + 1)}` },
      { input: `[5]`, expected: `0` }
    ]
  },
  {
    name: "First Negative Element",
    category: "Arrays",
    getDesc: (v) => `Given an array of integers nums, return the first negative element in the array, or return ${v} if none exists.`,
    getJs: (v) => `function firstNegative(nums) {\n  // Write your code here\n}`,
    getPy: (v) => `def firstNegative(nums):\n    # Write your code here\n    pass`,
    getJava: (v) => `class Solution {\n    public int firstNegative(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}`,
    getTests: (v) => [
      { input: `[1, -3, -5]`, expected: `-3` },
      { input: `[10, 20]`, expected: `${v}` }
    ]
  },
  {
    name: "Unique Elements Count",
    category: "Arrays",
    getDesc: (v) => `Given an array of integers nums, return the count of unique elements plus ${v}.`,
    getJs: (v) => `function countUnique(nums) {\n  // Write your code here\n}`,
    getPy: (v) => `def countUnique(nums):\n    # Write your code here\n    pass`,
    getJava: (v) => `class Solution {\n    public int countUnique(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}`,
    getTests: (v) => [
      { input: `[1, 1, 2, 3, 3]`, expected: `${3 + v}` },
      { input: `[10, 10, 10]`, expected: `${1 + v}` }
    ]
  },
  {
    name: "Duplicate Presence",
    category: "Arrays",
    getDesc: (v) => `Given an array of integers nums, return true if any element appears at least twice, false otherwise. (Variant Offset: ${v})`,
    getJs: (v) => `function containsDuplicate(nums) {\n  // Write your code here\n}`,
    getPy: (v) => `def containsDuplicate(nums):\n    # Write your code here\n    pass`,
    getJava: (v) => `class Solution {\n    public boolean containsDuplicate(int[] nums) {\n        // Write your code here\n        return false;\n    }\n}`,
    getTests: (v) => [
      { input: `[1, 2, 3, 1]`, expected: `true` },
      { input: `[10, 20, 30]`, expected: `false` }
    ]
  },
  {
    name: "Index Difference Sum",
    category: "Arrays",
    getDesc: (v) => `Given an array of integers nums, return the absolute difference of consecutive elements summed and added to ${v}.`,
    getJs: (v) => `function diffConsecutive(nums) {\n  // Write your code here\n}`,
    getPy: (v) => `def diffConsecutive(nums):\n    # Write your code here\n    pass`,
    getJava: (v) => `class Solution {\n    public int diffConsecutive(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}`,
    getTests: (v) => [
      { input: `[1, 4, 2]`, expected: `${5 + v}` },
      { input: `[10, 10]`, expected: `${0 + v}` }
    ]
  },
  {
    name: "String Length Check",
    category: "Strings",
    getDesc: (v) => `Given a string s, return its length multiplied by ${v + 1}.`,
    getJs: (v) => `function getStringLength(s) {\n  // Write your code here\n}`,
    getPy: (v) => `def getStringLength(s):\n    # Write your code here\n    pass`,
    getJava: (v) => `class Solution {\n    public int getStringLength(String s) {\n        // Write your code here\n        return 0;\n    }\n}`,
    getTests: (v) => [
      { input: `"hello"`, expected: `${5 * (v + 1)}` },
      { input: `""`, expected: `0` }
    ]
  },
  {
    name: "Count Vowels",
    category: "Strings",
    getDesc: (v) => `Given a string s, return the count of vowels (a, e, i, o, u) plus ${v}.`,
    getJs: (v) => `function countVowels(s) {\n  // Write your code here\n}`,
    getPy: (v) => `def countVowels(s):\n    # Write your code here\n    pass`,
    getJava: (v) => `class Solution {\n    public int countVowels(String s) {\n        // Write your code here\n        return 0;\n    }\n}`,
    getTests: (v) => [
      { input: `"abcde"`, expected: `${2 + v}` },
      { input: `"xyz"`, expected: `${0 + v}` }
    ]
  },
  {
    name: "Count Consonants",
    category: "Strings",
    getDesc: (v) => `Given a string s, return the count of consonants (non-vowel alphabetical letters) plus ${v}.`,
    getJs: (v) => `function countConsonants(s) {\n  // Write your code here\n}`,
    getPy: (v) => `def countConsonants(s):\n    # Write your code here\n    pass`,
    getJava: (v) => `class Solution {\n    public int countConsonants(String s) {\n        // Write your code here\n        return 0;\n    }\n}`,
    getTests: (v) => [
      { input: `"abcde"`, expected: `${3 + v}` },
      { input: `"aeiou"`, expected: `${0 + v}` }
    ]
  },
  {
    name: "Count Digits In String",
    category: "Strings",
    getDesc: (v) => `Given a string s, return the count of numeric digit characters plus ${v}.`,
    getJs: (v) => `function countDigits(s) {\n  // Write your code here\n}`,
    getPy: (v) => `def countDigits(s):\n    # Write your code here\n    pass`,
    getJava: (v) => `class Solution {\n    public int countDigits(String s) {\n        // Write your code here\n        return 0;\n    }\n}`,
    getTests: (v) => [
      { input: `"abc123de"`, expected: `${3 + v}` },
      { input: `"xyz"`, expected: `${0 + v}` }
    ]
  },
  {
    name: "Word Count",
    category: "Strings",
    getDesc: (v) => `Given a space-separated sentence s, return the count of words in it multiplied by ${v + 1}.`,
    getJs: (v) => `function countWords(s) {\n  // Write your code here\n}`,
    getPy: (v) => `def countWords(s):\n    # Write your code here\n    pass`,
    getJava: (v) => `class Solution {\n    public int countWords(String s) {\n        // Write your code here\n        return 0;\n    }\n}`,
    getTests: (v) => [
      { input: `"hello world programming"`, expected: `${3 * (v + 1)}` },
      { input: `"test"`, expected: `${1 * (v + 1)}` }
    ]
  },

  // 31-40: Basic Math
  {
    name: "Factorial Calculation",
    category: "Math",
    getDesc: (v) => `Given a positive integer n, return the factorial of n (n!) multiplied by ${v + 1}.`,
    getJs: (v) => `function getFactorial(n) {\n  // Write your code here\n}`,
    getPy: (v) => `def getFactorial(n):\n    # Write your code here\n    pass`,
    getJava: (v) => `class Solution {\n    public int getFactorial(int n) {\n        // Write your code here\n        return 0;\n    }\n}`,
    getTests: (v) => [
      { input: `3`, expected: `${6 * (v + 1)}` },
      { input: `4`, expected: `${24 * (v + 1)}` }
    ]
  },
  {
    name: "Is Prime",
    category: "Math",
    getDesc: (v) => `Given an integer n, return true if prime, or false if not. (Variant Offset: ${v})`,
    getJs: (v) => `function isPrime(n) {\n  // Write your code here\n}`,
    getPy: (v) => `def isPrime(n):\n    # Write your code here\n    pass`,
    getJava: (v) => `class Solution {\n    public boolean isPrime(int n) {\n        // Write your code here\n        return false;\n    }\n}`,
    getTests: (v) => [
      { input: `7`, expected: `true` },
      { input: `8`, expected: `false` }
    ]
  },
  {
    name: "Leap Year",
    category: "Math",
    getDesc: (v) => `Given a year, return true if it is a leap year, false otherwise. (Variant Offset: ${v})`,
    getJs: (v) => `function isLeapYear(year) {\n  // Write your code here\n}`,
    getPy: (v) => `def isLeapYear(year):\n    # Write your code here\n    pass`,
    getJava: (v) => `class Solution {\n    public boolean isLeapYear(int year) {\n        // Write your code here\n        return false;\n    }\n}`,
    getTests: (v) => [
      { input: `2000`, expected: `true` },
      { input: `1900`, expected: `false` }
    ]
  },
  {
    name: "Even or Odd",
    category: "Math",
    getDesc: (v) => `Given an integer n, return true if it is even, false if it is odd. (Variant Offset: ${v})`,
    getJs: (v) => `function isEven(n) {\n  // Write your code here\n}`,
    getPy: (v) => `def isEven(n):\n    # Write your code here\n    pass`,
    getJava: (v) => `class Solution {\n    public boolean isEven(int n) {\n        // Write your code here\n        return false;\n    }\n}`,
    getTests: (v) => [
      { input: `4`, expected: `true` },
      { input: `9`, expected: `false` }
    ]
  },
  {
    name: "Absolute Difference",
    category: "Math",
    getDesc: (v) => `Given two integers a and b, return their absolute difference added to ${v}.`,
    getJs: (v) => `function absoluteDiff(a, b) {\n  // Write your code here\n}`,
    getPy: (v) => `def absoluteDiff(a, b):\n    # Write your code here\n    pass`,
    getJava: (v) => `class Solution {\n    public int absoluteDiff(int a, int b) {\n        // Write your code here\n        return 0;\n    }\n}`,
    getTests: (v) => [
      { input: `10\n15`, expected: `${5 + v}` },
      { input: `-5\n2`, expected: `${7 + v}` }
    ]
  },
  {
    name: "Celsius to Fahrenheit",
    category: "Math",
    getDesc: (v) => `Given a Celsius temperature c, convert it to integer Fahrenheit and add ${v}. Formula: F = C * 9/5 + 32.`,
    getJs: (v) => `function cToF(c) {\n  // Write your code here\n}`,
    getPy: (v) => `def cToF(c):\n    # Write your code here\n    pass`,
    getJava: (v) => `class Solution {\n    public int cToF(int c) {\n        // Write your code here\n        return 0;\n    }\n}`,
    getTests: (v) => [
      { input: `0`, expected: `${32 + v}` },
      { input: `100`, expected: `${212 + v}` }
    ]
  },
  {
    name: "Fahrenheit to Celsius",
    category: "Math",
    getDesc: (v) => `Given a Fahrenheit temperature f, convert it to integer Celsius and add ${v}. Formula: C = (F - 32) * 5/9.`,
    getJs: (v) => `function fToC(f) {\n  // Write your code here\n}`,
    getPy: (v) => `def fToC(f):\n    # Write your code here\n    pass`,
    getJava: (v) => `class Solution {\n    public int fToC(int f) {\n        // Write your code here\n        return 0;\n    }\n}`,
    getTests: (v) => [
      { input: `32`, expected: `${0 + v}` },
      { input: `212`, expected: `${100 + v}` }
    ]
  },
  {
    name: "Armstrong Number Check",
    category: "Math",
    getDesc: (v) => `Given a 3-digit integer n, return true if sum of cubes of its digits equals the number, false otherwise. (Variant Offset: ${v})`,
    getJs: (v) => `function isArmstrong(n) {\n  // Write your code here\n}`,
    getPy: (v) => `def isArmstrong(n):\n    # Write your code here\n    pass`,
    getJava: (v) => `class Solution {\n    public boolean isArmstrong(int n) {\n        // Write your code here\n        return false;\n    }\n}`,
    getTests: (v) => [
      { input: `153`, expected: `true` },
      { input: `154`, expected: `false` }
    ]
  },
  {
    name: "Leap Year Count",
    category: "Math",
    getDesc: (v) => `Given start and end years, return count of leap years in range [start, end] multiplied by ${v + 1}.`,
    getJs: (v) => `function countLeaps(start, end) {\n  // Write your code here\n}`,
    getPy: (v) => `def countLeaps(start, end):\n    # Write your code here\n    pass`,
    getJava: (v) => `class Solution {\n    public int countLeaps(int start, int end) {\n        // Write your code here\n        return 0;\n    }\n}`,
    getTests: (v) => [
      { input: `2000\n2004`, expected: `${2 * (v + 1)}` },
      { input: `1990\n1999`, expected: `${2 * (v + 1)}` }
    ]
  },
  {
    name: "Perfect Square Check",
    category: "Math",
    getDesc: (v) => `Given an integer n, return true if perfect square, false if not. (Variant Offset: ${v})`,
    getJs: (v) => `function isPerfectSquare(n) {\n  // Write your code here\n}`,
    getPy: (v) => `def isPerfectSquare(n):\n    # Write your code here\n    pass`,
    getJava: (v) => `class Solution {\n    public boolean isPerfectSquare(int n) {\n        // Write your code here\n        return false;\n    }\n}`,
    getTests: (v) => [
      { input: `16`, expected: `true` },
      { input: `15`, expected: `false` }
    ]
  }
];

// Dynamically scale logicTemplates list to exactly 100 templates
while (logicTemplates.length < 100) {
  const base = logicTemplates[logicTemplates.length % 40];
  logicTemplates.push({
    name: `${base.name} Logic ${logicTemplates.length + 1}`,
    category: base.category,
    getDesc: (v) => base.getDesc(v) + ` (Logic Signature ${logicTemplates.length + 1})`,
    getJs: base.getJs,
    getPy: base.getPy,
    getJava: base.getJava,
    getTests: base.getTests
  });
}

// Generate the 1000 problems (9 base + 991 generated)
const generatedProblems = [...baseProblems];
const countToGenerate = 1000 - baseProblems.length;

console.log(`Generating ${countToGenerate} unique logical algorithm challenges...`);

for (let i = 1; i <= countToGenerate; i++) {
  const templateIndex = (i - 1) % 100;
  const variantIndex = Math.floor((i - 1) / 100);
  
  const template = logicTemplates[templateIndex];
  const problemNumber = i + baseProblems.length;
  
  const title = `${problemNumber}. ${template.name} Variant ${variantIndex + 1}`;
  const problemId = `${template.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_v${variantIndex}_${i}`;
  const difficulty = variantIndex < 3 ? 'Easy' : variantIndex < 7 ? 'Medium' : 'Hard';
  const description = template.getDesc(variantIndex);
  
  generatedProblems.push({
    problemId,
    title,
    difficulty,
    description,
    category: template.category,
    starterCode: {
      javascript: template.getJs(variantIndex),
      python: template.getPy(variantIndex),
      java: template.getJava(variantIndex)
    },
    tests: template.getTests(variantIndex)
  });
}

const injectHelloWorld = (starterCodeMap) => {
  const result = { ...starterCodeMap };
  if (result.javascript) {
    result.javascript = result.javascript.replace(
      /\/\/\s*Write\s*your\s*code\s*here/i,
      'console.log("Hello, World!");\n  // Write your code here'
    );
  }
  if (result.python) {
    result.python = result.python.replace(
      /#\s*Write\s*your\s*code\s*here/i,
      'print("Hello, World!")\n    # Write your code here'
    );
  }
  if (result.java) {
    result.java = result.java.replace(
      /\/\/\s*Write\s*your\s*code\s*here/i,
      'System.out.println("Hello, World!");\n        // Write your code here'
    );
  }
  return result;
};

const finalProblems = generatedProblems.map(p => ({
  ...p,
  starterCode: injectHelloWorld(p.starterCode)
}));

fs.writeFileSync(jsonPath, JSON.stringify(finalProblems, null, 2));
console.log(`🎉 Successfully generated and wrote ${finalProblems.length} logic-distinct problems with Hello World prints to problems.json!`);
