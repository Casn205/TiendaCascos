import Swal from "sweetalert2";

// Mock de Swal para evitar que se muestren ventanas reales durante la prueba
jest.mock("sweetalert2", () => ({
  fire: jest.fn(),
}));

// Función validateInputs aislada
const validateInputs = (productDetails) => {
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

describe("validateInputs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return true for valid inputs", () => {
    const validProduct = {
      name: "Valid Product",
      old_price: 100,
      new_price: 80,
      stock: 10,
      category: "women",
    };

    const result = validateInputs(validProduct);
    expect(result).toBe(true);
    expect(Swal.fire).not.toHaveBeenCalled();
  });

  test("should show error for invalid product name", () => {
    const invalidProduct = {
      name: "", // Nombre vacío
      old_price: 100,
      new_price: 80,
      stock: 10,
      category: "women",
    };

    const result = validateInputs(invalidProduct);
    expect(result).toBe(false);
    expect(Swal.fire).toHaveBeenCalledWith(
      "Error",
      "El nombre del producto debe tener entre 1 y 40 caracteres.",
      "error"
    );
  });

  test("should show error for invalid old price", () => {
    const invalidProduct = {
      name: "Valid Product",
      old_price: -10, // Precio negativo
      new_price: 80,
      stock: 10,
      category: "women",
    };

    const result = validateInputs(invalidProduct);
    expect(result).toBe(false);
    expect(Swal.fire).toHaveBeenCalledWith("Error", "El precio debe ser un número mayor a 0.", "error");
  });

  test("should show error for invalid new price", () => {
    const invalidProduct = {
      name: "Valid Product",
      old_price: 100,
      new_price: 0, // Precio no válido
      stock: 10,
      category: "women",
    };

    const result = validateInputs(invalidProduct);
    expect(result).toBe(false);
    expect(Swal.fire).toHaveBeenCalledWith("Error", "El precio de oferta debe ser un número mayor a 0.", "error");
  });

  test("should show error for invalid stock", () => {
    const invalidProduct = {
      name: "Valid Product",
      old_price: 100,
      new_price: 80,
      stock: -1, // Stock negativo
      category: "women",
    };

    const result = validateInputs(invalidProduct);
    expect(result).toBe(false);
    expect(Swal.fire).toHaveBeenCalledWith("Error", "El stock debe ser un número igual o mayor a 0.", "error");
  });

  test("should show error for invalid category", () => {
    const invalidProduct = {
      name: "Valid Product",
      old_price: 100,
      new_price: 80,
      stock: 10,
      category: "electronics", // Categoría no válida
    };

    const result = validateInputs(invalidProduct);
    expect(result).toBe(false);
    expect(Swal.fire).toHaveBeenCalledWith(
      "Error",
      "La categoría debe ser 'Women', 'Men' o 'Kid'.",
      "error"
    );
  });
});
