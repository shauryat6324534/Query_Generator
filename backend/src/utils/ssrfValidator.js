import dns from "dns/promises";

/**
 * Checks if an IP address belongs to loopback, private, link-local, or reserved ranges.
 * @param {string} ip 
 * @returns {boolean} True if the IP is private/local
 */
const isPrivateIp = (ip) => {
  if (!ip) return true;

  // Normalize IPv4-mapped IPv6 addresses (e.g. ::ffff:127.0.0.1)
  let cleanIp = ip.trim().toLowerCase();
  if (cleanIp.startsWith("::ffff:")) {
    const ipv4Candidate = ip.trim().substring(7);
    if (ipv4Candidate.split(".").length === 4) {
      ip = ipv4Candidate;
    }
  }
  
  // 1. Loopback addresses
  if (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("127.")) {
    return true;
  }
  
  // 2. Parse IPv4 ranges
  const parts = ip.split(".");
  if (parts.length === 4) {
    const o1 = parseInt(parts[0], 10);
    const o2 = parseInt(parts[1], 10);
    
    // 10.0.0.0/8 (Private Network)
    if (o1 === 10) return true;
    
    // 172.16.0.0/12 (Private Network)
    if (o1 === 172 && o2 >= 16 && o2 <= 31) return true;
    
    // 192.168.0.0/16 (Private Network)
    if (o1 === 192 && o2 === 168) return true;
    
    // 169.254.0.0/16 (Link-local, AWS/Cloud Metadata endpoints)
    if (o1 === 169 && o2 === 254) return true;
    
    // 0.0.0.0/8 (Broadcast/Any)
    if (o1 === 0) return true;
  }
  
  // 3. Parse IPv6 ranges
  if (ip.includes(":")) {
    const cleanIp = ip.toLowerCase().trim();
    // Unique Local (fc00::/7) or Link-local (fe80::/10) or Loopback (::1)
    if (
      cleanIp.startsWith("fc") ||
      cleanIp.startsWith("fd") ||
      cleanIp.startsWith("fe8") ||
      cleanIp.startsWith("fe9") ||
      cleanIp.startsWith("fea") ||
      cleanIp.startsWith("feb") ||
      cleanIp === "::" ||
      cleanIp === "::1"
    ) {
      return true;
    }
  }
  
  return false;
};

/**
 * Validates a hostname for SSRF protection and returns the resolved safe IP address.
 * Using the returned IP for connection prevents DNS Rebinding and TOCTOU attacks.
 * @param {string} host Hostname or IP to validate
 * @returns {Promise<string>} The resolved safe IP address
 */
export const validateAndResolveHost = async (host) => {
  if (!host) {
    throw new Error("Hostname parameter is required.");
  }
  
  const trimmed = host.trim().toLowerCase();
  
  if (trimmed === "localhost" || trimmed === "loopback") {
    throw new Error("Connection to local hosts is blocked for security reasons.");
  }
  
  try {
    // Resolve DNS hostname to IP address
    const lookupResult = await dns.lookup(trimmed);
    const resolvedIp = lookupResult.address;
    
    if (isPrivateIp(resolvedIp)) {
      throw new Error(`Connection to private or local network address (${resolvedIp}) is blocked.`);
    }
    
    return resolvedIp;
  } catch (error) {
    if (error.message.includes("blocked")) {
      throw error;
    }
    throw new Error(`Host resolution failed for '${host}': ${error.message}`);
  }
};
