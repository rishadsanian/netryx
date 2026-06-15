import React from "react";
import { render, screen, act } from "@testing-library/react";

const mockClose = jest.fn();

jest.mock("websocket", () => {
  let socket;

  function createSocket() {
    socket = {
      onopen: null,
      onmessage: null,
      onclose: null,
      onerror: null,
      readyState: 0,
      send: jest.fn(),
      close: jest.fn(() => {
        mockClose();
        if (this.onclose) this.onclose();
      }),
      triggerOpen() {
        if (this.onopen) this.onopen();
      },
      triggerMessage(data) {
        if (this.onmessage) this.onmessage({ data });
      },
    };

    return socket;
  }

  return {
    __esModule: true,
    w3cwebsocket: jest.fn().mockImplementation(createSocket),
    __getSocket: () => socket,
  };
});

import { w3cwebsocket } from "websocket";
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

const getMockSocket = () =>
  w3cwebsocket.mock.results[0]?.value || w3cwebsocket.mock.instances[0];

describe("PacketLatency", () => {
  beforeEach(() => {
    jest.useRealTimers();
    mockClose.mockClear();
    w3cwebsocket.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("turns green on message, charts points, then marks red when stale", async () => {
    jest.useFakeTimers();
    render(<TestComponent />);

    await act(async () => Promise.resolve());

    expect(w3cwebsocket).toHaveBeenCalledWith("ws://localhost:55455");
    expect(typeof getMockSocket().onopen).toBe("function");
    expect(typeof getMockSocket().onmessage).toBe("function");

    const mockSocket = getMockSocket();
    mockSocket.close = jest.fn(mockClose);
    mockSocket.send = jest.fn();
    act(() => {
      mockSocket.readyState = 1;
      mockSocket.onopen();
      const ping = JSON.parse(mockSocket.send.mock.calls[0][0]);
      mockSocket.onmessage({
        data: JSON.stringify({ ...ping, sentAt: Date.now() - 10 }),
      });
    });

    expect(screen.getByTestId("status").textContent).toBe("green");
    expect(screen.getByTestId("latency").textContent).toBe("10");
    expect(mockSocket.send).toHaveBeenCalledWith(
      expect.stringContaining('"type":"latency-ping"')
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByTestId("points").textContent).toBe("1");
    expect(screen.getByTestId("labels").textContent).toBe("1");

    act(() => {
      jest.advanceTimersByTime(6000);
    });

    expect(screen.getByTestId("status").textContent).toBe("red");
    expect(screen.getByTestId("latency").textContent).toBe("");
    expect(mockClose).toHaveBeenCalled();
    expect(mockSocket.close).toHaveBeenCalled();
  });
});
