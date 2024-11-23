import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Routes, Route, useNavigate } from "react-router-dom";
import AddProduct from '../components/AddProduct';
import ListProduct from '../components/ListProduct';
import Dashboard from '../components/Dashboard';
import TopProducts from '../components/TopProducts'; // Importar el componente TopProducts

const Admin = () => {
  const [productToEdit, setProductToEdit] = useState(null);
  const navigate = useNavigate();

  // Función para manejar el clic en editar en la lista de productos
  const handleEditProduct = (product) => {
    setProductToEdit(product); // Establece el producto a editar
    navigate('/addproduct'); // Redirige al formulario de agregar producto
  };

  // Función para resetear el producto a editar y recargar la lista
  const handleProductUpdated = () => {
    setProductToEdit(null); // Limpia el estado después de actualizar
  };

  return (
    <div className='lg:flex'>
      <Sidebar />
      <div className="flex-1 p-6">
        <Routes>
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/addproduct' element={
            <AddProduct 
              productToEdit={productToEdit} 
              onProductUpdated={handleProductUpdated} 
            />
          } />
          <Route path='/listproduct' element={<ListProduct onEditProduct={handleEditProduct} />} />
          <Route path='/top-products' element={<TopProducts />} /> {/* Añadir ruta para TopProducts */}
        </Routes>
      </div>
    </div>
  );
};

export default Admin;
