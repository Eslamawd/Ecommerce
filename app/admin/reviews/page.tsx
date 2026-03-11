"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { PaginationControls } from "../../../src/components/pagination-controls";
import {
  useAdminReviews,
  useApproveAdminReview,
} from "../../../src/hooks/use-admin";
import { useLanguage } from "../../../src/components/language-provider";
import { getApiErrorMessages } from "../../../src/lib/api-client";
import { formatDate } from "../../../src/lib/date";

export default function AdminReviewsPage() {
  const [page, setPage] = useState(1);
  const reviewsQuery = useAdminReviews(page);
  const approveMutation = useApproveAdminReview();
  const { t } = useLanguage();

  const reviews = reviewsQuery.data?.data ?? [];
  const paginationMeta = reviewsQuery.data?.meta;

  const toggleApproval = async (reviewId: number) => {
    try {
      await approveMutation.mutateAsync(reviewId);
      toast.success(t("admin_review_approval_updated"));
    } catch (error) {
      toast.error(getApiErrorMessages(error).join(" | "));
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl space-y-6 p-6 md:p-10">
      <section className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-fuchsia-50 to-rose-100 p-6 shadow-soft dark:border-slate-700/70 dark:from-slate-900 dark:via-slate-900 dark:to-fuchsia-950">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          {t("admin_trust_center")}
        </p>
        <h1 className="text-3xl font-black tracking-tight">
          {t("admin_reviews_moderation_title")}
        </h1>
      </section>

      <section className="space-y-3">
        {reviews.map((review) => (
          <article
            key={review.id}
            className="rounded-xl bg-card p-4 shadow-soft"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold">
                  {review.user?.name ?? t("admin_unknown_user")} -{" "}
                  {review.rating}/5
                </p>
                <p className="text-sm text-muted">
                  {review.comment || t("admin_no_comment")}
                </p>
                <p className="text-xs text-muted">
                  {formatDate(review.created_at)}
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-3 py-1 text-sm dark:border-slate-700"
                onClick={() => toggleApproval(review.id)}
              >
                {review.is_approved ? t("admin_unapprove") : t("admin_approve")}
              </button>
            </div>
          </article>
        ))}

        {!reviewsQuery.isLoading && reviews.length === 0 ? (
          <p className="text-sm text-muted">
            {t("admin_no_reviews_available")}
          </p>
        ) : null}
      </section>

      {paginationMeta ? (
        <PaginationControls
          currentPage={paginationMeta.current_page}
          lastPage={paginationMeta.last_page}
          onPageChange={setPage}
          disabled={reviewsQuery.isFetching}
        />
      ) : null}
    </main>
  );
}
