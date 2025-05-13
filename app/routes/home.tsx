import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import CreateLink from "~/create/CreateLink";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Share a Lemmy link with Voyager" },
    { name: "description", content: "Share a Lemmy link with Voyager" },
  ];
}

export default function Home() {
  return (
    <>
      <Welcome />
      <CreateLink />
    </>
  );
}
