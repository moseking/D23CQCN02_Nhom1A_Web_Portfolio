export default function LoadingSkeleton() {
  return (
    <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <article
          key={item}
          className="overflow-hidden rounded-3xl border border-[#e1e6db] bg-white shadow-sm"
        >
          <div className="h-72 animate-pulse bg-[#e8ece2]" />

          <div className="space-y-4 p-5">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 animate-pulse rounded-full bg-[#e8ece2]" />
              <div className="space-y-2">
                <div className="h-3 w-24 animate-pulse rounded-full bg-[#e8ece2]" />
                <div className="h-3 w-16 animate-pulse rounded-full bg-[#e8ece2]" />
              </div>
            </div>

            <div className="h-5 w-3/4 animate-pulse rounded-full bg-[#e8ece2]" />
            <div className="h-4 w-full animate-pulse rounded-full bg-[#e8ece2]" />
            <div className="h-4 w-2/3 animate-pulse rounded-full bg-[#e8ece2]" />

            <div className="flex gap-2">
              <div className="h-8 w-20 animate-pulse rounded-full bg-[#e8ece2]" />
              <div className="h-8 w-20 animate-pulse rounded-full bg-[#e8ece2]" />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
