import Swal from 'sweetalert2';

jest.mock('sweetalert2');

describe('validateFormData function', () => {
  // Adaptación de la función validateFormData
  const validateFormData = ({ state, formData }) => {
    const { username, email, password } = formData;

    // Validate username: 1 <= length <= 40
    if (state === 'Sign Up') {
      if (!username || username.length < 1 || username.length > 40) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Username',
          text: 'Username must be between 1 and 40 characters.',
        });
        return false;
      }
    }

    // Validate email format using regex
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailPattern.test(email)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Email',
        text: 'Please enter a valid email address.',
      });
      return false;
    }

    // Validate password: 5 <= length <= 10
    if (!password || password.length < 5 || password.length > 10) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Password',
        text: 'Password must be between 5 and 10 characters.',
      });
      return false;
    }

    return true;
  };

  // Casos de prueba
  it('should return true for valid form data (Sign Up)', () => {
    const validData = { state: 'Sign Up', formData: { username: 'JohnDoe', email: 'john@example.com', password: '12345' } };
    const result = validateFormData(validData);
    expect(result).toBe(true);
    expect(Swal.fire).not.toHaveBeenCalled();
  });

  it('should return true for valid form data (Login)', () => {
    const validData = { state: 'Login', formData: { email: 'john@example.com', password: '12345' } };
    const result = validateFormData(validData);
    expect(result).toBe(true);
    expect(Swal.fire).not.toHaveBeenCalled();
  });

  it('should show error for invalid username during Sign Up', () => {
    const invalidData = { state: 'Sign Up', formData: { username: '', email: 'john@example.com', password: '12345' } };
    const result = validateFormData(invalidData);
    expect(result).toBe(false);
    expect(Swal.fire).toHaveBeenCalledWith({
      icon: 'error',
      title: 'Invalid Username',
      text: 'Username must be between 1 and 40 characters.',
    });
  });

  it('should show error for invalid email', () => {
    const invalidData = { state: 'Sign Up', formData: { username: 'JohnDoe', email: 'invalid-email', password: '12345' } };
    const result = validateFormData(invalidData);
    expect(result).toBe(false);
    expect(Swal.fire).toHaveBeenCalledWith({
      icon: 'error',
      title: 'Invalid Email',
      text: 'Please enter a valid email address.',
    });
  });

  it('should show error for invalid password', () => {
    const invalidData = { state: 'Sign Up', formData: { username: 'JohnDoe', email: 'john@example.com', password: '123' } };
    const result = validateFormData(invalidData);
    expect(result).toBe(false);
    expect(Swal.fire).toHaveBeenCalledWith({
      icon: 'error',
      title: 'Invalid Password',
      text: 'Password must be between 5 and 10 characters.',
    });
  });

  it('should not validate username for Login', () => {
    const validData = { state: 'Login', formData: { email: 'john@example.com', password: '12345' } };
    const result = validateFormData(validData);
    expect(result).toBe(true);
    expect(Swal.fire).not.toHaveBeenCalled();
  });
});
