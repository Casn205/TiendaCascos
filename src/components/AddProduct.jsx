import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import upload_area from "../assets/upload_area.svg";
import { MdAdd } from "react-icons/md";

const AddProduct = ({ productToEdit, onProductUpdated }) => {
  const [image, setImage] = useState(null);
  const [productDetails, setProductDetails] = useState({
    id: null,
    name: "",
    image: "",
    category: "women",
    new_price: "",
    old_price: "",
    stock: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (productToEdit) {
      setProductDetails(productToEdit);
      setIsEditing(true);
      setImage(null); // Si es una edición, no se requiere cargar una nueva imagen inmediatamente
    } else {
      resetForm();
      setIsEditing(false);
    }
  }, [productToEdit]);

  const resetForm = () => {
    setProductDetails({
      id: null,
      name: "",
      image: "",
      category: "women",
      new_price: "",
      old_price: "",
      stock: "",
    });
    setImage(null);
  };

  const imageHandler = (e) => {
    setImage(e.target.files[0]);
  };

  const changeHandler = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
  };

  const validateInputs = () => {
    const { name, old_price, new_price, stock, category } = productDetails;

    // Validar nombre del producto
    if (!name || name.length < 1 || name.length > 40) {
      Swal.fire("Error", "El nombre del producto debe tener entre 1 y 40 caracteres.", "error");
      return false;
    }

    // Validar precio original
    if (!old_price || isNaN(old_price) || old_price <= 0) {
      Swal.fire("Error", "El precio debe ser un número mayor a 0.", "error");
      return false;
    }

    // Validar precio de oferta
    if (!new_price || isNaN(new_price) || new_price <= 0) {
      Swal.fire("Error", "El precio de oferta debe ser un número mayor a 0.", "error");
      return false;
    }

    // Validar stock
    if (!stock || isNaN(stock) || stock < 0) {
      Swal.fire("Error", "El stock debe ser un número igual o mayor a 0.", "error");
      return false;
    }

    // Validar categoría
    if (!["women", "men", "kid"].includes(category)) {
      Swal.fire("Error", "La categoría debe ser 'Women', 'Men' o 'Kid'.", "error");
      return false;
    }

    return true;
  };

  const handleSaveProduct = async () => {
    if (!validateInputs()) {
      return; // Detiene la ejecución si hay errores de validación
    }

    let responseData;
    let formData = new FormData();

    // Si hay una imagen seleccionada, se sube primero
    if (image) {
      formData.append("product", image);
      const uploadResponse = await fetch("http://localhost:4000/upload", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });
      responseData = await uploadResponse.json();
      if (responseData.success) {
        productDetails.image = responseData.image_url;
      } else {
        Swal.fire("Error", "Error al cargar la imagen.", "error");
        return;
      }
    }

    // Determina si se trata de una actualización o un nuevo producto
    const endpoint = isEditing ? "/updateproduct" : "/addproduct";
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(`http://localhost:4000${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productDetails),
      });
      const data = await response.json();

      if (data.success) {
        Swal.fire("Éxito", `Producto ${isEditing ? "actualizado" : "añadido"} correctamente.`, "success");
        onProductUpdated();
        resetForm();
      } else {
        Swal.fire("Error", `Error al ${isEditing ? "actualizar" : "añadir"} el producto: ${data.message}`, "error");
      }
    } catch (error) {
      Swal.fire("Error", `Error en el servidor: ${error.message}`, "error");
    }
  };

  return (
    <div className="p-8 box-border bg-white w-full rounded-sm mt-4 lg:m-7">
      <div className="mb-3">
        <h4 className="bold-18 pb-2">Product title:</h4>
        <input
          value={productDetails.name}
          onChange={changeHandler}
          type="text"
          name="name"
          placeholder="Type here.."
          className="bg-primary outline-none max-w-80 w-full py-3 px-4 rounded-md"
        />
      </div>
      <div className="mb-3">
        <h4 className="bold-18 pb-2">Price:</h4>
        <input
          value={productDetails.old_price}
          onChange={changeHandler}
          type="text"
          name="old_price"
          placeholder="Type here.."
          className="bg-primary outline-none max-w-80 w-full py-3 px-4 rounded-md"
        />
      </div>
      <div className="mb-3">
        <h4 className="bold-18 pb-2">Offer Price:</h4>
        <input
          value={productDetails.new_price}
          onChange={changeHandler}
          type="text"
          name="new_price"
          placeholder="Type here.."
          className="bg-primary outline-none max-w-80 w-full py-3 px-4 rounded-md"
        />
      </div>
      <div className="mb-3">
        <h4 className="bold-18 pb-2">Stock:</h4>
        <input
          value={productDetails.stock}
          onChange={changeHandler}
          type="number"
          name="stock"
          placeholder="Enter stock quantity.."
          className="bg-primary outline-none max-w-80 w-full py-3 px-4 rounded-md"
        />
      </div>
      <div className="mb-3 flex items-center gap-x-4">
        <h4 className="bold-18 pb-2">Product Category:</h4>
        <select
          value={productDetails.category}
          onChange={changeHandler}
          name="category"
          className="bg-primary ring-1 ring-slate-900/20 medium-16 rounded-sm outline-none"
        >
          <option value="women">Women</option>
          <option value="men">Men</option>
          <option value="kid">Kid</option>
        </select>
      </div>
      <div>
        <label htmlFor="file-input">
          <img
            src={image ? URL.createObjectURL(image) : productDetails.image || upload_area}
            alt="Product"
            className="w-20 rounded-sm inline-block"
          />
        </label>
        <input
          onChange={imageHandler}
          type="file"
          name="image"
          id="file-input"
          hidden
          className="bg-primary max-w-80 w-full py-3 px-4"
        />
      </div>
      <button onClick={handleSaveProduct} className="btn_dark_rounded mt-4 flexCenter gap-x-1">
        <MdAdd /> {isEditing ? "Update Product" : "Add Product"}
      </button>
    </div>
  );
};

export default AddProduct;
