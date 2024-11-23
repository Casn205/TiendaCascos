import React, { useState, useEffect } from 'react';
import SummaryCard from './SummaryCard';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Registrar todos los componentes necesarios de Chart.js, incluido el plugin Filler
ChartJS.register(
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const [summaryData, setSummaryData] = useState([]);
  const [lineData, setLineData] = useState({ labels: [], datasets: [] });
  const [barData, setBarData] = useState({ labels: [], datasets: [] });
  const [detailedData, setDetailedData] = useState(null); // Estado para almacenar datos detallados
  const [detailType, setDetailType] = useState(''); // Estado para el tipo de detalle

  // Cargar los datos de ventas desde la API
  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await fetch('http://localhost:4000/sales-data');
        const data = await response.json();

        // Configurar los datos para las tarjetas de resumen
        setSummaryData([
          { title: 'Total Sales', value: `$${data.totalSales.totalSales}`, color: 'bg-blue-500', type: 'totalSales' },
          { title: 'Total Quantity', value: `${data.totalSales.totalQuantity}`, color: 'bg-yellow-500', type: 'totalQuantity' },
          { title: 'Daily Sales', value: `$${data.dailySales[data.dailySales.length - 1]?.totalSales || 0}`, color: 'bg-green-500', type: 'dailySales' },
          { title: 'Monthly Sales', value: `$${data.monthlySales[data.monthlySales.length - 1]?.totalSales || 0}`, color: 'bg-red-500', type: 'monthlySales' }
        ]);

        // Configurar el gráfico de líneas (ventas diarias)
        setLineData({
          labels: data.dailySales.map(sale => sale._id),
          datasets: [
            {
              label: 'Daily Sales',
              data: data.dailySales.map(sale => sale.totalSales),
              fill: true,
              backgroundColor: 'rgba(75,192,192,0.2)',
              borderColor: 'rgba(75,192,192,1)'
            }
          ]
        });

        // Configurar el gráfico de barras (ventas mensuales)
        setBarData({
          labels: data.monthlySales.map(sale => sale._id),
          datasets: [
            {
              label: 'Monthly Sales',
              data: data.monthlySales.map(sale => sale.totalSales),
              backgroundColor: 'rgba(53, 162, 235, 0.5)'
            }
          ]
        });
      } catch (error) {
        console.error("Error al obtener datos de ventas:", error);
      }
    };

    fetchSalesData();
  }, []);

  // Manejar el clic en una tarjeta de resumen para mostrar los detalles
  const handleCardClick = async (type) => {
    setDetailType(type); // Guardar el tipo de detalle seleccionado

    try {
      const response = await fetch(`http://localhost:4000/sales-details?type=${type}`);
      const data = await response.json();
      setDetailedData(data); // Guardar los datos detallados para mostrarlos
    } catch (error) {
      console.error("Error al obtener datos detallados:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
      
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {summaryData.map((data, index) => (
          <SummaryCard
            key={index}
            title={data.title}
            value={data.value}
            color={data.color}
            onClick={() => handleCardClick(data.type)} // Agregar el evento de clic
          />
        ))}
      </div>

      {/* Mostrar vista detallada si se selecciona una tarjeta */}
      {detailedData && detailedData.length > 0 ? (
        <div className="bg-white p-4 rounded shadow mb-6">
          <h3 className="text-lg font-semibold mb-4">Detalles de {detailType === 'totalSales' ? 'Total Sales' : detailType === 'totalQuantity' ? 'Total Quantity' : detailType === 'dailySales' ? 'Daily Sales' : 'Monthly Sales'}</h3>
          <ul>
            {detailedData.map((detail, index) => (
              <li key={index} className="border-b py-2">
                {/* Mostrar los detalles específicos según el tipo */}
                {detailType === 'totalQuantity' && (
                  <div>
                    <p><strong>Producto:</strong> {detail.productName}</p>
                    <p><strong>Cantidad Vendida:</strong> {detail.quantity}</p>
                    <p><strong>Fecha de Venta:</strong> {detail.saleDate}</p>
                  </div>
                )}
                {detailType === 'totalSales' && (
                  <div>
                    <p><strong>Producto:</strong> {detail.productName}</p>
                    <p><strong>Total Vendido:</strong> ${detail.totalPrice}</p>
                    <p><strong>Fecha de Venta:</strong> {detail.saleDate}</p>
                  </div>
                )}
                {detailType === 'dailySales' && (
                  <div>
                    <p><strong>Fecha:</strong> {detail._id}</p>
                    <p><strong>Total Vendido:</strong> ${detail.totalSales}</p>
                    <p><strong>Cantidad Vendida:</strong> {detail.totalQuantity}</p>
                  </div>
                )}
                {detailType === 'monthlySales' && (
                  <div>
                    <p><strong>Mes:</strong> {detail._id}</p>
                    <p><strong>Total Vendido:</strong> ${detail.totalSales}</p>
                    <p><strong>Cantidad Vendida:</strong> {detail.totalQuantity}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        detailedData && detailedData.length === 0 ? (
          <p className="text-center text-gray-500">No se encontraron datos para mostrar.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gráficos */}
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold mb-4">Daily Sales</h3>
              <Line data={lineData} />
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold mb-4">Monthly Sales</h3>
              <Bar data={barData} />
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default Dashboard;
