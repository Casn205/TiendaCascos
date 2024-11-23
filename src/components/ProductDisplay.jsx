/* eslint-disable react/prop-types */
import { MdStar } from "react-icons/md"
import product_rt_1 from "../assets/product_rt_1.png"
import product_rt_2 from "../assets/product_rt_2.png"
import product_rt_3 from "../assets/product_rt_3.png"
import product_rt_4 from "../assets/product_rt_4.png"
import { useContext, useState } from "react"
import { ShopContext } from "../Context/ShopContext"

const ProductDisplay = (props) => {
    const { product } = props;
    const { addToCart, cartItems } = useContext(ShopContext);
    const [quantity, setQuantity] = useState(1);

    // Obtener la cantidad actual en el carrito para este producto
    const currentQuantityInCart = cartItems[product.id] || 0;

    const handleAddToCart = () => {
        // Verificar que no se exceda el stock disponible
        if (currentQuantityInCart + quantity > product.stock) {
            alert("No puedes agregar más de la cantidad disponible.");
            return;
        }
        addToCart(product.id, quantity);
    };

    return (
        <section>
            <div className="flex flex-col gap-14 xl:flex-row">
                {/* lado izquierdo */}
                <div className="flex gap-x-2 xl:flex-1">
                    <div className="flex flex-col gap-[7px] flex-wrap">
                        <img src={product_rt_1} alt="prdctImg" className="max-h-[99px]" />
                        <img src={product_rt_2} alt="prdctImg" className="max-h-[99px]" />
                        <img src={product_rt_3} alt="prdctImg" className="max-h-[99px]" />
                        <img src={product_rt_4} alt="prdctImg" className="max-h-[99px]" />
                    </div>
                    <div>
                        <img src={product.image} alt="" />
                    </div>
                </div>
                {/* lado derecho */}
                <div className="flex-col flex xl:flex-[1.7]">
                    <h3 className="h3">{product.name}</h3>
                    <div className="flex gap-x-2 text-secondary medium-22">
                        <MdStar />
                        <MdStar />
                        <MdStar />
                        <MdStar />
                        <p>(311)</p>
                    </div>
                    <div className="flex gap-x-6 medium-20 my-4">
                        <div className="line-through">{product.old_price}</div>
                        <div className="text-secondary">{product.new_price}</div>
                    </div>
                    <p className="text-gray-500 mb-2">Cantidad disponible: {product.stock}</p>

                    <div className="mb-4">
                        <h4 className="bold-16">Seleccionar Talla:</h4>
                        <div className="flex gap-3 my-3">
                            <div className="ring-2 ring-slate-900 h-10 w-10 flexcenter cursor-pointer">S</div>
                            <div className="ring-2 ring-slate-900/10 h-10 w-10 flexcenter cursor-pointer">M</div>
                            <div className="ring-2 ring-slate-900/10 h-10 w-10 flexcenter cursor-pointer">L</div>
                            <div className="ring-2 ring-slate-900/10 h-10 w-10 flexcenter cursor-pointer">XL</div>
                        </div>

                        {/* Controles para ajustar la cantidad */}
                        <div className="flex items-center mb-4">
                            <button
                                onClick={() => setQuantity(prev => Math.max(prev - 1, 1))}
                                className="px-3 py-1 border border-gray-400"
                            >-</button>
                            <span className="px-4">{quantity}</span>
                            <button
                                onClick={() => setQuantity(prev => Math.min(prev + 1, product.stock - currentQuantityInCart))}
                                className="px-3 py-1 border border-gray-400"
                            >+</button>
                        </div>

                        <div className="flex flex-col gap-y-3 mb-4 max-w-[555px]">
                            <button onClick={handleAddToCart} className="btn_dark_outline !rounded-none uppercase regular-14 tracking-widest">
                                Agregar al carrito
                            </button>
                            <button className="btn_dark_rounded !rounded-none uppercase regular-14 tracking-widest">
                                Comprar ahora
                            </button>
                        </div>
                        
                        <p><span className="medium-16 text-tertiary">Categoría :</span> Mujeres | Chaqueta | Invierno</p>
                        <p><span className="medium-16 text-tertiary">Etiquetas :</span> Moderno | Último</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProductDisplay;
