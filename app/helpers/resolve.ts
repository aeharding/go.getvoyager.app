import {
  LemmyHttp,
  type LemmyErrorType,
  type ResolveObjectResponse,
} from "lemmy-js-client";
import TTLCache from "@isaacs/ttlcache";

// Cache for resolved objects with 15-minute TTL
const resolveCache = new TTLCache<string, Promise<ResolveObjectResponse>>({
  ttl: 1000 * 60 * 15, // 15 minutes in milliseconds
});

export const POST_PATH = /^\/post\/(\d+)$/;

export const COMMENT_PATH = /^\/comment\/(\d+)$/;

export const LEMMY_CLIENT_HEADERS = {
  "User-Agent": "go.getvoyager.app",
} as const;

/**
 * Lemmy 0.19.4 added a new url format to reference comments,
 * in addition to `COMMENT_PATH`.
 *
 * It is functionally exactly the same. IDK why
 *
 * https://github.com/LemmyNet/lemmy-ui/commit/b7fe70d8c15fe8c8482c8403744f24f63d1c505a#diff-13e07e23177266e419a34a839636bcdbd2f6997000fb8e0f3be26c78400acf77R145
 */
export const COMMENT_VIA_POST_PATH = /^\/post\/\d+\/(\d+)$/;

export const USER_PATH =
  /^\/u\/([a-zA-Z0-9._%+-]+(@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})?)\/?$/;
export const COMMUNITY_PATH =
  /^\/c\/([a-zA-Z0-9._%+-]+(@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})?)\/?$/;

const POTENTIAL_PATHS = [
  POST_PATH,
  COMMENT_PATH,
  COMMENT_VIA_POST_PATH,
  USER_PATH,
  COMMUNITY_PATH,
] as const;

/*
 * This file is needed for a migration to lemmy v1
 *
 * After Voyager requires v1, this file can be removed
 */

export function getApId(obj: { actor_id: string }): string;
export function getApId(obj: { ap_id: string }): string;
export function getApId(
  obj: { actor_id: string } | undefined,
): string | undefined;
export function getApId(obj: { ap_id: string } | undefined): string | undefined;
export function getApId(obj: undefined): undefined;
export function getApId(
  obj: { ap_id?: string } | { actor_id?: string } | undefined,
): string | undefined {
  if (!obj) return;
  if ("ap_id" in obj) return obj.ap_id;
  if ("actor_id" in obj) return obj.actor_id;
}

export function matchLemmyCommunity(
  urlPathname: string,
): [string, string] | [string] | null {
  const matches = urlPathname.match(COMMUNITY_PATH);
  if (matches && matches[1]) {
    const [communityName, domain] = matches[1].split("@");
    if (!domain) return [communityName!];
    return [communityName!, domain];
  }
  return null;
}

export function matchLemmyUser(
  urlPathname: string,
): [string, string] | [string] | null {
  const matches = urlPathname.match(USER_PATH);
  if (matches && matches[1]) {
    const [userName, domain] = matches[1].split("@");
    if (!domain) return [userName!];
    return [userName!, domain];
  }
  return null;
}

function isPotentialObjectPath(urlPathname: string): boolean {
  for (const regex of POTENTIAL_PATHS) {
    if (regex.test(urlPathname)) return true;
  }

  return false;
}

function getObjectName(urlPathname: string): string | undefined {
  if (POST_PATH.test(urlPathname)) return "post";
  if (COMMENT_PATH.test(urlPathname)) return "comment";
  if (COMMENT_VIA_POST_PATH.test(urlPathname)) return "comment";
  if (USER_PATH.test(urlPathname)) return "user";
  if (COMMUNITY_PATH.test(urlPathname)) return "community";
}

const FALLBACK_RESOLVE_INSTANCE = "lemm.ee";

/**
 * Internal implementation of resolveObject without caching.
 * This is the actual logic that makes the API calls.
 */
async function _resolveObjectUncached(
  url: string,
  resolveInstance?: string,
): Promise<ResolveObjectResponse> {
  let object;

  const client = new LemmyHttp(
    buildInstanceUrl(resolveInstance ?? getHostname(normalizeObjectUrl(url))),
    { headers: LEMMY_CLIENT_HEADERS },
  );

  try {
    object = await client.resolveObject({
      q: url,
    });
  } catch (error) {
    if (
      // TODO START lemmy 0.19 and less support
      isLemmyError(error, "couldnt_find_object" as never) ||
      isLemmyError(error, "couldnt_find_post" as never) ||
      isLemmyError(error, "couldnt_find_comment" as never) ||
      isLemmyError(error, "couldnt_find_person" as never) ||
      isLemmyError(error, "couldnt_find_community" as never) ||
      // TODO END
      isLemmyError(error, "not_found" as never)
    ) {
      const fedilink = await findFedilink(url);

      if (!fedilink) {
        throw new Error("Could not find fedilink");
      }

      object = await client.resolveObject({
        q: fedilink,
      });
    } else {
      throw error;
    }
  }

  return object;
}

/**
 * Resolves a Lemmy object URL, with caching to prevent duplicate API calls.
 * The cache has a 15-minute TTL.
 */
export const resolveObject = async (
  url: string,
  resolveInstance?: string,
): Promise<ResolveObjectResponse> => {
  const normalizedUrl = normalizeObjectUrl(url);

  // Check cache first
  const cached = resolveCache.get(normalizedUrl);
  if (cached) return cached;

  // Create new promise and cache it
  const promise = _resolveObjectUncached(url, resolveInstance);
  resolveCache.set(normalizedUrl, promise);
  return promise;
};

/**
 * FINE. we'll do it the hard/insecure way and ask original instance >:(
 * the below code should not need to exist.
 */
async function findFedilink(url: string): Promise<string | undefined> {
  const { hostname, pathname } = new URL(normalizeObjectUrl(url));

  const client = new LemmyHttp(buildInstanceUrl(hostname), {
    headers: LEMMY_CLIENT_HEADERS,
  });

  const potentialCommentId = findCommentIdFromUrl(pathname);

  if (typeof potentialCommentId === "number") {
    const response = await client.getComment({
      id: potentialCommentId,
    });

    return response.comment_view.comment.ap_id;
  } else if (POST_PATH.test(pathname)) {
    const response = await client.getPost({
      id: +pathname.match(POST_PATH)![1]!,
    });

    return response.post_view.post.ap_id;
  } else if (matchLemmyUser(pathname)) {
    const [username, userHostname] = matchLemmyUser(pathname)!;

    const response = await new LemmyHttp(
      buildInstanceUrl(userHostname ?? hostname),
      { headers: LEMMY_CLIENT_HEADERS },
    ).getPersonDetails({
      username,
    });

    return getApId(response.person_view.person);
  } else if (matchLemmyCommunity(pathname)) {
    const [community, communityHostname] = matchLemmyCommunity(pathname)!;

    const response = await new LemmyHttp(
      buildInstanceUrl(communityHostname ?? hostname),
      { headers: LEMMY_CLIENT_HEADERS },
    ).getCommunity({
      name: community,
    });

    return getApId(response.community_view.community);
  }
}

function findCommentIdFromUrl(pathname: string): number | undefined {
  if (COMMENT_PATH.test(pathname)) return +pathname.match(COMMENT_PATH)![1]!;
  if (COMMENT_VIA_POST_PATH.test(pathname))
    return +pathname.match(COMMENT_VIA_POST_PATH)![1]!;
}

export function normalizeObjectUrl(objectUrl: string) {
  let url = objectUrl;

  // Replace app schema "vger" with "https"
  url = url.replace(/^vger:\/\//, "https://");

  // Strip fragment
  url = url.split("#")[0]!;

  // Strip query parameters
  url = url.split("?")[0]!;

  return url;
}

export function buildInstanceUrl(instance: string) {
  return `https://${instance}`;
}

export function isLemmyError(
  error: unknown,
  lemmyErrorValue: LemmyErrorType["error"],
) {
  if (!(error instanceof Error)) return;
  return error.message === lemmyErrorValue;
}

export function getHostname(url: string) {
  return new URL(url).hostname;
}
