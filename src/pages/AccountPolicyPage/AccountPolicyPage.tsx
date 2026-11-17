import AccountLayout from '@/features/account/ui/AccountLayout';
import styles from './AccountPolicyPage.module.css';

export default function AccountPolicyPage({ kind }: { kind: 'terms' | 'privacy' }) {
  const isTerms = kind === 'terms';
  return <AccountLayout title={isTerms ? '서비스 이용약관' : '개인정보처리방침'} hasTabBar>
    <article className={`${styles.content} ${!isTerms ? styles.privacy : ''}`}>
      {isTerms ? <>
        <section><h2>제1조 (목적)</h2><p>본 약관은 Wayvi가 제공하는 제반 서비스의 이용과 관련하여 회사와 회원과의 권리, 의무 및 책임사항, 기타 필요한 사항을<br />규정함을 목적으로 합니다.</p></section>
        <section><h2>제2조 (정의)</h2><p>1. "서비스"라 함은 구현되는 단말기와 상관없이 "회원"이 이용할 수 있는 Wayvi 관련 제반 서비스를 의미합니다.<br />{' 2. "회원"이라 함은 회사의 "서비스"에 접속하여 본 약관에 따라 "회사"와 이용계약을 체결하고 "회사"가 제공하는 "서비스"를 이용하는 고객을 말합니다.'}</p></section>
      </> : <>
        <section><h2>1. 수집하는 개인정보 항목</h2><p>회사는 회원가입, 원활한 고객상담, 각종 서비스의 제공을 위해 최초 회원가입 당시 아래와 같은 개인정보를 수집하고 있습니다.<br /> - 필수항목: 이메일 주소, 비밀번호, 닉네임</p></section>
        <section><h2>2. 개인정보 수집 및 이용 목적</h2><p>회사는 수집한 개인정보를 다음의 목적을 위해 활용합니다.<br /> - 서비스 제공에 관한 계약 이행 및 콘텐츠 제공<br /> - 회원 관리 및 본인 확인</p></section>
      </>}
    </article>
  </AccountLayout>;
}
