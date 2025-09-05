// import { useEffect } from 'react';
// import { useRouter } from 'next/router';
// import { isTokenExpired } from '@/components/monitorateToken';

// export function useTokenMonitor() {
//   const router = useRouter();

//   useEffect(() => {
//     if (!router.isReady) return; // espera o router estar pronto

//     const checkToken = () => {
//       const token = localStorage.getItem('token');
//       if (!token || isTokenExpired(token)) {
//         localStorage.removeItem('token');
//         router.push('/login');
//       }
//     };

//     checkToken();

//     const intervalId = setInterval(checkToken, 60 * 1000);

//     return () => clearInterval(intervalId);
//   }, [router, router.isReady]);
// }