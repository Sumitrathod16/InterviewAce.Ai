import axios from 'axios';

// Compiler mapping for Wandbox
const COMPILER_MAPPING = {
  javascript: 'nodejs-20.17.0',
  js: 'nodejs-20.17.0',
  python: 'cpython-3.12.7',
  py: 'cpython-3.12.7',
  java: 'openjdk-jdk-21+35',
  cpp: 'gcc-13.2.0',
  c: 'gcc-13.2.0-c'
};

/**
 * Execute code via Wandbox Public API
 * @param {string} code 
 * @param {string} language 
 * @param {string} stdin 
 * @returns {Promise<object>} Execution report
 */
export const executeCode = async (code, language, stdin = '') => {
  const langKey = language.toLowerCase();
  const compilerId = COMPILER_MAPPING[langKey];

  if (!compilerId) {
    throw new Error(`Unsupported compiler language: ${language}`);
  }

  try {
    const start = process.hrtime();
    const response = await axios.post('https://wandbox.org/api/compile.json', {
      compiler: compilerId,
      code: code,
      stdin: stdin
    });
    const diff = process.hrtime(start);
    const timeMs = (diff[0] * 1000 + diff[1] / 1000000).toFixed(2);

    const data = response.data;
    const success = data.status === '0';

    return {
      success: success,
      status: success ? 'Accepted' : (data.program_error ? 'Runtime Error' : 'Compilation Error'),
      stdout: data.program_output || '',
      stderr: data.program_error || data.compiler_error || '',
      time: (timeMs / 1000).toFixed(3),
      memory: '0.00' // Wandbox doesn't return memory info directly in compile.json
    };
  } catch (error) {
    console.error('Wandbox execution error:', error.message);
    throw new Error('Code execution failed due to server error');
  }
};
