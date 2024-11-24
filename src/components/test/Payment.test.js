import Swal from 'sweetalert2';

jest.mock('sweetalert2');

describe('validateFields function', () => {
  // Adaptación de la función validateFields
  const validateFields = ({ name, email, address }) => {
    // Validación del nombre del titular
    if (!name || name.length < 1 || name.length > 40) {
      Swal.fire({
        icon: 'error',
        title: 'Error en el nombre',
        text: 'El nombre del titular debe tener entre 1 y 40 caracteres.',
      });
      return false;
    }

    // Validación del correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      Swal.fire({
        icon: 'error',
        title: 'Error en el correo',
        text: 'Debe proporcionar un correo válido en el formato ejemplo@correo.com.',
      });
      return false;
    }

    // Validación de la dirección
    if (!address || address.length < 1 || address.length > 40) {
      Swal.fire({
        icon: 'error',
        title: 'Error en la dirección',
        text: 'La dirección debe tener entre 1 y 40 caracteres.',
      });
      return false;
    }

    return true;
  };

  // Pruebas para la función validateFields
  it('should return true for valid inputs', () => {
    const validInputs = { name: 'John Doe', email: 'john@example.com', address: '123 Main Street' };
    const result = validateFields(validInputs);
    expect(result).toBe(true);
    expect(Swal.fire).not.toHaveBeenCalled();
  });

  it('should show error for invalid name', () => {
    const invalidInputs = { name: '', email: 'john@example.com', address: '123 Main Street' };
    const result = validateFields(invalidInputs);
    expect(result).toBe(false);
    expect(Swal.fire).toHaveBeenCalledWith({
      icon: 'error',
      title: 'Error en el nombre',
      text: 'El nombre del titular debe tener entre 1 y 40 caracteres.',
    });
  });

  it('should show error for invalid email', () => {
    const invalidInputs = { name: 'John Doe', email: 'invalid-email', address: '123 Main Street' };
    const result = validateFields(invalidInputs);
    expect(result).toBe(false);
    expect(Swal.fire).toHaveBeenCalledWith({
      icon: 'error',
      title: 'Error en el correo',
      text: 'Debe proporcionar un correo válido en el formato ejemplo@correo.com.',
    });
  });

  it('should show error for invalid address', () => {
    const invalidInputs = { name: 'John Doe', email: 'john@example.com', address: '' };
    const result = validateFields(invalidInputs);
    expect(result).toBe(false);
    expect(Swal.fire).toHaveBeenCalledWith({
      icon: 'error',
      title: 'Error en la dirección',
      text: 'La dirección debe tener entre 1 y 40 caracteres.',
    });
  });
});
