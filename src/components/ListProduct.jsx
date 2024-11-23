import React, { useEffect, useState } from 'react';
import { TbTrash, TbEdit } from "react-icons/tb";

const ListProduct = ({ onEditProduct }) => {
  const [allproducts, setAllproducts] = useState([]);
  const [sortField, setSortField] = useState(''); // Campo para ordenar
  const [sortOrder, setSortOrder] = useState('asc'); // Orden ascendente o descendente

  const fetchInfo = async () => {
    await fetch('http://localhost:4000/allproducts')
      .then((res) => res.json())
      .then((data) => {
        setAllproducts(data);
      });
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  // Función para manejar la eliminación de un producto
  const remove_product = async (id) => {
    await fetch('http://localhost:4000/removeproduct', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: id })
    });
    await fetchInfo();
  };

  // Función para ordenar los productos según el campo y orden seleccionados
  const sortedProducts = [...allproducts].sort((a, b) => {
    if (sortField === 'price') {
      return sortOrder === 'asc' ? a.new_price - b.new_price : b.new_price - a.new_price;
    } else if (sortField === 'stock') {
      return sortOrder === 'asc' ? a.stock - b.stock : b.stock - a.stock;
    } else {
      return 0; // Sin orden si no se ha seleccionado un campo
    }
  });

  return (
    <div className='p-2 box-border bg-white mb-0 rounded-sm w-full mt-4 sm:p-4 sm:m-7'>
      <h4 className='bold-22 p-5 uppercase'>Products List</h4>

      {/* Controles de Ordenamiento */}
      <div className="flex gap-4 mb-4">
        <div>
          <label htmlFor="sortField" className="mr-2">Ordenar por:</label>
          <select
            id="sortField"
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">Seleccionar</option>
            <option value="price">Precio</option>
            <option value="stock">Stock</option>
          </select>
        </div>

        <div>
          <label htmlFor="sortOrder" className="mr-2">Orden:</label>
          <select
            id="sortOrder"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </select>
        </div>
      </div>

      <div className='max-h-[77vh] overflow-auto px-4 txt-center'>
        <table className="w-full mx-auto">
          <thead>
            <tr className='bg-primary bold-14 sm:regular-22 text-start py-12'>
              <th className="p-2">Products</th>
              <th className="p-2">Title</th>
              <th className="p-2">Old Price</th>
              <th className="p-2">New Price</th>
              <th className="p-2">Category</th>
              <th className="p-2">Stock</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedProducts.map((product, i) => (
              <tr key={i} className='border-b border-slate-900/20 text-gray-20 p-6 medium-14'>
                <td className='flexStart sm:flexCenter'>
                  <img src={product.image} alt="" height={43} width={43} className="rounded-1g ring-1 ring-slate-900/5 my-1" />
                </td>
                <td><div className='line-clamp-3'>{product.name}</div></td>
                <td>${product.old_price}</td>
                <td>${product.new_price}</td>
                <td>{product.category}</td>
                <td>{product.stock}</td>
                <td>
                  <div className='flex gap-4'>
                    <TbEdit onClick={() => onEditProduct(product)} className="cursor-pointer text-blue-600" />
                    <TbTrash onClick={() => remove_product(product.id)} className="cursor-pointer text-red-600" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListProduct;
