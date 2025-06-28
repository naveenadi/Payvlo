import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Tauri API for testing
const mockTauri = {
	invoke: vi.fn()
};

vi.mock('@tauri-apps/api/tauri', () => mockTauri);

// Set up global test environment
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: vi.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn()
	}))
});
