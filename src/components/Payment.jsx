import React, { useContext, useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ShopContext } from '../Context/ShopContext';

export default function PaymentInterface({ totalAmount, cartProducts }) {
  const [clientSecret, setClientSecret] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [showDownloadButton, setShowDownloadButton] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [pdfBlob, setPdfBlob] = useState(null); // Estado para almacenar el PDF
  const { setCartItems, getDefaultCart,clearCartInDatabase } = useContext(ShopContext);
  const stripe = useStripe();
  const elements = useElements();
  
  const clearCartAfterPurchase = () => {
    setCartItems(getDefaultCart()); // Vacía el carrito en el contexto
  };

  const handleCreatePaymentIntent = async () => {
    try {
      const response = await fetch('http://localhost:4000/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalAmount * 100 }), // Asume el valor en centavos
      });

      const data = await response.json();
      setClientSecret(data.clientSecret);
      return data.clientSecret;
    } catch (error) {
      setPaymentStatus(`Error creando el intento de pago: ${error.message}`);
      throw error;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    let currentClientSecret = clientSecret || await handleCreatePaymentIntent();

    const result = await stripe.confirmCardPayment(currentClientSecret, {
        payment_method: {
            card: elements.getElement(CardElement),
            billing_details: { name, email, address: { line1: address } },
        },
    });

    if (result.error) {
        setPaymentStatus(`Error: ${result.error.message}`);
    } else if (result.paymentIntent.status === 'succeeded') {
        setPaymentStatus('¡Pago realizado con éxito!');
        setShowDownloadButton(true);

        // Confirmar compra en el backend para actualizar stock
        const response = await fetch('http://localhost:4000/confirm-purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: cartProducts }),
        });

        const purchaseConfirmation = await response.json();
        if (purchaseConfirmation.success) {
            clearCartAfterPurchase(); // Vaciar el carrito tras la compra exitosa
            await clearCartInDatabase();
            await fetchAndStorePDF(); // Llamar a la función para obtener y almacenar el PDF
        } else {
            console.error('Error al actualizar el stock:', purchaseConfirmation.message);
        }
    }
  };

  // Función para obtener y almacenar el PDF en pdfBlob
  const fetchAndStorePDF = async () => {
    try {
      const response = await fetch('http://localhost:4000/download-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          customerEmail: email,
          items: cartProducts,
          totalAmount: totalAmount,
        }),
      });

      const blob = await response.blob();
      setPdfBlob(blob); // Almacena el Blob en el estado
    } catch (error) {
      console.error('Error obteniendo la factura:', error);
    }
  };

  // Función para descargar el PDF desde pdfBlob
  const downloadInvoice = () => {
    if (!pdfBlob) return;

    const url = window.URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invoice.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex items-center mb-6 text-sm text-gray-600">
        <span>TiendaCasco</span>
        <span className="ml-2 bg-yellow-200 px-2 py-1 rounded text-yellow-800">TEST MODE</span>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2">
          <h2 className="text-lg font-semibold mb-2">casco 25</h2>
          <p className="text-3xl font-bold mb-4">{totalAmount} COP</p>
        </div>

        <div className="md:w-1/2 bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Pago con tarjeta</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Nombre del titular</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre del titular"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo electrónico"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Dirección</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Dirección"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="mb-4">
              <CardElement options={cardStyle} />
            </div>

            <button 
              type="submit" 
              disabled={!stripe || !elements} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded"
            >
              Pagar
            </button>
          </form>

          {paymentStatus && <p className="mt-4">{paymentStatus}</p>}
          {showDownloadButton && (
            <button 
              onClick={downloadInvoice} 
              className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white p-3 rounded"
            >
              Descargar Factura
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Opciones de estilo para el campo de tarjeta
const cardStyle = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: 'Arial, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
};
