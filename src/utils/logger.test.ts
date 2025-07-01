// logger.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { saveLog } from './logger';
import { Config } from '../config/config';

// Mock the dependencies
vi.mock('fs');
vi.mock('../config/config', () => ({
  Config: {
    logDir: '/test/logs',
    nodeEnv: 'test'
  }
}));

describe('saveLog', () => {
  const mockFs = vi.mocked(fs);
  
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Mock fs.existsSync to return true (directory exists)
    mockFs.existsSync.mockReturnValue(true);
    
    // Mock fs.appendFileSync to not throw
    mockFs.appendFileSync.mockImplementation(() => {});
    
    // Mock console.log to avoid cluttering test output
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create new log file when day changes', () => {
    // Mock Date to simulate day change
    const mockDate1 = new Date('2024-01-15T10:00:00.000Z'); // Monday (day 1)
    const mockDate2 = new Date('2024-01-16T10:00:00.000Z'); // Tuesday (day 2)
    
    // First, mock the initial date
    vi.setSystemTime(mockDate1);
    
    // Create logger instance
    const logger = saveLog();
    
    // Log something to initialize the first log file
    logger.info('First message');
    
    // Verify first log file was created with correct name
    const expectedFileName1 = `app-${mockDate1.toISOString().split('T')[0]}.log`;
    const expectedPath1 = path.join(Config.logDir, expectedFileName1);
    
    expect(mockFs.appendFileSync).toHaveBeenCalledWith(
      expectedPath1,
      expect.stringContaining('First message')
    );
    
    // Clear the mock calls to track new ones
    mockFs.appendFileSync.mockClear();
    vi.mocked(console.log).mockClear();
    
    // Now simulate day change
    vi.setSystemTime(mockDate2);
    
    // Log another message - this should trigger new log file creation
    logger.info('Second message after day change');
    
    // Verify new log file was created with new date
    const expectedFileName2 = `app-${mockDate2.toISOString().split('T')[0]}.log`;
    const expectedPath2 = path.join(Config.logDir, expectedFileName2);
    
    expect(mockFs.appendFileSync).toHaveBeenCalledWith(
      expectedPath2,
      expect.stringContaining('Second message after day change')
    );
    
    // Verify that the file names are different
    expect(expectedFileName1).not.toBe(expectedFileName2);
    expect(expectedPath1).not.toBe(expectedPath2);
  });
});