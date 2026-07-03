import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const NoteCardSkeleton = () => {
  return (
    <SkeletonTheme
      baseColor="rgba(255,255,255,0.08)"
      highlightColor="rgba(255,255,255,0.18)"
    >
      <div className="w-full rounded-2xl border border-primary/30 bg-primary/20 px-5 shadow-sm backdrop-blur-sm">
        <div className="flex h-full flex-col justify-between">
          {/* Content */}
          <div className="my-5 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton circle width={8} height={8} />
                  <Skeleton width={60} height={10} />
                </div>

                <Skeleton height={24} width="70%" borderRadius={12} />
              </div>

              <Skeleton circle width={28} height={28} />
            </div>

            {/* Body */}
            <div className="rounded-lg border-l-2 border-primary/30 bg-slate-50/20 px-3 py-3">
              <Skeleton count={3} />
              <Skeleton width="55%" />
            </div>

            {/* Attachments */}
            <div className="space-y-3">
              <Skeleton width={120} height={12} />

              <div className="flex flex-wrap gap-2">
                {[1, 2, 3].map((item) => (
                  <Skeleton
                    key={item}
                    width={110}
                    height={34}
                    borderRadius={12}
                  />
                ))}
              </div>
            </div>

            {/* Images */}
            <div className="space-y-3">
              <Skeleton width={90} height={12} />

              <div className="flex gap-2">
                {[1, 2, 3].map((item) => (
                  <Skeleton
                    key={item}
                    width={72}
                    height={72}
                    borderRadius={12}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mb-4 w-full border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton width={110} height={12} />
                <Skeleton width={90} height={10} />
              </div>

              <div className="flex items-center gap-2">
                <Skeleton circle width={34} height={34} />

                <Skeleton circle width={34} height={34} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
};

export default NoteCardSkeleton;
