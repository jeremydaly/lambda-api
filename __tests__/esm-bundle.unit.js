'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

describe('ESM Bundle Tests', () => {
  let tempDir;
  let bundlePath;
  let testFilePath;

  beforeEach(() => {
    // Create a temporary directory for test files
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lambda-api-esm-test-'));
    bundlePath = path.join(tempDir, 'bundle.mjs');
    testFilePath = path.join(tempDir, 'test-entry.js');
  });

  afterEach(() => {
    // Clean up temporary files
    try {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    } catch (e) {
      // Ignore cleanup errors
    }
  });

  it('should bundle with esbuild for ESM without requiring banner', () => {
    // Create a test entry file that imports from the .mjs entry point
    const testCode = `
import api from '${path.resolve(__dirname, '../index.mjs')}';

const app = api();

app.get('/test', (req, res) => {
  res.json({ message: 'Hello from ESM bundle' });
});

export const handler = async (event, context) => {
  return await app.run(event, context);
};
`;

    fs.writeFileSync(testFilePath, testCode);

    // Bundle with esbuild (mark AWS SDK as external since they're peer dependencies)
    try {
      execSync(
        `npx esbuild ${testFilePath} --bundle --platform=node --format=esm --outfile=${bundlePath} --external:@aws-sdk/client-s3 --external:@aws-sdk/s3-request-presigner`,
        { cwd: path.resolve(__dirname, '..'), stdio: 'pipe' }
      );
    } catch (e) {
      throw new Error(`Bundling failed: ${e.message}`);
    }

    // Verify the bundle was created
    expect(fs.existsSync(bundlePath)).toBe(true);

    // Test that the bundle executes without errors
    const testEvent = JSON.stringify({
      httpMethod: 'GET',
      path: '/test',
      headers: {},
      body: null,
      isBase64Encoded: false,
    });

    const testScript = `
import { handler } from '${bundlePath}';
const event = ${testEvent};
const result = await handler(event, {});
console.log(JSON.stringify(result));
`;

    const scriptPath = path.join(tempDir, 'test-run.mjs');
    fs.writeFileSync(scriptPath, testScript);

    let output;
    try {
      output = execSync(`node ${scriptPath}`, {
        encoding: 'utf-8',
        cwd: tempDir,
      });
    } catch (e) {
      throw new Error(`Bundle execution failed: ${e.message}\n${e.stderr}`);
    }

    const result = JSON.parse(output.trim());

    // Verify the response
    expect(result).toHaveProperty('statusCode', 200);
    expect(result).toHaveProperty('headers');
    expect(result.headers).toHaveProperty('content-type', 'application/json');
    expect(result).toHaveProperty('body');

    const body = JSON.parse(result.body);
    expect(body).toEqual({ message: 'Hello from ESM bundle' });
  });

  it('should work with CommonJS require (backward compatibility)', async () => {
    const api = require('../index.js');
    expect(typeof api).toBe('function');

    const app = api();
    expect(app).toBeDefined();
    expect(typeof app.get).toBe('function');
    expect(typeof app.post).toBe('function');
    expect(typeof app.run).toBe('function');

    // Test full end-to-end functionality with CommonJS
    app.get('/test-commonjs', (req, res) => {
      res.json({ message: 'CommonJS works', method: req.method });
    });

    const event = {
      httpMethod: 'GET',
      path: '/test-commonjs',
      headers: {},
      body: null,
      isBase64Encoded: false,
    };

    const result = await app.run(event, {});
    
    expect(result).toHaveProperty('statusCode', 200);
    expect(result).toHaveProperty('headers');
    expect(result.headers).toHaveProperty('content-type', 'application/json');
    expect(result).toHaveProperty('body');

    const body = JSON.parse(result.body);
    expect(body).toEqual({ message: 'CommonJS works', method: 'GET' });
  });

  it('should work with ESM import', async () => {
    // Test that the .mjs file can be imported in Node.js
    const testScript = `
import api from '${path.resolve(__dirname, '../index.mjs')}';
console.log(JSON.stringify({
  isFunction: typeof api === 'function',
  hasDefault: api.default !== undefined
}));
`;

    const scriptPath = path.join(tempDir, 'test-import.mjs');
    fs.writeFileSync(scriptPath, testScript);

    let output;
    try {
      output = execSync(`node ${scriptPath}`, {
        encoding: 'utf-8',
        cwd: tempDir,
      });
    } catch (e) {
      throw new Error(`ESM import failed: ${e.message}\n${e.stderr}`);
    }

    const result = JSON.parse(output.trim());
    expect(result.isFunction).toBe(true);
  });

  it('should bundle with esbuild for CommonJS without breaking (backward compatibility)', () => {
    // Create a test entry file that requires from the CommonJS entry point
    const testCode = `
const api = require('${path.resolve(__dirname, '../index.js')}');

const app = api();

app.get('/test', (req, res) => {
  res.json({ message: 'Hello from CommonJS bundle' });
});

module.exports.handler = async (event, context) => {
  return await app.run(event, context);
};
`;

    fs.writeFileSync(testFilePath, testCode);

    const cjsBundlePath = path.join(tempDir, 'bundle-cjs.js');

    // Bundle with esbuild using CommonJS format (mark AWS SDK as external since they're peer dependencies)
    try {
      execSync(
        `npx esbuild ${testFilePath} --bundle --platform=node --format=cjs --outfile=${cjsBundlePath} --external:@aws-sdk/client-s3 --external:@aws-sdk/s3-request-presigner`,
        { cwd: path.resolve(__dirname, '..'), stdio: 'pipe' }
      );
    } catch (e) {
      throw new Error(`CommonJS bundling failed: ${e.message}`);
    }

    // Verify the bundle was created
    expect(fs.existsSync(cjsBundlePath)).toBe(true);

    // Test that the bundle executes without errors
    const testEvent = JSON.stringify({
      httpMethod: 'GET',
      path: '/test',
      headers: {},
      body: null,
      isBase64Encoded: false,
    });

    const testScript = `
const { handler } = require('${cjsBundlePath}');
const event = ${testEvent};
handler(event, {}).then(result => {
  console.log(JSON.stringify(result));
}).catch(err => {
  console.error(err.message);
  process.exit(1);
});
`;

    const scriptPath = path.join(tempDir, 'test-run-cjs.js');
    fs.writeFileSync(scriptPath, testScript);

    let output;
    try {
      output = execSync(`node ${scriptPath}`, {
        encoding: 'utf-8',
        cwd: tempDir,
      });
    } catch (e) {
      throw new Error(`CommonJS bundle execution failed: ${e.message}\n${e.stderr}`);
    }

    const result = JSON.parse(output.trim());

    // Verify the response
    expect(result).toHaveProperty('statusCode', 200);
    expect(result).toHaveProperty('headers');
    expect(result.headers).toHaveProperty('content-type', 'application/json');
    expect(result).toHaveProperty('body');

    const body = JSON.parse(result.body);
    expect(body).toEqual({ message: 'Hello from CommonJS bundle' });
  });
});
