/**
 * Test setup file
 *
 * Global test configuration and mocks
 */
import { beforeEach, vi } from 'vitest';
// Mock React Native modules
vi.mock('react-native', () => ({
    Platform: {
        OS: 'ios',
        select: vi.fn((config) => config.ios),
    },
    Dimensions: {
        get: vi.fn(() => ({ width: 375, height: 812 })),
    },
    Alert: {
        alert: vi.fn(),
    },
    Share: {
        share: vi.fn(),
    },
}));
// Mock react-native-share
vi.mock('react-native-share', () => ({
    default: {
        open: vi.fn(),
    },
}));
// Mock react-native-fs
vi.mock('react-native-fs', () => ({
    LibraryDirectoryPath: '/mock/library',
    DocumentDirectoryPath: '/mock/documents',
    exists: vi.fn(),
    mkdir: vi.fn(),
    readFile: vi.fn(),
    writeFile: vi.fn(),
    appendFile: vi.fn(),
    readDir: vi.fn(),
    stat: vi.fn(),
    unlink: vi.fn(),
    moveFile: vi.fn(),
}));
// Setup global test environment
beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    // Reset console methods to avoid noise in tests
    vi.spyOn(console, 'error').mockImplementation(() => { });
    vi.spyOn(console, 'warn').mockImplementation(() => { });
    vi.spyOn(console, 'log').mockImplementation(() => { });
});
//# sourceMappingURL=setup.js.map