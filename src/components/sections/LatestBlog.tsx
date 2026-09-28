// components/sections/LatestBlog.tsx
import { getPageMap } from "nextra/page-map";
import type { MdxFile, PageMapItem } from "nextra";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface LatestBlogProps {
  heading?: string;
  className?: string;
}

function isMdxFile(item: PageMapItem): item is MdxFile {
  return !("children" in item) && !("data" in item);
}

async function getLatestPost() {
  const blogPageMap = await getPageMap("/blog");
  const posts = blogPageMap.filter(isMdxFile);

  return posts.sort((a, b) => {
    const dateA = a.frontMatter?.date ? new Date(a.frontMatter.date).getTime() : 0;
    const dateB = b.frontMatter?.date ? new Date(b.frontMatter.date).getTime() : 0;
    return dateB - dateA;
  })[0];
}

const LatestBlog = async ({
  heading = "Latest Writing",
  className,
}: LatestBlogProps) => {
  const latestPost = await getLatestPost();
  if (!latestPost) return null;

  const title = latestPost.frontMatter?.title ?? latestPost.name;
  const date = latestPost.frontMatter?.date
    ? new Date(latestPost.frontMatter.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <section className={cn("py-24", className)} aria-labelledby="latest-blog-heading">
      <div className="container mx-auto max-w-7xl px-8">
        <div className="rounded-xl bg-accent px-8 py-12 md:px-12 md:py-16">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            {/* Text */}
            <div className="max-w-2xl">
              <h2
                id="latest-blog-heading"
                className="text-3xl md:text-4xl font-semibold text-foreground mb-4"
              >
                {heading}
              </h2>
              <p className="text-lg text-muted-foreground">
                <span className="font-medium text-foreground">{title}</span>
                {date && <> — {date}</>}
              </p>
            </div>

            {/* Actions */}
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild aria-label={`Read the post: ${title}`}>
                <a href={latestPost.route}>Read the Post</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { LatestBlog };

export default LatestBlog;
