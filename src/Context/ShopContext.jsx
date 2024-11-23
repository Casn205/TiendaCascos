import { createContext, useEffect, useState } from "react";

export const ShopContext = createContext(null);

const BACKEND_URL = "http://localhost:4000";

const getDefaultCart = () => {
    let cart = {};
    for (let index = 0; index < 300 + 1; index++) {
        cart[index] = 0;
    }
    return cart;
}

const ShopContextProvider = (props) => {
    const [cartItems, setCartItems] = useState(getDefaultCart());
    const [all_products, setAll_products] = useState([]);

    useEffect(() => {
        fetch(`${BACKEND_URL}/allproducts`)
            .then((response) => response.json())
            .then((data) => setAll_products(data));

        if (localStorage.getItem('auth-token')) {
            fetch(`${BACKEND_URL}/getcart`, {
                method: 'POST',
                headers: {
                    Accept: 'application/form-data',
                    'auth-token': `${localStorage.getItem('auth-token')}`,
                    'Content-Type': 'application/json',
                },
                body: "",
            }).then((response) => response.json())
              .then((data) => setCartItems(data));
        }
    }, [])

    const addToCart = (itemId, quantity = 1) => {
        const product = all_products.find((product) => product.id === itemId);
        
        if (product) {
            const currentQuantityInCart = cartItems[itemId] || 0;
            if (currentQuantityInCart + quantity > product.stock) {
                alert("No puedes agregar más de la cantidad disponible.");
                return;
            }

            setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }))
        if (localStorage.getItem('auth-token')) {
            fetch(`${BACKEND_URL}/addtocart`, {
                method: 'POST',
                headers: {
                    Accept: 'application/form-data',
                    'auth-token': `${localStorage.getItem('auth-token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "itemId": itemId }),
            }).then((response) => response.json())
              .then((data) => console.log(data));
        }
        }
    };

    const removeFromCart = (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }))
        if (localStorage.getItem('auth-token')) {
            fetch(`${BACKEND_URL}/removefromcart`, {
                method: 'POST',
                headers: {
                    Accept: 'application/form-data',
                    'auth-token': `${localStorage.getItem('auth-token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "itemId": itemId }),
            }).then((response) => response.json())
              .then((data) => console.log(data));
        }
    }

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                const itemInfo = all_products.find((product) => product.id === Number(item));
                totalAmount += itemInfo.new_price * cartItems[item];
            }
        }
        return totalAmount;
    }

    const getTotalCartItems = () => {
        let totalItem = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                totalItem += cartItems[item];
            }
        }
        return totalItem;
    }

    // Función para limpiar el carrito en la base de datos
    const clearCartInDatabase = async () => {
        if (localStorage.getItem('auth-token')) {
            try {
                const response = await fetch(`${BACKEND_URL}/clearcart`, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'auth-token': `${localStorage.getItem('auth-token')}`,
                        'Content-Type': 'application/json',
                    },
                });
                const result = await response.json();
                if (result.success) {
                    console.log("Carrito eliminado en la base de datos:", result.message); // Confirmación
                    setCartItems(getDefaultCart()); // Vacía el carrito en el contexto
                } else {
                    console.error("Error al vaciar el carrito:", result.message);
                }
            } catch (error) {
                console.error("Error al limpiar el carrito en la base de datos:", error);
            }
        } else {
            console.error("Token de autenticación no encontrado");
        }
    };
    
    const confirmPurchase = async () => {
        const productsToUpdate = all_products
            .filter(product => cartItems[product.id] > 0)
            .map(product => ({
                id: product.id,
                quantity: cartItems[product.id]
            }));
    
        try {
            const response = await fetch(`${BACKEND_URL}/confirm-purchase`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('auth-token'), // Asegura que estás enviando el token de autenticación
                },
                body: JSON.stringify({ items: productsToUpdate })
            });
    
            const purchaseConfirmation = await response.json();
            if (purchaseConfirmation.success) {
                console.log('Compra confirmada y carrito vaciado en la base de datos');
                await clearCartInDatabase(); // Llamada a la función para limpiar el carrito en la base de datos
            } else {
                console.error('Error al confirmar la compra:', purchaseConfirmation.message);
            }
        } catch (error) {
            console.error("Error al confirmar la compra:", error);
        }
    };
    
    

    // Obtiene los productos en el carrito en formato [{ name, price, quantity }]
    const getCartProducts = () => {
        return all_products
            .filter(product => cartItems[product.id] > 0)
            .map(product => ({
                name: product.name,
                price: product.new_price,
                quantity: cartItems[product.id]
            }));
    };

    const contextValue = { 
        getTotalCartItems, 
        getTotalCartAmount, 
        all_products, 
        cartItems, 
        addToCart, 
        removeFromCart, 
        confirmPurchase, 
        getCartProducts,
        setCartItems, 
        getDefaultCart,
        clearCartInDatabase
    };

    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    );
}

export default ShopContextProvider;





/*

import { createContext, useEffect, useState } from "react";

export const ShopContext = createContext(null);

// Define the backend URL as a constant
const BACKEND_URL = "http://localhost:4000";

const getDefaultCart = () => {
    let cart = {};
    for (let index = 0; index < 300 + 1; index++) {
        cart[index] = 0;
    }
    return cart;
}

const ShopContextProvider = (props) => {
    const [cartItems, setCartItems] = useState(getDefaultCart());
    const [all_products, setAll_products] = useState([]);

    useEffect(() => {
        fetch(`${BACKEND_URL}/allproducts`)
            .then((response) => response.json())
            .then((data) => setAll_products(data));

        if (localStorage.getItem('auth-token')) {
            fetch(`${BACKEND_URL}/getcart`, {
                method: 'POST',
                headers: {
                    Accept: 'application/form-data',
                    'auth-token': `${localStorage.getItem('auth-token')}`,
                    'Content-Type': 'application/json',
                },
                body: "",
            }).then((response) => response.json())
              .then((data) => setCartItems(data));
        }
    }, [])

    const addToCart = (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }))
        if (localStorage.getItem('auth-token')) {
            fetch(`${BACKEND_URL}/addtocart`, {
                method: 'POST',
                headers: {
                    Accept: 'application/form-data',
                    'auth-token': `${localStorage.getItem('auth-token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "itemId": itemId }),
            }).then((response) => response.json())
              .then((data) => console.log(data));
        }
    }

    const removeFromCart = (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }))
        if (localStorage.getItem('auth-token')) {
            fetch(`${BACKEND_URL}/removefromcart`, {
                method: 'POST',
                headers: {
                    Accept: 'application/form-data',
                    'auth-token': `${localStorage.getItem('auth-token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "itemId": itemId }),
            }).then((response) => response.json())
              .then((data) => console.log(data));
        }
    }

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                let itemInfo = all_products.find((product) => product.id === Number(item));
                totalAmount += itemInfo.new_price * cartItems[item];
            }
        }
        return totalAmount;
    }

    const getTotalCartItems = () => {
        let totalItem = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                totalItem += cartItems[item];
            }
        }
        return totalItem;
    }

    const contextValue = { getTotalCartItems, getTotalCartAmount, all_products, cartItems, addToCart, removeFromCart };

    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider;*/