/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const ts=require('typescript');
const fs=require('node:fs');
const vm=require('node:vm');
const exportsForTest={};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/ai/errors.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:exportsForTest});
const {captionFailure}=exportsForTest;
test('unwraps provider status after SDK retry',()=>assert.equal(captionFailure({lastError:{statusCode:429}}).code,'AI_QUOTA'));
test('provider credentials and prompt never enter the diagnostic',()=>{const result=captionFailure({statusCode:403,message:'secret-key private-prompt',requestBody:'private-prompt',responseHeaders:{authorization:'secret-key'}});assert.equal(result.code,'AI_AUTH');assert.equal(JSON.stringify(result).includes('secret-key'),false);assert.equal(JSON.stringify(result).includes('private-prompt'),false)});
test('classifies invalid API keys even when Google returns 400',()=>assert.equal(captionFailure({statusCode:400,message:'API key not valid. Please pass a valid API key.'}).code,'AI_AUTH'));
test('handles timeout, unavailable model, and server errors',()=>{assert.equal(captionFailure({cause:{name:'TimeoutError'}}).code,'AI_TIMEOUT');assert.equal(captionFailure({statusCode:404}).code,'AI_MODEL');assert.equal(captionFailure({statusCode:503}).code,'AI_UNAVAILABLE')});
test('cycles and missing error details are bounded and safe',()=>{const error={};error.cause=error;assert.equal(captionFailure(error).code,'AI_UNKNOWN');assert.equal(captionFailure(null).code,'AI_UNKNOWN')});
