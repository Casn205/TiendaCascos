import React from 'react';

const DownloadReportButton = () => {
  const downloadReport = async () => {
    const response = await fetch('http://localhost:4000/download-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month: '2024-10' }), // Ejemplo de mes, podrías usar un selector
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Informe_Ventas.pdf`;
    a.click();
  };

  return (
    <button onClick={downloadReport}>Descargar Informe PDF</button>
  );
};

export default DownloadReportButton;
