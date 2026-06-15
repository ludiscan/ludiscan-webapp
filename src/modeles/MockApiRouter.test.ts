import { matchPath } from './MockApiRouter';

describe('matchPath', () => {
  test('returns null when patterns array is empty', () => {
    expect(matchPath('/api/v1/health', [])).toBeNull();
  });

  test('matches a simple static path', () => {
    const match = matchPath('/api/v1/health', ['/api/v1/health', '/api/v2/health']);
    expect(match).toEqual({
      pattern: '/api/v1/health',
      params: {},
    });
  });

  test('matches a path with a string parameter', () => {
    const match = matchPath('/users/jules', ['/users/{username}']);
    expect(match).toEqual({
      pattern: '/users/{username}',
      params: { username: 'jules' },
    });
  });

  test('matches a path with a numeric parameter and parses it as a number', () => {
    const match = matchPath('/items/42', ['/items/{id}']);
    expect(match).toEqual({
      pattern: '/items/{id}',
      params: { id: 42 },
    });
  });

  test('matches a path with multiple parameters of mixed types', () => {
    const match = matchPath('/projects/123/tasks/abc-456', ['/projects/{projectId}/tasks/{taskId}']);
    expect(match).toEqual({
      pattern: '/projects/{projectId}/tasks/{taskId}',
      params: { projectId: 123, taskId: 'abc-456' },
    });
  });

  test('returns null when no pattern matches', () => {
    expect(matchPath('/users/jules/settings', ['/users/{username}', '/settings'])).toBeNull();
  });

  test('returns null when the path does not match exactly (extra trailing segments)', () => {
    expect(matchPath('/items/42/details', ['/items/{id}'])).toBeNull();
  });

  test('returns null when the path does not match exactly (extra leading segments)', () => {
    expect(matchPath('/api/items/42', ['/items/{id}'])).toBeNull();
  });

  test('returns the first match when multiple patterns are provided', () => {
    const match = matchPath('/users/admin', ['/users/{role}', '/users/{username}']);
    expect(match).toEqual({
      pattern: '/users/{role}',
      params: { role: 'admin' },
    });
  });
});
