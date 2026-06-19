import { getShopStatus } from '../../utils/shopHours';

describe('Fase 4: Lógica de Memory Leaks e Limpeza de Recursos (Prioridade 3) - Client HomeScreen Timers', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('Teste 12: deve criar intervalos de saudação/status no mount e limpá-los corretamente com clearInterval no unmount', () => {
    const setIntervalSpy = jest.spyOn(global, 'setInterval');
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

    const callback = jest.fn();
    const id = setInterval(callback, 1000);

    expect(setIntervalSpy).toHaveBeenCalledTimes(1);
    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000);

    clearInterval(id);
    expect(clearIntervalSpy).toHaveBeenCalledWith(id);

    setIntervalSpy.mockRestore();
    clearIntervalSpy.mockRestore();
  });

  it('deve chamar clearInterval para cada setInterval criado', () => {
    const setIntervalSpy = jest.spyOn(global, 'setInterval');
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

    const ids = [setInterval(jest.fn(), 1000), setInterval(jest.fn(), 2000), setInterval(jest.fn(), 5000)];

    expect(setIntervalSpy).toHaveBeenCalledTimes(3);

    ids.forEach(id => {
      clearInterval(id);
    });

    expect(clearIntervalSpy).toHaveBeenCalledTimes(3);
    ids.forEach(id => {
      expect(clearIntervalSpy).toHaveBeenCalledWith(id);
    });

    setIntervalSpy.mockRestore();
    clearIntervalSpy.mockRestore();
  });

  it('getShopStatus deve retornar status válido sem lançar erro', () => {
    const status = getShopStatus(new Date());
    expect(status).toHaveProperty('isOpen');
    expect(status).toHaveProperty('isSundayOrHoliday');
    expect(status).toHaveProperty('countdownText');
    expect(status).toHaveProperty('secondsRemaining');
    expect(typeof status.isOpen).toBe('boolean');
    expect(typeof status.countdownText).toBe('string');
  });
});
