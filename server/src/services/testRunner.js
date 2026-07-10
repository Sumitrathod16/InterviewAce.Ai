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

/**
 * Wrap candidate code with test runner drivers
 * @param {string} code 
 * @param {string} language 
 * @param {string} problemId 
 * @returns {string} The combined code ready for compilation
 */
export const wrapCode = (code, language, problemId) => {
  const langKey = language.toLowerCase();
  const probKey = problemId.toLowerCase();

  const langDrivers = DRIVERS[langKey] || DRIVERS[langKey === 'js' ? 'javascript' : langKey === 'py' ? 'python' : ''];
  const driver = langDrivers ? langDrivers[probKey] : null;

  if (!driver) {
    return code; // Fallback to raw code
  }

  // Append driver at the bottom to preserve candidate line numbers
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

  // JavaScript Node error matching
  if (langKey === 'javascript' || langKey === 'js') {
    // Specifically match prog.js:LINE or main.js:LINE or similar .js files to avoid node:internal modules
    const match = stderr.match(/[\w-]+\.js:(\d+)/i);
    if (match) return parseInt(match[1], 10);
  }

  // Python error matching
  if (langKey === 'python' || langKey === 'py') {
    // Specifically look for file containing "prog.py" or "main.py" to avoid other lines
    const match = stderr.match(/File\s+"[^"]*prog\.py",\s+line\s+(\d+)/i) || 
                  stderr.match(/File\s+"[^"]*main\.py",\s+line\s+(\d+)/i) ||
                  stderr.match(/line (\d+)/i);
    if (match) return parseInt(match[1], 10);
  }

  // Java error matching
  if (langKey === 'java') {
    // Looks like: Solution.java:12: error: ...
    const match = stderr.match(/Solution\.java:(\d+)/i) || 
                  stderr.match(/Main\.java:(\d+)/i) ||
                  stderr.match(/:(\d+): error:/i);
    if (match) return parseInt(match[1], 10);
  }

  // Generic match as fallback
  const genericMatch = stderr.match(/[\w-]+\.(?:js|py|java):(\d+)/i) || stderr.match(/(?:line|:)\s*(\d+)/i);
  if (genericMatch) return parseInt(genericMatch[1], 10);

  return null;
};
