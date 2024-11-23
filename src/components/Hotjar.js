// src/components/Hotjar.js
import { useEffect } from 'react';

const Hotjar = () => {
  useEffect(() => {
    const hotjarScript = document.createElement('script');
    hotjarScript.src = `https://static.hotjar.com/c/hotjar-YOUR_HOTJAR_ID.js?sv=6`; // Reemplaza YOUR_HOTJAR_ID
    hotjarScript.async = true;
    document.head.appendChild(hotjarScript);

    // Opcional: Para habilitar Hotjar
    window.hj = window.hj || function() {
      (hj.q = hj.q || []).push(arguments);
    };
    hj('trigger', 'YOUR_EVENT'); // Opcional, para eventos específicos
  }, []);

  return null;
};

export default Hotjar;
