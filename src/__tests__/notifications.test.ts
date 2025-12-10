import { showToast } from '../utils/notifications';

describe('notifications.showToast', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('cria container e exibe toast', () => {
    showToast('Olá mundo', 'info', 500);
    const container = document.getElementById('toast-container');
    expect(container).toBeTruthy();
    expect(container!.querySelectorAll('.toast').length).toBeGreaterThan(0);
  });
});
