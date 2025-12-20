import { useState, useEffect } from "react";
import axios from "axios";

// Function to get your public IPv4 address
async function getIP(url) {
  try {
    const response = await axios.get(url);
    return response.data.ip;
  } catch (error) {
    console.error("Error fetching IP address:", error);
    return null;
  }
}

// Function to get both IPv4 and IPv6 addresses
function GetIP() {
  const [ipv4, setIPv4] = useState(null);
  const [ipv4status, setIpv4Status] = useState("red");
  const [ipv6, setIPv6] = useState(null);
  const [ipv6status, setIpv6Status] = useState("red");

  useEffect(() => {
    async function fetchData() {
      const ipv4Address = await getIP("https://api.ipify.org?format=json");
      const ipv6Address = await getIP("https://api64.ipify.org?format=json");
      if (ipv4Address) {
        setIPv4(ipv4Address);
        setIpv4Status("green");
      }
      if (ipv6Address) {
        setIPv6(ipv6Address);
        setIpv6Status("green");
      }
    }
    fetchData();
  }, []);

  return { ipv4, ipv4status, ipv6, ipv6status };
}

export default GetIP;
