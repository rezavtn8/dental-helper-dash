// Basic tests for taskUtils
// Note: Replace with proper testing framework when configured

import {
  getPriorityLabel,
  getPriorityStyles,
  getDueText,
  isDueToday,
  getUserInitials,
  filterTasks,
  calculateTaskStats
} from '../taskUtils.js';

// Mock console for tests
const originalConsole = console;
console = { ...console, log: () => {}, error: () => {} };

// Basic test runner
function runTests() {
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`✅ ${name}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${name}: ${error.message}`);
      failed++;
    }
  }

  function assertEqual(actual, expected, message = '') {
    if (actual !== expected) {
      throw new Error(`Expected ${expected}, got ${actual}. ${message}`);
    }
  }

  // Mock task data
  const mockTask = {
    id: '1',
    title: 'Test Task',
    description: 'Test description',
    status: 'pending',
    priority: 'medium',
    'due-type': 'morning',
    assigned_to: 'user-1',
    created_by: 'owner-1',
    clinic_id: 'clinic-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Priority utilities tests
  test('getPriorityLabel - should return capitalized priority label', () => {
    assertEqual(getPriorityLabel('high'), 'High');
    assertEqual(getPriorityLabel('low'), 'Low');
    assertEqual(getPriorityLabel(), 'Medium');
  });

  test('getPriorityStyles - should return correct styles', () => {
    assertEqual(getPriorityStyles('high'), 'bg-red-100 text-red-700 border-red-200');
    assertEqual(getPriorityStyles('medium'), 'bg-yellow-100 text-yellow-700 border-yellow-200');
    assertEqual(getPriorityStyles('low'), 'bg-green-100 text-green-700 border-green-200');
  });

  // Due date utilities tests
  test('getDueText - should return correct due text', () => {
    assertEqual(getDueText({ ...mockTask, 'due-type': 'morning' }), 'Due Morning');
    assertEqual(getDueText({ ...mockTask, 'due-type': 'afternoon' }), 'Due Afternoon');
    assertEqual(getDueText({ ...mockTask, 'due-type': 'none' }), 'No due date');
  });

  test('isDueToday - should return true for standard due types', () => {
    assertEqual(isDueToday({ ...mockTask, 'due-type': 'morning' }), true);
    assertEqual(isDueToday({ ...mockTask, 'due-type': 'none' }), false);
  });

  // User utilities tests
  test('getUserInitials - should return correct initials', () => {
    assertEqual(getUserInitials('John Doe'), 'JD');
    assertEqual(getUserInitials('Jane'), 'J');
    assertEqual(getUserInitials(''), 'U');
    assertEqual(getUserInitials(), 'U');
  });

  // Filtering tests
  test('filterTasks - should filter by search term', () => {
    const tasks = [
      { ...mockTask, id: '1', title: 'First Task' },
      { ...mockTask, id: '2', title: 'Second Task' }
    ];
    const filtered = filterTasks(tasks, { searchTerm: 'First' });
    assertEqual(filtered.length, 1);
    assertEqual(filtered[0].title, 'First Task');
  });

  test('filterTasks - should filter by status', () => {
    const tasks = [
      { ...mockTask, id: '1', status: 'pending' },
      { ...mockTask, id: '2', status: 'completed' }
    ];
    const filtered = filterTasks(tasks, { statusFilter: 'pending' });
    assertEqual(filtered.length, 1);
    assertEqual(filtered[0].status, 'pending');
  });

  // Statistics tests
  test('calculateTaskStats - should calculate correct stats', () => {
    const tasks = [
      { ...mockTask, id: '1', status: 'pending', assigned_to: null },
      { ...mockTask, id: '2', status: 'completed' },
      { ...mockTask, id: '3', status: 'in-progress' }
    ];
    const stats = calculateTaskStats(tasks);
    assertEqual(stats.total, 3);
    assertEqual(stats.pending, 1);
    assertEqual(stats.completed, 1);
    assertEqual(stats.inProgress, 1);
    assertEqual(stats.unassigned, 1);
  });

  // Summary
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed > 0) {
    throw new Error(`${failed} tests failed`);
  }
}

// Export for potential use
export { runTests };

// Auto-run tests if this file is executed directly
if (typeof window === 'undefined' && typeof process !== 'undefined') {
  runTests();
}