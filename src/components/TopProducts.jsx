import React, { useState, useEffect } from 'react';

const TopProducts = () => {
  const [topProducts, setTopProducts] = useState([]);
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('totalIncome'); // Filtro por defecto: ingreso total
  const [sortOrder, setSortOrder] = useState('desc'); // Orden descendente por defecto

  // Función para obtener los productos más vendidos con filtros y ordenamiento
  const fetchTopProducts = async () => {
    try {
      const query = new URLSearchParams({
        dateFilter,
        sortBy,
        sortOrder,
      });

      const response = await fetch(`http://localhost:4000/top-products?${query.toString()}`);
      const data = await response.json();
      setTopProducts(data);
    } catch (error) {
      console.error("Error al obtener los productos más vendidos:", error);
    }
  };

  // Llama a fetchTopProducts cada vez que alguno de los filtros cambia
  useEffect(() => {
    fetchTopProducts();
  }, [dateFilter, sortBy, sortOrder]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Top 10 Productos Más Vendidos</h2>

      {/* Filtros */}
      <div className="mb-4 flex flex-col md:flex-row gap-4">
        <div>
          <label htmlFor="dateFilter" className="font-semibold mr-2">Filtrar por Fecha:</label>
          <select
            id="dateFilter"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">Todos</option>
            <option value="day">Hoy</option>
            <option value="month">Este Mes</option>
            <option value="year">Este Año</option>
          </select>
        </div>

        <div>
          <label htmlFor="sortBy" className="font-semibold mr-2">Ordenar por:</label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="totalIncome">Ingreso Total</option>
            <option value="unitPrice">Precio Unitario</option>
          </select>
        </div>

        <div>
          <label htmlFor="sortOrder" className="font-semibold mr-2">Dirección de Orden:</label>
          <select
            id="sortOrder"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="desc">Mayor a Menor</option>
            <option value="asc">Menor a Mayor</option>
          </select>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="p-2">Producto</th>
              <th className="p-2">Imagen</th>
              <th className="p-2">Cantidad Vendida</th>
              <th className="p-2">Ingreso Total</th>
              <th className="p-2">Precio Unitario</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.map((product, index) => (
              <tr key={index} className="border-b">
                <td className="p-2">{product.productName}</td>
                <td className="p-2">
                  <img src={product.image} alt={product.productName} width={50} height={50} className="rounded" />
                </td>
                <td className="p-2">{product.totalQuantity}</td>
                <td className="p-2">${product.totalIncome}</td>
                <td className="p-2">${product.unitPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopProducts;
