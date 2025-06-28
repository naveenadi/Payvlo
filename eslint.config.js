import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [
	js.configs.recommended,
	{
		files: ['src/**/*.{ts,js}'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: 2022,
				sourceType: 'module',
				project: './tsconfig.json',
				tsconfigRootDir: __dirname
			},
			globals: {
				window: 'readonly',
				document: 'readonly',
				console: 'readonly'
			}
		},
		plugins: {
			'@typescript-eslint': ts
		},
		rules: {
			...ts.configs.recommended.rules,
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
			'@typescript-eslint/no-explicit-any': 'warn',
			'prefer-const': 'error'
		}
	},
	{
		files: ['*.config.{js,ts}', 'eslint.config.js'],
		languageOptions: {
			globals: {
				process: 'readonly',
				__dirname: 'readonly',
				__filename: 'readonly'
			}
		}
	},
	...svelte.configs['flat/recommended'],
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parser: svelte.parser,
			parserOptions: {
				parser: tsParser
			}
		}
	},
	prettier,
	{
		ignores: [
			'build/',
			'.svelte-kit/',
			'dist/',
			'src-tauri/target/',
			'src-tauri/gen/',
			'node_modules/',
			'.env',
			'.env.*',
			'!.env.example',
			'pnpm-lock.yaml',
			'package-lock.json',
			'yarn.lock'
		]
	}
];
