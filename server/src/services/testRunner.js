/**
 * Test Runner service for Coding Sandbox
 * Generates language-specific test wrappers and parses compiler errors
 */

// Mapping of problems and their corresponding test runner code generators
const DRIVERS = {
  javascript: {
    twosum: `
// --- TEST DRIVER ---
const tests = [
  { nums: [2, 7, 11, 15], target: 9, expected: [0, 1] },
  { nums: [3, 2, 4], target: 6, expected: [1, 2] }
];
const results = [];
for (let i = 0; i < tests.length; i++) {
  try {
    const t = tests[i];
    const actual = twoSum(t.nums, t.target);
    const passed = Array.isArray(actual) && actual.length === 2 &&
      ((actual[0] === t.expected[0] && actual[1] === t.expected[1]) ||
       (actual[0] === t.expected[1] && actual[1] === t.expected[0]));
    results.push({ id: i, passed, actual: JSON.stringify(actual), expected: JSON.stringify(t.expected) });
  } catch (e) {
    results.push({ id: i, passed: false, actual: e.message, expected: JSON.stringify(tests[i].expected) });
  }
}
console.log('---TEST_RESULTS---' + JSON.stringify(results));
`,
    reversestring: `
// --- TEST DRIVER ---
const tests = [
  { s: ["h","e","l","l","o"], expected: ["o","l","l","e","h"] }
];
const results = [];
for (let i = 0; i < tests.length; i++) {
  try {
    const t = tests[i];
    const s_copy = [...t.s];
    reverseString(s_copy);
    const passed = JSON.stringify(s_copy) === JSON.stringify(t.expected);
    results.push({ id: i, passed, actual: JSON.stringify(s_copy), expected: JSON.stringify(t.expected) });
  } catch (e) {
    results.push({ id: i, passed: false, actual: e.message, expected: JSON.stringify(tests[i].expected) });
  }
}
console.log('---TEST_RESULTS---' + JSON.stringify(results));
`,
    palindrome: `
// --- TEST DRIVER ---
const tests = [
  { s: "A man, a plan, a canal: Panama", expected: true }
];
const results = [];
for (let i = 0; i < tests.length; i++) {
  try {
    const t = tests[i];
    const actual = isPalindrome(t.s);
    const passed = actual === t.expected;
    results.push({ id: i, passed, actual: JSON.stringify(actual), expected: JSON.stringify(t.expected) });
  } catch (e) {
    results.push({ id: i, passed: false, actual: e.message, expected: JSON.stringify(tests[i].expected) });
  }
}
console.log('---TEST_RESULTS---' + JSON.stringify(results));
`,
    fizzbuzz: `
// --- TEST DRIVER ---
const tests = [
  { n: 15, expected: ["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"] }
];
const results = [];
for (let i = 0; i < tests.length; i++) {
  try {
    const t = tests[i];
    const actual = fizzBuzz(t.n);
    const passed = JSON.stringify(actual) === JSON.stringify(t.expected);
    results.push({ id: i, passed, actual: JSON.stringify(actual), expected: JSON.stringify(t.expected) });
  } catch (e) {
    results.push({ id: i, passed: false, actual: e.message, expected: JSON.stringify(tests[i].expected) });
  }
}
console.log('---TEST_RESULTS---' + JSON.stringify(results));
`,
    fibonacci: `
// --- TEST DRIVER ---
const tests = [
  { n: 4, expected: 3 },
  { n: 2, expected: 1 }
];
const results = [];
for (let i = 0; i < tests.length; i++) {
  try {
    const t = tests[i];
    const actual = fib(t.n);
    const passed = actual === t.expected;
    results.push({ id: i, passed, actual: JSON.stringify(actual), expected: JSON.stringify(t.expected) });
  } catch (e) {
    results.push({ id: i, passed: false, actual: e.message, expected: JSON.stringify(tests[i].expected) });
  }
}
console.log('---TEST_RESULTS---' + JSON.stringify(results));
`,
    mergesorted: `
// --- TEST DRIVER ---
const tests = [
  { nums1: [1,2,3,0,0,0], m: 3, nums2: [2,5,6], n: 3, expected: [1,2,2,3,5,6] }
];
const results = [];
for (let i = 0; i < tests.length; i++) {
  try {
    const t = tests[i];
    const n1_copy = [...t.nums1];
    merge(n1_copy, t.m, t.nums2, t.n);
    const passed = JSON.stringify(n1_copy) === JSON.stringify(t.expected);
    results.push({ id: i, passed, actual: JSON.stringify(n1_copy), expected: JSON.stringify(t.expected) });
  } catch (e) {
    results.push({ id: i, passed: false, actual: e.message, expected: JSON.stringify(tests[i].expected) });
  }
}
console.log('---TEST_RESULTS---' + JSON.stringify(results));
`,
    binarysearch: `
// --- TEST DRIVER ---
const tests = [
  { nums: [-1,0,3,5,9,12], target: 9, expected: 4 },
  { nums: [-1,0,3,5,9,12], target: 2, expected: -1 }
];
const results = [];
for (let i = 0; i < tests.length; i++) {
  try {
    const t = tests[i];
    const actual = search(t.nums, t.target);
    const passed = actual === t.expected;
    results.push({ id: i, passed, actual: JSON.stringify(actual), expected: JSON.stringify(t.expected) });
  } catch (e) {
    results.push({ id: i, passed: false, actual: e.message, expected: JSON.stringify(tests[i].expected) });
  }
}
console.log('---TEST_RESULTS---' + JSON.stringify(results));
`,
    containsduplicate: `
// --- TEST DRIVER ---
const tests = [
  { nums: [1,2,3,1], expected: true },
  { nums: [1,2,3,4], expected: false }
];
const results = [];
for (let i = 0; i < tests.length; i++) {
  try {
    const t = tests[i];
    const actual = containsDuplicate(t.nums);
    const passed = actual === t.expected;
    results.push({ id: i, passed, actual: JSON.stringify(actual), expected: JSON.stringify(t.expected) });
  } catch (e) {
    results.push({ id: i, passed: false, actual: e.message, expected: JSON.stringify(tests[i].expected) });
  }
}
console.log('---TEST_RESULTS---' + JSON.stringify(results));
`,
    validparentheses: `
// --- TEST DRIVER ---
const tests = [
  { s: "()[]{}", expected: true },
  { s: "(]", expected: false }
];
const results = [];
for (let i = 0; i < tests.length; i++) {
  try {
    const t = tests[i];
    const actual = isValid(t.s);
    const passed = actual === t.expected;
    results.push({ id: i, passed, actual: JSON.stringify(actual), expected: JSON.stringify(t.expected) });
  } catch (e) {
    results.push({ id: i, passed: false, actual: e.message, expected: JSON.stringify(tests[i].expected) });
  }
}
console.log('---TEST_RESULTS---' + JSON.stringify(results));
`
  },
  python: {
    twosum: `
# --- TEST DRIVER ---
import json
tests = [
  { "nums": [2, 7, 11, 15], "target": 9, "expected": [0, 1] },
  { "nums": [3, 2, 4], "target": 6, "expected": [1, 2] }
]
results = []
for i, t in enumerate(tests):
  try:
    actual = twoSum(t["nums"], t["target"])
    passed = isinstance(actual, list) and len(actual) == 2 and \\
      ((actual[0] == t["expected"][0] and actual[1] == t["expected"][1]) or \\
       (actual[0] == t["expected"][1] and actual[1] == t["expected"][0]))
    results.append({ "id": i, "passed": passed, "actual": json.dumps(actual), "expected": json.dumps(t["expected"]) })
  except Exception as e:
    results.append({ "id": i, "passed": False, "actual": str(e), "expected": json.dumps(t["expected"]) })
print('---TEST_RESULTS---' + json.dumps(results))
`,
    reversestring: `
# --- TEST DRIVER ---
import json
tests = [
  { "s": ["h","e","l","l","o"], "expected": ["o","l","l","e","h"] }
]
results = []
for i, t in enumerate(tests):
  try:
    s_copy = list(t["s"])
    reverseString(s_copy)
    passed = s_copy == t["expected"]
    results.append({ "id": i, "passed": passed, "actual": json.dumps(s_copy), "expected": json.dumps(t["expected"]) })
  except Exception as e:
    results.append({ "id": i, "passed": False, "actual": str(e), "expected": json.dumps(t["expected"]) })
print('---TEST_RESULTS---' + json.dumps(results))
`,
    palindrome: `
# --- TEST DRIVER ---
import json
tests = [
  { "s": "A man, a plan, a canal: Panama", "expected": True }
]
results = []
for i, t in enumerate(tests):
  try:
    actual = isPalindrome(t["s"])
    passed = actual == t["expected"]
    results.append({ "id": i, "passed": passed, "actual": json.dumps(actual), "expected": json.dumps(t["expected"]) })
  except Exception as e:
    results.append({ "id": i, "passed": False, "actual": str(e), "expected": json.dumps(t["expected"]) })
print('---TEST_RESULTS---' + json.dumps(results))
`,
    fizzbuzz: `
# --- TEST DRIVER ---
import json
tests = [
  { "n": 15, "expected": ["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"] }
]
results = []
for i, t in enumerate(tests):
  try:
    actual = fizzBuzz(t["n"])
    passed = actual == t["expected"]
    results.append({ "id": i, "passed": passed, "actual": json.dumps(actual), "expected": json.dumps(t["expected"]) })
  except Exception as e:
    results.append({ "id": i, "passed": False, "actual": str(e), "expected": json.dumps(t["expected"]) })
print('---TEST_RESULTS---' + json.dumps(results))
`,
    fibonacci: `
# --- TEST DRIVER ---
import json
tests = [
  { "n": 4, "expected": 3 },
  { "n": 2, "expected": 1 }
]
results = []
for i, t in enumerate(tests):
  try:
    actual = fib(t["n"])
    passed = actual == t["expected"]
    results.append({ "id": i, "passed": passed, "actual": json.dumps(actual), "expected": json.dumps(t["expected"]) })
  except Exception as e:
    results.append({ "id": i, "passed": False, "actual": str(e), "expected": json.dumps(t["expected"]) })
print('---TEST_RESULTS---' + json.dumps(results))
`,
    mergesorted: `
# --- TEST DRIVER ---
import json
tests = [
  { "nums1": [1,2,3,0,0,0], "m": 3, "nums2": [2,5,6], "n": 3, "expected": [1,2,2,3,5,6] }
]
results = []
for i, t in enumerate(tests):
  try:
    n1_copy = list(t["nums1"])
    merge(n1_copy, t["m"], t["nums2"], t["n"])
    passed = n1_copy == t["expected"]
    results.append({ "id": i, "passed": passed, "actual": json.dumps(n1_copy), "expected": json.dumps(t["expected"]) })
  except Exception as e:
    results.append({ "id": i, "passed": False, "actual": str(e), "expected": json.dumps(t["expected"]) })
print('---TEST_RESULTS---' + json.dumps(results))
`,
    binarysearch: `
# --- TEST DRIVER ---
import json
tests = [
  { "nums": [-1,0,3,5,9,12], "target": 9, "expected": 4 },
  { "nums": [-1,0,3,5,9,12], "target": 2, "expected": -1 }
]
results = []
for i, t in enumerate(tests):
  try:
    actual = search(t["nums"], t["target"])
    passed = actual == t["expected"]
    results.append({ "id": i, "passed": passed, "actual": json.dumps(actual), "expected": json.dumps(t["expected"]) })
  except Exception as e:
    results.append({ "id": i, "passed": False, "actual": str(e), "expected": json.dumps(t["expected"]) })
print('---TEST_RESULTS---' + json.dumps(results))
`,
    containsduplicate: `
# --- TEST DRIVER ---
import json
tests = [
  { "nums": [1,2,3,1], "expected": True },
  { "nums": [1,2,3,4], "expected": False }
]
results = []
for i, t in enumerate(tests):
  try:
    actual = containsDuplicate(t["nums"])
    passed = actual == t["expected"]
    results.append({ "id": i, "passed": passed, "actual": json.dumps(actual), "expected": json.dumps(t["expected"]) })
  except Exception as e:
    results.append({ "id": i, "passed": False, "actual": str(e), "expected": json.dumps(t["expected"]) })
print('---TEST_RESULTS---' + json.dumps(results))
`,
    validparentheses: `
# --- TEST DRIVER ---
import json
tests = [
  { "s": "()[]{}", "expected": True },
  { "s": "(]", "expected": False }
]
results = []
for i, t in enumerate(tests):
  try:
    actual = isValid(t["s"])
    passed = actual == t["expected"]
    results.append({ "id": i, "passed": passed, "actual": json.dumps(actual), "expected": json.dumps(t["expected"]) })
  except Exception as e:
    results.append({ "id": i, "passed": False, "actual": str(e), "expected": json.dumps(t["expected"]) })
print('---TEST_RESULTS---' + json.dumps(results))
`
  },
  java: {
    twosum: `
class Main {
  public static void main(String[] args) {
    Solution sol = new Solution();
    StringBuilder sb = new StringBuilder();
    sb.append("---TEST_RESULTS---[");
    try {
      int[] nums = {2, 7, 11, 15};
      int[] ans = sol.twoSum(nums, 9);
      boolean passed = ans != null && ans.length == 2 && 
        ((ans[0] == 0 && ans[1] == 1) || (ans[0] == 1 && ans[1] == 0));
      sb.append("{\\"id\\":0,\\"passed\\":" + passed + ",\\"actual\\":\\"" + java.util.Arrays.toString(ans) + "\\",\\"expected\\":\\"[0, 1]\\"}");
    } catch (Exception e) {
      sb.append("{\\"id\\":0,\\"passed\\":false,\\"actual\\":\\"" + e.getMessage() + "\\",\\"expected\\":\\"[0, 1]\\"}");
    }
    sb.append(",");
    try {
      int[] nums = {3, 2, 4};
      int[] ans = sol.twoSum(nums, 6);
      boolean passed = ans != null && ans.length == 2 && 
        ((ans[0] == 1 && ans[1] == 2) || (ans[0] == 2 && ans[1] == 1));
      sb.append("{\\"id\\":1,\\"passed\\":" + passed + ",\\"actual\\":\\"" + java.util.Arrays.toString(ans) + "\\",\\"expected\\":\\"[1, 2]\\"}");
    } catch (Exception e) {
      sb.append("{\\"id\\":1,\\"passed\\":false,\\"actual\\":\\"" + e.getMessage() + "\\",\\"expected\\":\\"[1, 2]\\"}");
    }
    sb.append("]");
    System.out.println(sb.toString());
  }
}
`,
    reversestring: `
class Main {
  public static void main(String[] args) {
    Solution sol = new Solution();
    StringBuilder sb = new StringBuilder();
    sb.append("---TEST_RESULTS---[");
    try {
      char[] s = {'h','e','l','l','o'};
      char[] expected = {'o','l','l','e','h'};
      sol.reverseString(s);
      boolean passed = java.util.Arrays.equals(s, expected);
      sb.append("{\\"id\\":0,\\"passed\\":" + passed + ",\\"actual\\":\\"" + java.util.Arrays.toString(s) + "\\",\\"expected\\":\\"[o, l, l, e, h]\\"}");
    } catch (Exception e) {
      sb.append("{\\"id\\":0,\\"passed\\":false,\\"actual\\":\\"" + e.getMessage() + "\\",\\"expected\\":\\"[o, l, l, e, h]\\"}");
    }
    sb.append("]");
    System.out.println(sb.toString());
  }
}
`,
    palindrome: `
class Main {
  public static void main(String[] args) {
    Solution sol = new Solution();
    StringBuilder sb = new StringBuilder();
    sb.append("---TEST_RESULTS---[");
    try {
      String s = "A man, a plan, a canal: Panama";
      boolean ans = sol.isPalindrome(s);
      boolean passed = ans == true;
      sb.append("{\\"id\\":0,\\"passed\\":" + passed + ",\\"actual\\":\\"" + ans + "\\",\\"expected\\":\\"true\\"}");
    } catch (Exception e) {
      sb.append("{\\"id\\":0,\\"passed\\":false,\\"actual\\":\\"" + e.getMessage() + "\\",\\"expected\\":\\"true\\"}");
    }
    sb.append("]");
    System.out.println(sb.toString());
  }
}
`,
    fizzbuzz: `
class Main {
  public static void main(String[] args) {
    Solution sol = new Solution();
    StringBuilder sb = new StringBuilder();
    sb.append("---TEST_RESULTS---[");
    try {
      java.util.List<String> ans = sol.fizzBuzz(15);
      java.util.List<String> expected = java.util.Arrays.asList("1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz");
      boolean passed = expected.equals(ans);
      sb.append("{\\"id\\":0,\\"passed\\":" + passed + ",\\"actual\\":\\"" + ans + "\\",\\"expected\\":\\"" + expected + "\\"}");
    } catch (Exception e) {
      sb.append("{\\"id\\":0,\\"passed\\":false,\\"actual\\":\\"" + e.getMessage() + "\\",\\"expected\\":\\"[1, 2, Fizz, 4, Buzz, Fizz...]\\"}");
    }
    sb.append("]");
    System.out.println(sb.toString());
  }
}
`,
    fibonacci: `
class Main {
  public static void main(String[] args) {
    Solution sol = new Solution();
    StringBuilder sb = new StringBuilder();
    sb.append("---TEST_RESULTS---[");
    try {
      int ans0 = sol.fib(4);
      boolean passed0 = ans0 == 3;
      sb.append("{\\"id\\":0,\\"passed\\":" + passed0 + ",\\"actual\\":\\"" + ans0 + "\\",\\"expected\\":\\"3\\"}");
    } catch (Exception e) {
      sb.append("{\\"id\\":0,\\"passed\\":false,\\"actual\\":\\"" + e.getMessage() + "\\",\\"expected\\":\\"3\\"}");
    }
    sb.append(",");
    try {
      int ans1 = sol.fib(2);
      boolean passed1 = ans1 == 1;
      sb.append("{\\"id\\":1,\\"passed\\":" + passed1 + ",\\"actual\\":\\"" + ans1 + "\\",\\"expected\\":\\"1\\"}");
    } catch (Exception e) {
      sb.append("{\\"id\\":1,\\"passed\\":false,\\"actual\\":\\"" + e.getMessage() + "\\",\\"expected\\":\\"1\\"}");
    }
    sb.append("]");
    System.out.println(sb.toString());
  }
}
`,
    mergesorted: `
class Main {
  public static void main(String[] args) {
    Solution sol = new Solution();
    StringBuilder sb = new StringBuilder();
    sb.append("---TEST_RESULTS---[");
    try {
      int[] nums1 = {1,2,3,0,0,0};
      int[] nums2 = {2,5,6};
      int[] expected = {1,2,2,3,5,6};
      sol.merge(nums1, 3, nums2, 3);
      boolean passed = java.util.Arrays.equals(nums1, expected);
      sb.append("{\\"id\\":0,\\"passed\\":" + passed + ",\\"actual\\":\\"" + java.util.Arrays.toString(nums1) + "\\",\\"expected\\":\\"" + java.util.Arrays.toString(expected) + "\\"}");
    } catch (Exception e) {
      sb.append("{\\"id\\":0,\\"passed\\":false,\\"actual\\":\\"" + e.getMessage() + "\\",\\"expected\\":\\"[1, 2, 2, 3, 5, 6]\\"}");
    }
    sb.append("]");
    System.out.println(sb.toString());
  }
}
`,
    binarysearch: `
class Main {
  public static void main(String[] args) {
    Solution sol = new Solution();
    StringBuilder sb = new StringBuilder();
    sb.append("---TEST_RESULTS---[");
    try {
      int[] nums = {-1,0,3,5,9,12};
      int ans0 = sol.search(nums, 9);
      boolean passed0 = ans0 == 4;
      sb.append("{\\"id\\":0,\\"passed\\":" + passed0 + ",\\"actual\\":\\"" + ans0 + "\\",\\"expected\\":\\"4\\"}");
    } catch (Exception e) {
      sb.append("{\\"id\\":0,\\"passed\\":false,\\"actual\\":\\"" + e.getMessage() + "\\",\\"expected\\":\\"4\\"}");
    }
    sb.append(",");
    try {
      int[] nums = {-1,0,3,5,9,12};
      int ans1 = sol.search(nums, 2);
      boolean passed1 = ans1 == -1;
      sb.append("{\\"id\\":1,\\"passed\\":" + passed1 + ",\\"actual\\":\\"" + ans1 + "\\",\\"expected\\":\\"-1\\"}");
    } catch (Exception e) {
      sb.append("{\\"id\\":1,\\"passed\\":false,\\"actual\\":\\"" + e.getMessage() + "\\",\\"expected\\":\\"-1\\"}");
    }
    sb.append("]");
    System.out.println(sb.toString());
  }
}
`,
    containsduplicate: `
class Main {
  public static void main(String[] args) {
    Solution sol = new Solution();
    StringBuilder sb = new StringBuilder();
    sb.append("---TEST_RESULTS---[");
    try {
      int[] nums = {1,2,3,1};
      boolean ans0 = sol.containsDuplicate(nums);
      boolean passed0 = ans0 == true;
      sb.append("{\\"id\\":0,\\"passed\\":" + passed0 + ",\\"actual\\":\\"" + ans0 + "\\",\\"expected\\":\\"true\\"}");
    } catch (Exception e) {
      sb.append("{\\"id\\":0,\\"passed\\":false,\\"actual\\":\\"" + e.getMessage() + "\\",\\"expected\\":\\"true\\"}");
    }
    sb.append(",");
    try {
      int[] nums = {1,2,3,4};
      boolean ans1 = sol.containsDuplicate(nums);
      boolean passed1 = ans1 == false;
      sb.append("{\\"id\\":1,\\"passed\\":" + passed1 + ",\\"actual\\":\\"" + ans1 + "\\",\\"expected\\":\\"false\\"}");
    } catch (Exception e) {
      sb.append("{\\"id\\":1,\\"passed\\":false,\\"actual\\":\\"" + e.getMessage() + "\\",\\"expected\\":\\"false\\"}");
    }
    sb.append("]");
    System.out.println(sb.toString());
  }
}
`,
    validparentheses: `
class Main {
  public static void main(String[] args) {
    Solution sol = new Solution();
    StringBuilder sb = new StringBuilder();
    sb.append("---TEST_RESULTS---[");
    try {
      boolean ans0 = sol.isValid("()[]{}");
      boolean passed0 = ans0 == true;
      sb.append("{\\"id\\":0,\\"passed\\":" + passed0 + ",\\"actual\\":\\"" + ans0 + "\\",\\"expected\\":\\"true\\"}");
    } catch (Exception e) {
      sb.append("{\\"id\\":0,\\"passed\\":false,\\"actual\\":\\"" + e.getMessage() + "\\",\\"expected\\":\\"true\\"}");
    }
    sb.append(",");
    try {
      boolean ans1 = sol.isValid("(]");
      boolean passed1 = ans1 == false;
      sb.append("{\\"id\\":1,\\"passed\\":" + passed1 + ",\\"actual\\":\\"" + ans1 + "\\",\\"expected\\":\\"false\\"}");
    } catch (Exception e) {
      sb.append("{\\"id\\":1,\\"passed\\":false,\\"actual\\":\\"" + e.getMessage() + "\\",\\"expected\\":\\"false\\"}");
    }
    sb.append("]");
    System.out.println(sb.toString());
  }
}
`
  }
};

const extractFunctionNameJS = (starterCode) => {
  if (!starterCode) return null;
  const match = starterCode.match(/function\s+(\w+)\s*\(/);
  return match ? match[1] : null;
};

const generateJSDriver = (problem, starterCode) => {
  const funcName = extractFunctionNameJS(starterCode) || 'solve';
  const testsJson = JSON.stringify(problem.tests || []);
  
  return `
// --- DYNAMIC TEST DRIVER ---
const normalizeAndCompare = (actual, expectedStr) => {
  if (actual === undefined) return expectedStr === "undefined";
  if (actual === null) return expectedStr === "null";
  let expectedVal;
  try {
    expectedVal = JSON.parse(expectedStr);
  } catch (e) {
    expectedVal = expectedStr;
  }
  if (typeof actual === 'object') {
    try {
      const actStr = JSON.stringify(actual);
      const expStr = JSON.stringify(expectedVal);
      return actStr.replace(/\\s+/g, '') === expStr.replace(/\\s+/g, '');
    } catch (e) {
      return false;
    }
  }
  return String(actual).trim() === String(expectedVal).trim();
};

const testsData = ${testsJson};

const results = [];
for (let i = 0; i < testsData.length; i++) {
  try {
    const t = testsData[i];
    const rawInputs = t.input.split('\\n');
    const parsedArgs = rawInputs.map(inp => {
      if (!inp.trim()) return undefined;
      try {
        return JSON.parse(inp);
      } catch(e) {
        return inp;
      }
    }).filter(x => x !== undefined);
    
    const actual = ${funcName}(...parsedArgs);
    const passed = normalizeAndCompare(actual, t.expected);
    results.push({
      id: i,
      passed,
      actual: typeof actual === 'object' ? JSON.stringify(actual) : String(actual),
      expected: t.expected
    });
  } catch (e) {
    results.push({
      id: i,
      passed: false,
      actual: e.message,
      expected: testsData[i].expected
    });
  }
}
console.log('---TEST_RESULTS---' + JSON.stringify(results));
`;
};

const extractFunctionNamePy = (starterCode) => {
  if (!starterCode) return null;
  const match = starterCode.match(/def\s+(\w+)\s*\(/);
  return match ? match[1] : null;
};

const generatePyDriver = (problem, starterCode) => {
  const funcName = extractFunctionNamePy(starterCode) || 'solve';
  const testsJson = JSON.stringify(problem.tests || []);
  
  return `
# --- DYNAMIC TEST DRIVER ---
import json

def normalize_and_compare(actual, expected_str):
    if actual is None:
        return expected_str == "None" or expected_str == "null"
    try:
        expected_val = json.loads(expected_str)
    except Exception:
        expected_val = expected_str
    
    if expected_str == "true":
        expected_val = True
    elif expected_str == "false":
        expected_val = False
        
    if isinstance(actual, (list, dict)):
        try:
            act_str = json.dumps(actual, separators=(',', ':'))
            exp_str = json.dumps(expected_val, separators=(',', ':'))
            return act_str == exp_str
        except Exception:
            return False
    return str(actual).strip() == str(expected_val).strip()

tests_data = ${testsJson}

results = []
for i, t in enumerate(tests_data):
    try:
        raw_inputs = t["input"].split('\\n')
        parsed_args = []
        for inp in raw_inputs:
            if not inp.strip():
                continue
            try:
                parsed_args.append(json.loads(inp))
            except Exception:
                parsed_args.append(inp)
                
        actual = ${funcName}(*parsed_args)
        passed = normalize_and_compare(actual, t["expected"])
        results.append({
            "id": i,
            "passed": passed,
            "actual": json.dumps(actual) if isinstance(actual, (list, dict)) else str(actual),
            "expected": t["expected"]
        })
    except Exception as e:
        results.append({
            "id": i,
            "passed": False,
            "actual": str(e),
            "expected": t["expected"]
        })
print('---TEST_RESULTS---' + json.dumps(results))
`;
};

const parseJavaSignature = (starterCode) => {
  if (!starterCode) return null;
  const clean = starterCode.replace(/class\s+Solution\s*\{/, '');
  const match = clean.match(/(public|private|protected|static|\s)+\s+([\w<>\[\]]+)\s+(\w+)\s*\(([^)]*)\)/);
  if (!match) return null;
  
  const returnType = match[2].trim();
  const methodName = match[3].trim();
  const paramsStr = match[4].trim();
  
  const params = paramsStr ? paramsStr.split(',').map(p => {
    const parts = p.trim().split(/\s+/);
    return {
      type: parts[parts.length - 2].trim(),
      name: parts[parts.length - 1].trim()
    };
  }) : [];
  
  return { returnType, methodName, params };
};

const generateJavaDriver = (problem, starterCode) => {
  const sig = parseJavaSignature(starterCode);
  if (!sig) return '';
  
  const { returnType, methodName, params } = sig;
  const tests = problem.tests || [];
  
  let sb = '';
  sb += 'import java.util.*;\n';
  sb += 'class Main {\n';
  
  sb += `
  private static int[] parseIntArray(String s) {
      s = s.trim();
      if (s.startsWith("[")) s = s.substring(1);
      if (s.endsWith("]")) s = s.substring(0, s.length() - 1);
      if (s.trim().isEmpty()) return new int[0];
      String[] parts = s.split(",");
      int[] res = new int[parts.length];
      for (int i = 0; i < parts.length; i++) {
          res[i] = Integer.parseInt(parts[i].trim());
      }
      return res;
  }
  
  private static String parseString(String s) {
      s = s.trim();
      if (s.startsWith("\\"") && s.endsWith("\\"")) {
          s = s.substring(1, s.length() - 1);
      }
      return s;
  }
  
  private static char[] parseCharArray(String s) {
      s = s.trim();
      if (s.startsWith("[")) s = s.substring(1);
      if (s.endsWith("]")) s = s.substring(0, s.length() - 1);
      if (s.trim().isEmpty()) return new char[0];
      String[] parts = s.split(",");
      char[] res = new char[parts.length];
      for (int i = 0; i < parts.length; i++) {
          String p = parts[i].trim();
          if (p.startsWith("\\"") && p.endsWith("\\"")) p = p.substring(1, p.length() - 1);
          if (p.startsWith("'") && p.endsWith("'")) p = p.substring(1, p.length() - 1);
          res[i] = p.length() > 0 ? p.charAt(0) : ' ';
      }
      return res;
  }
  
  private static boolean compare(String actual, String expected) {
      if (actual == null) return expected == null || expected.equals("null");
      actual = actual.trim().replaceAll("\\\\s+", "");
      expected = expected.trim().replaceAll("\\\\s+", "");
      return actual.equals(expected);
  }
  `;
  
  sb += '  public static void main(String[] args) {\n';
  sb += '    Solution sol = new Solution();\n';
  sb += '    StringBuilder sb = new StringBuilder();\n';
  sb += '    sb.append("---TEST_RESULTS---[");\n';
  
  tests.forEach((test, idx) => {
    if (idx > 0) sb += '    sb.append(",");\n';
    sb += '    try {\n';
    
    const inputLines = test.input.split('\n');
    params.forEach((param, pIdx) => {
      const lineVal = (inputLines[pIdx] || '').replace(/"/g, '\\"').replace(/\\/g, '\\\\');
      if (param.type === 'int[]') {
        sb += `      int[] p${pIdx} = parseIntArray("${lineVal}");\n`;
      } else if (param.type === 'int') {
        sb += `      int p${pIdx} = Integer.parseInt("${lineVal}".trim());\n`;
      } else if (param.type === 'double') {
        sb += `      double p${pIdx} = Double.parseDouble("${lineVal}".trim());\n`;
      } else if (param.type === 'boolean') {
        sb += `      boolean p${pIdx} = Boolean.parseBoolean("${lineVal}".trim());\n`;
      } else if (param.type === 'String') {
        sb += `      String p${pIdx} = parseString("${lineVal}");\n`;
      } else if (param.type === 'char[]') {
        sb += `      char[] p${pIdx} = parseCharArray("${lineVal}");\n`;
      } else {
        sb += `      String p${pIdx} = "${lineVal}";\n`;
      }
    });
    
    const argsCall = params.map((_, pIdx) => `p${pIdx}`).join(', ');
    sb += `      ${returnType} ans = sol.${methodName}(${argsCall});\n`;
    
    let actualStr = '';
    if (returnType === 'int[]') {
      actualStr = 'java.util.Arrays.toString(ans)';
    } else if (returnType === 'char[]') {
      actualStr = 'java.util.Arrays.toString(ans)';
    } else if (returnType === 'String') {
      actualStr = 'ans';
    } else {
      actualStr = 'String.valueOf(ans)';
    }
    
    sb += `      String actualVal = ${actualStr};\n`;
    sb += `      boolean passed = compare(actualVal, "${test.expected.replace(/"/g, '\\"').replace(/\\/g, '\\\\')}");\n`;
    sb += `      sb.append("{\\"id\\":${idx},\\"passed\\":" + passed + ",\\"actual\\":\\"" + (actualVal != null ? actualVal.replace("\\"", "\\\\\\\"") : "null") + "\\",\\"expected\\":\\"${test.expected.replace(/"/g, '\\"')}\\"}");\n`;
    
    sb += '    } catch (Exception e) {\n';
    sb += `      sb.append("{\\"id\\":${idx},\\"passed\\":false,\\"actual\\":\\"" + (e.getMessage() != null ? e.getMessage().replace("\\"", "\\\\\\\"") : "Exception") + "\\",\\"expected\\":\\"${test.expected.replace(/"/g, '\\"')}\\"}");\n`;
    sb += '    }\n';
  });
  
  sb += '    sb.append("]");\n';
  sb += '    System.out.println(sb.toString());\n';
  sb += '  }\n';
  sb += '}\n';
  
  return sb;
};

/**
 * Wrap candidate code with test runner drivers
 * @param {string} code 
 * @param {string} language 
 * @param {string} problemId 
 * @param {object} problem 
 * @returns {string} The combined code ready for compilation
 */
export const wrapCode = (code, language, problemId, problem = null) => {
  const langKey = language.toLowerCase();
  const probKey = problemId.toLowerCase();

  const langDrivers = DRIVERS[langKey] || DRIVERS[langKey === 'js' ? 'javascript' : langKey === 'py' ? 'python' : ''];
  let driver = langDrivers ? langDrivers[probKey] : null;

  if (!driver && problem) {
    const starterCode = problem.starterCode?.[langKey] || 
                        problem.starterCode?.[langKey === 'js' ? 'javascript' : langKey === 'py' ? 'python' : ''] || '';
    if (langKey === 'javascript' || langKey === 'js') {
      driver = generateJSDriver(problem, starterCode);
    } else if (langKey === 'python' || langKey === 'py') {
      driver = generatePyDriver(problem, starterCode);
    } else if (langKey === 'java') {
      driver = generateJavaDriver(problem, starterCode);
    }
  }

  if (!driver) {
    return code;
  }

  return `${code}\n${driver}`;
};

/**
 * Parse compilation/runtime errors to extract line number
 * @param {string} stderr 
 * @param {string} language 
 * @returns {number|null} Line number of the error, or null
 */
export const parseErrorLine = (stderr, language) => {
  if (!stderr) return null;
  const langKey = language.toLowerCase();

  if (langKey === 'javascript' || langKey === 'js') {
    const match = stderr.match(/[\w-]+\.js:(\d+)/i);
    if (match) return parseInt(match[1], 10);
  }

  if (langKey === 'python' || langKey === 'py') {
    const match = stderr.match(/File\s+"[^"]*prog\.py",\s+line\s+(\d+)/i) || 
                  stderr.match(/File\s+"[^"]*main\.py",\s+line\s+(\d+)/i) ||
                  stderr.match(/line (\d+)/i);
    if (match) return parseInt(match[1], 10);
  }

  if (langKey === 'java') {
    const match = stderr.match(/Solution\.java:(\d+)/i) || 
                  stderr.match(/Main\.java:(\d+)/i) ||
                  stderr.match(/:(\d+): error:/i);
    if (match) return parseInt(match[1], 10);
  }

  const genericMatch = stderr.match(/[\w-]+\.(?:js|py|java):(\d+)/i) || stderr.match(/(?:line|:)\s*(\d+)/i);
  if (genericMatch) return parseInt(genericMatch[1], 10);

  return null;
};
