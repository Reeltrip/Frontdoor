import checkIcon from "@/shared/assets/icons/step-check.svg";
import styles from "./AnalysisSteps.module.css";

type AnalysisStepsProps = {
  steps: string[];
  currentStep: number;
};

export default function AnalysisSteps({
  steps,
  currentStep,
}: AnalysisStepsProps) {
  return (
    <ul className={styles.list} aria-live="polite">
      {steps.map((label, index) => {
        const isDone = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <li
            key={label}
            className={`${styles.item} ${isDone || isCurrent ? "" : styles.waiting}`}
          >
            {isDone ? (
              <img src={checkIcon} alt="완료" className={styles.icon} />
            ) : (
              <span
                className={`${styles.icon} ${isCurrent ? styles.spinner : styles.dot}`}
                aria-hidden
              />
            )}
            {label}
          </li>
        );
      })}
    </ul>
  );
}
