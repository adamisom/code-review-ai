import { THREAD_STATUS, THEME, DEFAULT_EDITOR_LANGUAGE, DEFAULT_EDITOR_THEME } from '../constants';

describe('constants', () => {
  it('should export THREAD_STATUS constants', () => {
    expect(THREAD_STATUS.ACTIVE).toBe('active');
    expect(THREAD_STATUS.RESOLVED).toBe('resolved');
  });

  it('should export THEME constants', () => {
    expect(THEME.DARK).toBe('vs-dark');
    expect(THEME.LIGHT).toBe('vs-light');
  });

  it('should export default values', () => {
    expect(DEFAULT_EDITOR_LANGUAGE).toBe('typescript');
    expect(DEFAULT_EDITOR_THEME).toBe(THEME.DARK);
  });
});

