import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/index.css';

// iOS Safari는 viewport의 user-scalable=no를 무시해서, 두 손가락 확대 제스처를 직접 막아요.
// 지도는 터치 이벤트로 확대를 처리해서 영향이 없어요
document.addEventListener('gesturestart', (event) => event.preventDefault());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
