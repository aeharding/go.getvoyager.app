// Simple in-memory cache for Lemmy instance verification
const instanceCache = new Map<string, boolean>();

interface NodeInfoLinks {
  links: Array<{
    rel: string;
    href: string;
  }>;
}

interface NodeInfo {
  software: {
    name: string;
    version: string;
  };
}

/**
 * Checks if a given domain is a Lemmy instance by querying its nodeinfo endpoint
 * @param domain The domain to check (e.g. 'lemmy.world')
 * @returns Promise<boolean> True if the domain is a Lemmy instance
 */
export async function determineIsLemmyInstance(
  normalizedHost: string,
): Promise<boolean> {
  // Check cache first
  const cachedResult = instanceCache.get(normalizedHost);
  if (cachedResult !== undefined) {
    return cachedResult;
  }

  try {
    // First, get the nodeinfo links
    const response = await fetch(
      `https://${normalizedHost}/.well-known/nodeinfo`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      instanceCache.set(normalizedHost, false);
      return false;
    }

    const nodeInfoLinks: NodeInfoLinks = await response.json();

    // Find the 2.1 schema link
    const nodeInfoLink = nodeInfoLinks.links.find(
      (link) => link.rel === "http://nodeinfo.diaspora.software/ns/schema/2.1",
    );

    if (!nodeInfoLink) {
      instanceCache.set(normalizedHost, false);
      return false;
    }

    // Fetch the actual nodeinfo data
    const nodeInfoResponse = await fetch(nodeInfoLink.href, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!nodeInfoResponse.ok) {
      instanceCache.set(normalizedHost, false);
      return false;
    }

    const nodeInfo: NodeInfo = await nodeInfoResponse.json();

    // Check if it's a Lemmy instance
    const isLemmy = nodeInfo.software.name.toLowerCase() === "lemmy";

    // Cache the result
    instanceCache.set(normalizedHost, isLemmy);

    return isLemmy;
  } catch (error) {
    // If there's an error (e.g., network error, invalid domain), cache as false
    instanceCache.set(normalizedHost, false);
    return false;
  }
}

/**
 * Clears the instance verification cache
 * Useful for testing or if you need to force re-verification
 */
export function clearInstanceCache(): void {
  instanceCache.clear();
}
