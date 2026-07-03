import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const FolderCardSkeleton = () => {
  return (
    <SkeletonTheme
      baseColor="rgba(148, 163, 184, 0.12)"
      highlightColor="rgba(255, 255, 255, 0.25)"
    >
      <article className="flex h-full flex-col rounded-lg border border-primary/20 bg-base-100 p-5 shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <Skeleton width={48} height={48} borderRadius={12} />

            <div className="min-w-0 flex-1">
              <Skeleton width={180} height={24} />

              <div className="mt-2 flex items-center gap-3">
                <Skeleton width={70} height={12} />
                <Skeleton width={100} height={12} />
              </div>
            </div>
          </div>

          <Skeleton width={85} height={28} borderRadius={999} />
        </div>

        {/* Content */}
        <div className="mt-5 flex-1 space-y-4">
          {/* Root Files */}
          <section className="space-y-3">
            <Skeleton width={90} height={14} />

            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} height={42} borderRadius={10} />
              ))}
            </div>
          </section>

          {/* Subfolder */}
          <section className="space-y-3 rounded-lg bg-base-200/60 p-3">
            <Skeleton width={120} height={14} />

            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <Skeleton key={index} height={38} borderRadius={10} />
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-end gap-2 border-t border-base-300 pt-4">
          <Skeleton width={90} height={36} borderRadius={10} />

          <Skeleton width={100} height={36} borderRadius={10} />
        </div>
      </article>
    </SkeletonTheme>
  );
};

export default FolderCardSkeleton;
