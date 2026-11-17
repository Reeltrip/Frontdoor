import styles from './AccountSwitch.module.css';

export default function AccountSwitch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <button type="button" role="switch" aria-label={label} aria-checked={checked} className={`${styles.switch} ${checked ? styles.checked : ''}`} onClick={() => onChange(!checked)}><span /></button>;
}
