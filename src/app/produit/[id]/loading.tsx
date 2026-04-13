export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-28 sm:px-6 sm:pb-16 sm:pt-32 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
          <div className="w-full lg:w-1/2">
            <div className="aspect-square w-full animate-pulse rounded-lg bg-[#f6f1ea]" />
            <div className="mt-4 flex justify-center gap-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-16 w-16 animate-pulse rounded-lg bg-[#efe2d4]"
                />
              ))}
            </div>
          </div>

          <div className="w-full space-y-6 lg:w-1/2">
            <div className="space-y-4">
              <div className="h-9 w-2/3 animate-pulse rounded bg-[#efe2d4]" />
              <div className="h-8 w-40 animate-pulse rounded bg-[#efe2d4]" />
            </div>

            {Array.from({ length: 3 }).map((_, sectionIndex) => (
              <div key={sectionIndex} className="space-y-3">
                <div className="h-4 w-24 animate-pulse rounded bg-[#efe2d4]" />
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 4 }).map((_, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="h-10 animate-pulse rounded-lg bg-[#f5ede4]"
                    />
                  ))}
                </div>
              </div>
            ))}

            <div className="h-14 w-full animate-pulse rounded-lg bg-[#e7ded5]" />
          </div>
        </div>
      </div>
    </div>
  );
}
