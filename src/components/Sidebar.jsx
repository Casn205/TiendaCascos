import React from 'react';
import { Link } from "react-router-dom";
import addProduct from "../assets/addproduct.png";
import listProduct from "../assets/productlist.png";
import dashboardIcon from "../assets/dashboard.png";
import topProductsIcon from "../assets/topproduct.jfif";
import downloadReportIcon from "../assets/report.png"; // Agrega un icono para el informe
import DownloadReportButton from './dowloadReport'; // Importa el botón de descarga

function Sidebar() {
  return (
    <div className='py-7 flex justify-center gap-x-1 gap-y-5 w-full bg-white sm:gap-x-4 lg:flex-col lg:pt-20 lg:max-w-60 lg:h-screen lg:justify-start lg:pl-6'>
      <Link to={'/dashboard'}>
        <button className='flexCenter gap-2 rounded-md bg-primary h-12 w-44 medium-16'>
          <img src={dashboardIcon} alt="Dashboard Icon" height={55} width={55} />
          <span>Dashboard</span>
        </button>
      </Link>
      <Link to={'/addproduct'}>
        <button className='flexCenter gap-2 rounded-md bg-primary h-12 w-44 medium-16'>
          <img src={addProduct} alt="Add Product Icon" height={55} width={55} />
          <span>Add Product</span>
        </button>
      </Link>
      <Link to={'/listproduct'}>
        <button className='flexCenter gap-2 rounded-md bg-primary h-12 w-44 medium-16'>
          <img src={listProduct} alt="List Product Icon" height={55} width={55} />
          <span>List Product</span>
        </button>
      </Link>
      <Link to={'/top-products'}>
        <button className='flexCenter gap-2 rounded-md bg-primary h-12 w-44 medium-16'>
          <img src={topProductsIcon} alt="Top Products Icon" height={55} width={55} />
          <span>Top Products</span>
        </button>
      </Link>
      
      {/* Botón para descargar el informe */}
      <div className='flexCenter gap-2 rounded-md bg-primary h-12 w-44 medium-16'>
        <img src={downloadReportIcon} alt="Download Report Icon" height={55} width={55} />
        <DownloadReportButton />
      </div>
    </div>
  );
}

export default Sidebar;
