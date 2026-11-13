import { componentDemos } from './demos';
import { serverStateDemos } from './serverStateDemos';
import { exceptionDemos } from './exceptionDemos';
import { mapDemos } from './mapDemos';
import styles from './ComponentTestPage.module.css';

const allDemos = [...componentDemos, ...mapDemos, ...serverStateDemos, ...exceptionDemos];

export default function ComponentTestPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>컴포넌트 테스트</h1>
        <p className={styles.sub}>로컬과 Vercel 미리보기에서만 보이는 페이지예요. 컴포넌트는 demos.tsx에 추가하세요.</p>
      </header>

      {allDemos.length === 0 ? (
        <p className={styles.empty}>아직 등록된 컴포넌트가 없어요.</p>
      ) : (
        <>
          <nav className={styles.nav}>
            {allDemos.map((demo) => (
              <a key={demo.name} href={`#${demo.name}`} className={styles.chip}>
                {demo.name}
              </a>
            ))}
          </nav>

          {allDemos.map((demo) => (
            <section key={demo.name} id={demo.name} className={styles.section}>
              <h2 className={styles.name}>{demo.name}</h2>
              <p className={styles.sub}>
                <code>src/{demo.path}</code>
                {demo.description && ` · ${demo.description}`}
              </p>
              {demo.variants.map((variant) => (
                <div key={variant.label} className={styles.variant}>
                  <span className={styles.label}>{variant.label}</span>
                  <div className={styles.preview}>{variant.render()}</div>
                </div>
              ))}
            </section>
          ))}
        </>
      )}
    </main>
  );
}
