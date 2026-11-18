import { Link, useNavigate, useSearchParams } from 'react-router';
import AnalysisFailed from '@/features/source/ui/AnalysisFailed';
import LiveApiTestPanel from './LiveApiTestPanel';
import { componentDemos } from './demos';
import { mapDemos } from './mapDemos';
import styles from './ComponentTestPage.module.css';

const allDemos = [...componentDemos, ...mapDemos];

export default function ComponentTestPage() {
  const [params] = useSearchParams();
  const isApiTab = params.get('tab') === 'api';
  const navigate = useNavigate();
  if (params.get('preview') === 'analysis-failed') {
    return <AnalysisFailed
      message={params.get('message') === 'private' ? '링크가 비공개예요. 공개 링크인지 확인해 주세요.' : undefined}
      onRetry={() => navigate('/dev/components#AnalysisFailed')}
      onQuit={() => navigate('/dev/components#AnalysisFailed')}
    />;
  }
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>컴포넌트 테스트</h1>
        <p className={styles.sub}>로컬과 Vercel 미리보기에서만 보이는 페이지예요. 컴포넌트는 demos.tsx에 추가하세요.</p>
      </header>

      <nav className={styles.nav} aria-label="테스트 종류">
        <Link className={styles.chip} to="/dev/components" aria-current={!isApiTab ? 'page' : undefined}>컴포넌트</Link>
        <Link className={styles.chip} to="/dev/components?tab=api" aria-current={isApiTab ? 'page' : undefined}>실제 API 검증</Link>
      </nav>
      {isApiTab ? <LiveApiTestPanel /> : allDemos.length === 0 ? (
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
