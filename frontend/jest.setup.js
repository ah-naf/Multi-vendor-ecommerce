// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// MSW setup
import { server } from './src/mocks/server'; // Path to MSW server

// Establish API mocking before all tests.
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' })); // Log unhandled requests as warnings

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => server.close());
