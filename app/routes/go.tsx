import { buildInstanceUrl, resolveObject } from "~/helpers/resolve";
import type { Route } from "./+types/go";

import { type ResolveObjectResponse } from "lemmy-js-client";
import Preview from "~/go/preview/Preview";
import Actions from "~/go/Actions";
import About from "~/go/About";
import { determineIsLemmyInstance } from "~/services/lemmy";

export async function loader({ params }: Route.LoaderArgs) {
  const isLemmyInstance = await determineIsLemmyInstance(params.instance);

  return await resolveObject(
    resolveQFromParams(params),
    isLemmyInstance ? undefined : "lemm.ee",
  );
}

export default function Go({ loaderData, params }: Route.ComponentProps) {
  const link = resolveQFromParams(params);
  const image = getImage(loaderData);

  return (
    <>
      <title>{getTitle(loaderData)}</title>
      <link rel="canonical" href={link} />
      {image && <meta property="og:image" content={image} />}
      <About url={link} />
      <Preview data={loaderData} url={link} />
      <Actions url={link} />
    </>
  );
}

function getTitle(resolved: ResolveObjectResponse) {
  switch (true) {
    case !!resolved.post:
      return resolved.post.post.name;
    case !!resolved.comment:
      return resolved.comment.comment.content;
    case !!resolved.community:
      return resolved.community.community.name;
    case !!resolved.person:
      return resolved.person.person.name;
  }
}

function getImage(resolved: ResolveObjectResponse) {
  switch (true) {
    case !!resolved.post:
      return resolved.post.post.thumbnail_url;
    case !!resolved.community:
      return resolved.community.community.icon;
    case !!resolved.person:
      return resolved.person.person.avatar;
  }
}

function resolveInstanceUrlFromParams(params: Route.LoaderArgs["params"]) {
  return buildInstanceUrl(params.instance);
}

function resolveQFromParams(params: Route.LoaderArgs["params"]) {
  return `${resolveInstanceUrlFromParams(params)}/${params["*"]}`;
}
