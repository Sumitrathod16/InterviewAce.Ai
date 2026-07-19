import axios from 'axios';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

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
 * Execute code using local system compilers and interpreters
 * @param {string} code 
 * @param {string} language 
 * @param {string} stdin 
 * @returns {Promise<object>} Execution report
 */
export const executeCodeLocal = async (code, language, stdin = '') => {
  const langKey = language.toLowerCase();
  const uuid = crypto.randomUUID();
  const runDir = path.join(os.tmpdir(), `wandbox_local_${uuid}`);
  
  let fileName = '';
  let command = '';
  let args = [];
  let compileCommand = '';
  let compileArgs = [];
  let isCompiled = false;
  let runCommand = '';
  let runArgs = [];

  // Create temporary unique run directory
  fs.mkdirSync(runDir, { recursive: true });

  if (langKey === 'javascript' || langKey === 'js') {
    fileName = path.join(runDir, 'prog.js');
    fs.writeFileSync(fileName, code);
    command = 'node';
    args = [fileName];
  } else if (langKey === 'python' || langKey === 'py') {
    fileName = path.join(runDir, 'prog.py');
    fs.writeFileSync(fileName, code);
    command = 'python';
    args = [fileName];
  } else if (langKey === 'java') {
    fileName = path.join(runDir, 'Solution.java');
    fs.writeFileSync(fileName, code);
    command = 'java';
    args = [fileName];
  } else if (langKey === 'cpp' || langKey === 'c++') {
    fileName = path.join(runDir, 'prog.cpp');
    const exeFile = path.join(runDir, 'prog.exe');
    fs.writeFileSync(fileName, code);
    compileCommand = 'g++';
    compileArgs = [fileName, '-o', exeFile];
    isCompiled = true;
    runCommand = exeFile;
    runArgs = [];
  } else if (langKey === 'c') {
    fileName = path.join(runDir, 'prog.c');
    const exeFile = path.join(runDir, 'prog.exe');
    fs.writeFileSync(fileName, code);
    compileCommand = 'gcc';
    compileArgs = [fileName, '-o', exeFile];
    isCompiled = true;
    runCommand = exeFile;
    runArgs = [];
  } else {
    // Cleanup and throw
    try { fs.rmSync(runDir, { recursive: true, force: true }); } catch (e) {}
    throw new Error(`Unsupported compiler language locally: ${language}`);
  }

  const start = process.hrtime();

  return new Promise((resolve) => {
    const cleanup = () => {
      try {
        fs.rmSync(runDir, { recursive: true, force: true });
      } catch (err) {
        console.error('Local runner cleanup error:', err.message);
      }
    };

    const runProcess = (cmd, cmdArgs) => {
      const child = spawn(cmd, cmdArgs);
      let stdout = '';
      let stderr = '';

      if (stdin) {
        child.stdin.write(stdin);
        child.stdin.end();
      }

      // Safeguard against infinite loops (5 seconds timeout)
      let timedOut = false;
      const timeoutId = setTimeout(() => {
        timedOut = true;
        child.kill('SIGKILL');
      }, 5000);

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('error', (err) => {
        clearTimeout(timeoutId);
        cleanup();
        const diff = process.hrtime(start);
        const timeMs = diff[0] * 1000 + diff[1] / 1000000;
        resolve({
          success: false,
          status: 'Runtime Error',
          stdout: '',
          stderr: err.message,
          time: (timeMs / 1000).toFixed(3),
          memory: '0.00'
        });
      });

      child.on('close', (code) => {
        clearTimeout(timeoutId);
        cleanup();
        const diff = process.hrtime(start);
        const timeMs = diff[0] * 1000 + diff[1] / 1000000;

        if (timedOut) {
          resolve({
            success: false,
            status: 'Time Limit Exceeded',
            stdout: stdout,
            stderr: (stderr ? stderr + '\n' : '') + 'Error: Execution timed out (Time Limit Exceeded of 5 seconds).',
            time: (timeMs / 1000).toFixed(3),
            memory: '0.00'
          });
          return;
        }

        const success = code === 0;
        let status = 'Accepted';
        if (!success) {
          if (langKey === 'javascript' || langKey === 'js') {
            status = stderr.includes('SyntaxError') ? 'Compilation Error' : 'Runtime Error';
          } else if (langKey === 'python' || langKey === 'py') {
            status = (stderr.includes('SyntaxError') || stderr.includes('IndentationError') || stderr.includes('TabError')) 
                     ? 'Compilation Error' 
                     : 'Runtime Error';
          } else {
            status = 'Runtime Error';
          }
        }

        resolve({
          success: success,
          status: status,
          stdout: stdout,
          stderr: stderr,
          time: (timeMs / 1000).toFixed(3),
          memory: '0.00'
        });
      });
    };

    if (isCompiled) {
      const compilerProcess = spawn(compileCommand, compileArgs);
      let compileStderr = '';

      compilerProcess.stderr.on('data', (data) => {
        compileStderr += data.toString();
      });

      compilerProcess.on('error', (err) => {
        cleanup();
        const diff = process.hrtime(start);
        const timeMs = diff[0] * 1000 + diff[1] / 1000000;
        resolve({
          success: false,
          status: 'Compilation Error',
          stdout: '',
          stderr: `Compiler invocation error: ${err.message}`,
          time: (timeMs / 1000).toFixed(3),
          memory: '0.00'
        });
      });

      compilerProcess.on('close', (code) => {
        if (code !== 0) {
          cleanup();
          const diff = process.hrtime(start);
          const timeMs = diff[0] * 1000 + diff[1] / 1000000;
          resolve({
            success: false,
            status: 'Compilation Error',
            stdout: '',
            stderr: compileStderr,
            time: (timeMs / 1000).toFixed(3),
            memory: '0.00'
          });
        } else {
          runProcess(runCommand, runArgs);
        }
      });
    } else {
      runProcess(command, args);
    }
  });
};

/**
 * Execute code via Wandbox Public API (with safe local fallback)
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

  // 1. Direct local execution if environment variable is set
  if (process.env.USE_LOCAL_COMPILER === 'true') {
    console.log(`[Compiler] Executing ${language} code locally via primary config.`);
    return executeCodeLocal(code, language, stdin);
  }

  // 2. Attempt Wandbox execution
  try {
    const start = process.hrtime();
    const response = await axios.post('https://wandbox.org/api/compile.json', {
      compiler: compilerId,
      code: code,
      stdin: stdin
    });
    const diff = process.hrtime(start);
    const timeMs = diff[0] * 1000 + diff[1] / 1000000;

    const data = response.data;
    const success = data.status === '0';

    return {
      success: success,
      status: success ? 'Accepted' : (data.program_error ? 'Runtime Error' : 'Compilation Error'),
      stdout: data.program_output || '',
      stderr: data.program_error || data.compiler_error || '',
      time: (timeMs / 1000).toFixed(3),
      memory: '0.00'
    };
  } catch (error) {
    console.warn(`[Compiler] Wandbox API execution failed: ${error.message}. Falling back to local compiler...`);
    try {
      return await executeCodeLocal(code, language, stdin);
    } catch (fallbackError) {
      console.error('[Compiler] Local execution fallback also failed:', fallbackError.message);
      throw new Error('Code execution failed due to server error');
    }
  }
};
