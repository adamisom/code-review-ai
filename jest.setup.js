// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock react-markdown
jest.mock('react-markdown', () => {
  return function MockReactMarkdown({ children }) {
    return children;
  };
});

