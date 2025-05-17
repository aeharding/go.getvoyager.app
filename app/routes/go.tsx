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

  return (
    <>
      <link rel="canonical" href={link} />
      <About url={link} />
      <Preview data={loaderData} url={link} />
      <Actions url={link} />
    </>
  );
}

function resolveInstanceUrlFromParams(params: Route.LoaderArgs["params"]) {
  return buildInstanceUrl(params.instance);
}

function resolveQFromParams(params: Route.LoaderArgs["params"]) {
  return `${resolveInstanceUrlFromParams(params)}/${params["*"]}`;
}
