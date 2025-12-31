import React from "react";
import { render, waitFor, screen } from "@testing-library/react";

jest.mock("axios", () => {
  const get = jest.fn();
  return { __esModule: true, default: { get }, get };
});
import axios from "axios";
import GetIP from "../api/getIp";

function TestComponent() {
  const { ipv4, ipv4status, ipv6, ipv6status } = GetIP();
  return (
    <div>
      <span data-testid="ipv4">{ipv4}</span>
      <span data-testid="ipv4status">{ipv4status}</span>
      <span data-testid="ipv6">{ipv6}</span>
      <span data-testid="ipv6status">{ipv6status}</span>
    </div>
  );
}

describe("GetIP", () => {
  it("sets both IPs to green after successful fetches", async () => {
    axios.get
      .mockResolvedValueOnce({ data: { ip: "1.1.1.1" } })
      .mockResolvedValueOnce({ data: { ip: "::1" } });

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId("ipv4").textContent).toBe("1.1.1.1");
      expect(screen.getByTestId("ipv6").textContent).toBe("::1");
      expect(screen.getByTestId("ipv4status").textContent).toBe("green");
      expect(screen.getByTestId("ipv6status").textContent).toBe("green");
    });
  });
});
