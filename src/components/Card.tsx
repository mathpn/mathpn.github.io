import { slugifyStr } from "@utils/slugify";
import Datetime from "./Datetime";
import type { PostCollectionEntry } from "types";

export interface Props {
  href?: string;
  frontmatter: PostCollectionEntry["data"];
  collection: string,
  secHeading?: boolean;
}

export default function Card({ href, frontmatter, collection, secHeading = true }: Props) {
  const { title, pubDatetime, modDatetime, description } = frontmatter;

  const latestDatetime = modDatetime || pubDatetime;
  let formattedTitle = title;
  if (collection == "til") {
    formattedTitle = `TIL ${latestDatetime.toISOString().split("T")[0]}: ${title}`
  }

  const headerProps = {
    style: { viewTransitionName: slugifyStr(title) },
    className: "text-xl sm:text-2xl font-medium decoration-dashed hover:underline",
  };

  return (
    <li className="my-6 sm:text-lg">
      <a
        href={href}
        className="inline-block text-lg font-medium text-skin-accent decoration-dashed underline-offset-4 focus-visible:no-underline focus-visible:underline-offset-0"
      >
        {secHeading ? (
          <h2 {...headerProps}>{formattedTitle}</h2>
        ) : (
          <h3 {...headerProps}>{formattedTitle}</h3>
        )}
      </a>
      <Datetime pubDatetime={pubDatetime} modDatetime={modDatetime} />
      <p>{description}</p>
    </li>
  );
}
