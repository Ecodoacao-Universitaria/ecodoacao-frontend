/* eslint-disable @typescript-eslint/no-var-requires */
require('@testing-library/jest-dom');

// Polyfills utilitários para ambiente de teste
if (typeof global.atob !== 'function') {
	global.atob = (str) => Buffer.from(String(str), 'base64').toString('binary');
}
if (typeof global.btoa !== 'function') {
	global.btoa = (str) => Buffer.from(String(str), 'binary').toString('base64');
}
