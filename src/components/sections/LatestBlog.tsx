// components/sections/LatestBlog.tsx
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface LatestBlogProps {
  heading?: string;
  description?: string;
  buttons?: {
    primary?: {
      text: string;
      url: string;
    };
    secondary?: {
      text: string;
      url: string;
    };
  };
  className?: string;
}

const LatestBlog = ({
  heading = "Latest Writing",
  description = "Occasional thoughts on frontend systems, design decisions, and building products with intention.",
  buttons = {
    primary: {
      text: "Read the Blog",
      url: "/blog/nextraPortfolio",
    },
  },
  className,
}: LatestBlogProps) => {
  return (
    <section className={cn("py-24", className)}>
      <div className="container mx-auto max-w-7xl px-8">
        <div className="rounded-xl bg-accent px-8 py-12 md:px-12 md:py-16">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            {/* Text */}
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
                {heading}
              </h2>
              <p className="text-lg text-muted-foreground">
                {description}
              </p>
            </div>

            {/* Actions */}
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              {buttons.secondary && (
                <Button variant="outline" asChild>
                  <a href={buttons.secondary.url}>
                    {buttons.secondary.text}
                  </a>
                </Button>
              )}
              {buttons.primary && (
                <Button size="lg" asChild>
                  <a href={buttons.primary.url}>
                    {buttons.primary.text}
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { LatestBlog };

export default LatestBlog;

