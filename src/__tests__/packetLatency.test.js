import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";

const mockClose = jest.fn();

jest.mock("websocket", () => {
  const socket = {
    onopen: null,
    onmessage: null,
    onclose: null,
    onerror: null,
    close: jest.fn(() => {
      mockClose();
      if (socket.onclose) socket.onclose();
    }),
    triggerOpen() {
      if (this.onopen) this.onopen();
    },
    triggerMessage(data) {
      if (this.onmessage) this.onmessage({ data });
    },
  };

  return {
    __esModule: true,
    w3cwebsocket: jest.fn(() => socket),
    __socket: socket,
  };
});

import { w3cwebsocket, __socket as mockSocket } from "websocket";
import PacketLatency from "../api/packetLatency";

function TestComponent() {
  const { latency, latencyStatus, labels, displayLatency } = PacketLatency();
  return (
    <div>
      <span data-testid="status">{latencyStatus}</span>
      <span data-testid="latency">{latency ?? ""}</span>
      <span data-testid="labels">{labels.length}</span>
      <span data-testid="points">{displayLatency.length}</span>
    </div>
  );
}

describe("PacketLatency", () => {
  beforeEach(() => {
    jest.useRealTimers();
    mockClose.mockClear();
    mockSocket.onopen = null;
    mockSocket.onmessage = null;
    mockSocket.onclose = null;
    mockSocket.onerror = null;
    mockSocket.close.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("turns green on message, charts points, then marks red when stale", async () => {
    const now = Date.now();
    render(<TestComponent />);

    await act(async () => Promise.resolve());

    await waitFor(() => {
      expect(w3cwebsocket).toHaveBeenCalled();
      expect(typeof mockSocket.onopen).toBe("function");
      expect(typeof mockSocket.onmessage).toBe("function");
    });

    act(() => {
      mockSocket.triggerOpen();
      mockSocket.triggerMessage(`${now - 10}`);
    });

    await waitFor(() => {
      expect(screen.getByTestId("status").textContent).toBe("green");
      expect(screen.getByTestId("latency").textContent).toBe("10");
    });

    jest.useFakeTimers();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.getByTestId("points").textContent).toBe("1");
      expect(screen.getByTestId("labels").textContent).toBe("1");
    });

    act(() => {
      jest.advanceTimersByTime(6000);
    });

    await waitFor(() => {
      expect(screen.getByTestId("status").textContent).toBe("red");
      expect(screen.getByTestId("latency").textContent).toBe("");
      expect(mockClose).toHaveBeenCalled();
      expect(mockSocket.close).toHaveBeenCalled();
    });
  });
});
