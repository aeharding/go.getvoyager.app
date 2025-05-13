import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("layout/Layout.tsx", [
    index("routes/home.tsx"),
    route("/:instance/*", "routes/go.tsx"),
  ]),
] satisfies RouteConfig;
