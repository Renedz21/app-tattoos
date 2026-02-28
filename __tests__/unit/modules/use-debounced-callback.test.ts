import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebouncedCallback } from "@/modules/hooks/use-debounce";

describe("useDebouncedCallback", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns a stable function reference", () => {
    const callback = vi.fn();
    const { result, rerender } = renderHook(() =>
      useDebouncedCallback(callback, 300),
    );

    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it("does not invoke the callback immediately", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    act(() => {
      result.current("arg1");
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("invokes the callback after the delay elapses", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    act(() => {
      result.current("hello");
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("hello");
  });

  it("does not invoke the callback before the delay elapses", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    act(() => {
      result.current();
    });

    act(() => {
      vi.advanceTimersByTime(499);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("resets the timer on each call (debounce behaviour)", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    act(() => {
      result.current("first");
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    act(() => {
      result.current("second");
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("second");
  });

  it("invokes the callback only once after rapid successive calls", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    act(() => {
      result.current(1);
      result.current(2);
      result.current(3);
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(3);
  });

  it("forwards all arguments to the callback", () => {
    const callback = vi.fn();
    const { result } = renderHook(() =>
      useDebouncedCallback(callback, 100),
    );

    act(() => {
      result.current("a", "b", "c");
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(callback).toHaveBeenCalledWith("a", "b", "c");
  });

  it("uses 400ms as the default delay when none is provided", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback));

    act(() => {
      result.current();
    });

    act(() => {
      vi.advanceTimersByTime(399);
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("always invokes the latest version of the callback", () => {
    const firstCallback = vi.fn();
    const secondCallback = vi.fn();

    let cb = firstCallback;
    const { result, rerender } = renderHook(() =>
      useDebouncedCallback(cb, 300),
    );

    act(() => {
      result.current();
    });

    cb = secondCallback;
    rerender();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(firstCallback).not.toHaveBeenCalled();
    expect(secondCallback).toHaveBeenCalledTimes(1);
  });

  it("does not fire after the hook is unmounted", () => {
    const callback = vi.fn();
    const { result, unmount } = renderHook(() =>
      useDebouncedCallback(callback, 300),
    );

    act(() => {
      result.current();
    });

    unmount();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("can be called multiple times across separate debounce windows", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 200));

    act(() => {
      result.current("first-window");
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    act(() => {
      result.current("second-window");
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(1, "first-window");
    expect(callback).toHaveBeenNthCalledWith(2, "second-window");
  });

  it("handles a delay of 0ms", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 0));

    act(() => {
      result.current("immediate");
    });

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(callback).toHaveBeenCalledWith("immediate");
  });
});
