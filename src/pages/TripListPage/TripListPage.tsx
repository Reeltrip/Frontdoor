import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { getErrorMessage } from "@/shared/api/client";
import {
  isDraftPlanStatus,
  type PlanSummary,
} from "@/features/plan/model/plan.types";
import { useDeletePlans, usePlans } from "@/features/plan/model/usePlan";
import PlanDeleteDialog from "@/features/plan/ui/PlanDeleteDialog";
import Toast from "@/shared/components/Toast";
import TabBar from "@/shared/components/TabBar";
import Button from "@/shared/components/Button";
import featuredOpenIcon from "@/shared/assets/icons/trip-list-open.svg";
import featuredTrashIcon from "@/shared/assets/icons/trip-list-trash.svg";
import styles from "./TripListPage.module.css";
import { useScreenBackdrop } from "@/shared/hooks/useScreenBackdrop";

type PlanTab = "mine" | "shared";

type PlanCardProps = {
  plan: PlanSummary;
  onOpen: (plan: PlanSummary) => void;
};

const DELETED_MESSAGE = "여행계획을 삭제했어요.";
const TOAST_DURATION_MS = 2000;

const formatDate = (date: string) => date.replaceAll("-", ".");

function isUpcoming(plan: PlanSummary) {
  const endDate = new Date(`${plan.endDate}T23:59:59`);
  return !Number.isNaN(endDate.getTime()) && endDate.getTime() >= Date.now();
}

function PlanRow({
  plan,
  onOpen,
  isPast = false,
  isSelected,
}: PlanCardProps & { isPast?: boolean; isSelected?: boolean }) {
  const createdAt = isPast ? plan.createdAt : undefined;
  const rowClassName = [
    styles.planRow,
    isPast && styles.pastRow,
    isSelected && styles.selectedRow,
  ].filter(Boolean).join(" ");

  return (
    <li>
      <button
        type="button"
        className={rowClassName}
        onClick={() => onOpen(plan)}
        aria-pressed={isSelected}
      >
        <span className={styles.planTitleLine}>
          <span className={styles.planName}>{plan.title}</span>
          {createdAt && (
            <time className={styles.planCreatedAt} dateTime={createdAt}>
              {formatDate(createdAt.slice(2, 10))}
            </time>
          )}
        </span>
        <span className={styles.planDate}>
          {/* 장소 수는 목록 응답의 placeCount예요. 값이 없으면 기간을 보여줘요 */}
          {plan.placeCount !== undefined
            ? `${formatDate(plan.startDate)} | 장소 ${plan.placeCount}곳`
            : `${formatDate(plan.startDate)} — ${formatDate(plan.endDate)}`}
        </span>
      </button>
    </li>
  );
}

// 다가오는 여행 큰 카드 (피그마 S5-1). 표지 사진이 없거나 못 불러오면 뒤의 그라데이션이 그대로 보여요
function FeaturedPlanCard({
  plan,
  onOpen,
  onDelete,
  onSelect,
  isSelected,
}: PlanCardProps & {
  onDelete: (plan: PlanSummary) => void;
  onSelect?: (plan: PlanSummary) => void;
  isSelected?: boolean;
}) {
  const [failedImageUrl, setFailedImageUrl] = useState<string>();
  const { coverImageUrl } = plan;
  const hasCover =
    coverImageUrl !== undefined && coverImageUrl !== failedImageUrl;

  return (
    <div className={styles.featuredWrap}>
      <button
        type="button"
        className={styles.featured}
        onClick={() => (onSelect ?? onOpen)(plan)}
        aria-pressed={isSelected}
      >
        {hasCover && (
          <img
            className={styles.featuredImage}
            src={coverImageUrl}
            alt=""
            onError={() => setFailedImageUrl(coverImageUrl)}
          />
        )}
        {/* 원형 그라데이션 4개, 점무늬(양쪽 1/3), 가장자리 흐림 (피그마 S5-1) */}
        <span className={styles.featuredOrbs} />
        <span className={styles.featuredDots} />
        <span className={styles.featuredGlow} />
        {/* 사진이 없을 때도 밝은 그라데이션 위 흰 글자가 읽히게 늘 덮어요 */}
        <span className={styles.featuredShade} />
        <span className={styles.featuredLabel}>
          다가오는 여행 | {plan.title}
        </span>
        <span className={styles.featuredActions} aria-hidden="true">
          {!onSelect && <img src={featuredOpenIcon} alt="" />}
        </span>
      </button>
      {onSelect && (
        <button
          type="button"
          className={styles.featuredOpen}
          aria-label={plan.title + " 열기"}
          onClick={() => onOpen(plan)}
        >
          <img src={featuredOpenIcon} alt="" />
        </button>
      )}
      <button
        type="button"
        className={styles.featuredDelete}
        aria-label={plan.title + " 삭제"}
        onClick={() => onDelete(plan)}
      >
        <img src={featuredTrashIcon} alt="" />
      </button>
    </div>
  );
}

export default function TripListPage() {
  useScreenBackdrop("#fafafa");
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<PlanTab>("mine");
  const [showAllPast, setShowAllPast] = useState(false);
  const { plans, viewStatus, error, refetch } = usePlans({ owner: "me" });
  const shared = usePlans({ owner: "shared" });
  const deletePlans = useDeletePlans();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<{
    ids: string[];
    fromSelection: boolean;
  } | null>(null);
  const [deleteError, setDeleteError] = useState<string>();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const isToastVisible = toastMessage !== null;

  useEffect(() => {
    if (!isToastVisible) return;
    const timer = window.setTimeout(
      () => setToastMessage(null),
      TOAST_DURATION_MS,
    );
    return () => window.clearTimeout(timer);
  }, [isToastVisible]);

  const startDelete = (ids: string[], fromSelection = false) => {
    setDeleteError(undefined);
    setDeleteTarget({ ids, fromSelection });
  };

  const finishEditing = () => {
    setIsEditing(false);
    setSelectedIds([]);
  };

  const toggleSelection = (plan: PlanSummary) => {
    setSelectedIds((ids) =>
      ids.includes(plan.id) ? ids.filter((id) => id !== plan.id) : [...ids, plan.id],
    );
  };

  const confirmDelete = () => {
    if (!deleteTarget || deletePlans.isPending) return;
    deletePlans.mutate(deleteTarget.ids, {
      onSuccess: ({ deletedIds, failures }) => {
        setSelectedIds((ids) => ids.filter((id) => !deletedIds.has(id)));
        if (failures.length) {
          setDeleteTarget({ ...deleteTarget, ids: failures.map(({ id }) => id) });
          setDeleteError(`삭제하지 못했어요. ${getErrorMessage(failures[0].error)}`);
          return;
        }
        setDeleteTarget(null);
        setToastMessage(DELETED_MESSAGE);
        if (deleteTarget.fromSelection || deletedIds.size === plans.length) finishEditing();
      },
    });
  };
  const { upcoming, past } = useMemo(() => {
    const sorted = [...plans].sort((a, b) =>
      a.startDate.localeCompare(b.startDate),
    );
    return {
      upcoming: sorted.filter(isUpcoming),
      past: sorted.filter((plan) => !isUpcoming(plan)).reverse(),
    };
  }, [plans]);
  const selectedPlans = plans.filter(({ id }) => selectedIds.includes(id));
  const isSelecting = isEditing && plans.length > 0;
  const editLabel = isSelecting ? "완료" : "편집";
  const getSelection = (plan: PlanSummary) =>
    isSelecting ? selectedIds.includes(plan.id) : undefined;
  const handleListAction = () => {
    if (selectedPlans.length) {
      startDelete(selectedPlans.map(({ id }) => id), true);
    } else if (isSelecting) {
      finishEditing();
    } else {
      setIsEditing(true);
    }
  };

  const openPlan = (plan: PlanSummary) =>
    navigate(
      isDraftPlanStatus(plan.status)
        ? `/plans/${plan.id}/edit`
        : `/plans/${plan.id}`,
    );

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>여행목록</h1>
        <button
          type="button"
          className={styles.moreButton}
          aria-label="여행계획 만들기"
          onClick={() => navigate("/plans/new")}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      <div className={styles.tabs} role="tablist" aria-label="여행계획 종류">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "mine"}
          className={activeTab === "mine" ? styles.activeTab : ""}
          onClick={() => setActiveTab("mine")}
        >
          내 계획
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "shared"}
          className={activeTab === "shared" ? styles.activeTab : ""}
          onClick={() => {
            setActiveTab("shared");
            finishEditing();
          }}
        >
          공유받은 계획
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === "shared" ? (
          shared.viewStatus === "loading" ? (
            <div className={styles.state} role="status">
              공유받은 계획을 불러오는 중이에요.
            </div>
          ) : shared.viewStatus === "error" ? (
            <div className={styles.state} role="alert">
              <p>
                공유받은 계획을 불러오지 못했어요.{" "}
                {getErrorMessage(shared.error)}
              </p>
              <button type="button" onClick={() => shared.refetch()}>
                다시 시도
              </button>
            </div>
          ) : shared.plans.length === 0 ? (
            <div className={styles.emptyShared} role="tabpanel">
              <p>공유받은 여행계획이 없어요.</p>
            </div>
          ) : (
            <div role="tabpanel" className={styles.planContent}>
              <ul className={styles.list}>
                {/* 공유받은 계획은 권한에 따라 못 고칠 수 있어서 늘 보기 화면으로 열어요 */}
                {shared.plans.map((plan) => (
                  <PlanRow
                    key={plan.id}
                    plan={plan}
                    onOpen={(item) => navigate(`/plans/${item.id}`)}
                  />
                ))}
              </ul>
            </div>
          )
        ) : viewStatus === "loading" ? (
          <div className={styles.state} role="status">
            여행목록을 불러오는 중이에요.
          </div>
        ) : viewStatus === "error" ? (
          <div className={styles.state} role="alert">
            <p>여행목록을 불러오지 못했어요. {getErrorMessage(error)}</p>
            <button type="button" onClick={() => refetch()}>
              다시 시도
            </button>
          </div>
        ) : (
          <div role="tabpanel" className={styles.planContent}>
            {upcoming[0] ? (
              <section className={styles.upcoming} aria-label="다가오는 여행">
                <FeaturedPlanCard
                  plan={upcoming[0]}
                  onOpen={openPlan}
                  onDelete={(plan) => startDelete([plan.id])}
                  onSelect={isSelecting ? toggleSelection : undefined}
                  isSelected={getSelection(upcoming[0])}
                />
              </section>
            ) : (
              <section
                className={styles.emptyUpcoming}
                aria-labelledby="empty-upcoming-title"
              >
                <h2
                  id="empty-upcoming-title"
                  className={styles.emptyUpcomingTitle}
                >
                  <span>모아둔 여행자료로</span>
                  <span>여행계획을 만들어 보세요.</span>
                </h2>
                <Button
                  size="md"
                  isFullWidth={false}
                  className={styles.createButton}
                  onClick={() => navigate("/plans/new")}
                >
                  여행계획 생성하기
                </Button>
              </section>
            )}

            <section
              className={styles.pastSection}
              aria-labelledby="past-trips-title"
            >
              <div className={styles.sectionHeading}>
                <h2
                  id="past-trips-title"
                  className={isSelecting ? styles.selectionHeading : undefined}
                  aria-live="polite"
                >
                  {isSelecting ? (
                    <><span>{selectedPlans.length}</span>개 선택됨</>
                  ) : (
                    <>지난 여행 <span>{past.length}</span></>
                  )}
                </h2>
                <div className={styles.sectionActions}>
                  {past.length > 3 && !isSelecting && (
                    <button
                      type="button"
                      className={styles.showAllButton}
                      onClick={() => setShowAllPast((isShowing) => !isShowing)}
                    >
                      {showAllPast ? "접기" : "모두보기"}
                    </button>
                  )}
                  {plans.length > 0 && (
                    <button
                      type="button"
                      className={styles.editButton}
                      aria-label={selectedPlans.length ? "선택한 여행 삭제" : `여행목록 편집${isSelecting ? " 완료" : ""}`}
                      onClick={handleListAction}
                    >
                      {selectedPlans.length ? "삭제" : editLabel}
                    </button>
                  )}
                </div>
              </div>
              {past.length ? (
                <ul className={styles.list}>
                  {(isSelecting || showAllPast ? past : past.slice(0, 3)).map((plan) => (
                    <PlanRow
                      key={plan.id}
                      plan={plan}
                      onOpen={isSelecting ? toggleSelection : openPlan}
                      isSelected={getSelection(plan)}
                      isPast
                    />
                  ))}
                </ul>
              ) : (
                <p className={styles.empty}>아직 지난 여행이 없어요.</p>
              )}
              {upcoming.length > 1 && (
                <>
                  <h2 className={styles.otherTitle}>다가오는 여행</h2>
                  <ul className={styles.list}>
                    {upcoming.slice(1).map((plan) => (
                      <PlanRow
                        key={plan.id}
                        plan={plan}
                        onOpen={isSelecting ? toggleSelection : openPlan}
                        isSelected={getSelection(plan)}
                      />
                    ))}
                  </ul>
                </>
              )}
            </section>
          </div>
        )}
      </div>

      <TabBar activeTab="menu" className={styles.tabBar} />
      {toastMessage && <Toast message={toastMessage} />}
      {deleteTarget && (
        <PlanDeleteDialog
          errorMessage={deleteError}
          isPending={deletePlans.isPending}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </main>
  );
}
