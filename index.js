const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const { error } = require("console");
const stripe = require('stripe')('sk_test_51QDtImIV69rnUAwOe77VHm9oHs1eOyyzYtYB29BJ2KIZUHHvLJLmulllksv1lNWPKYnXL1tDBTkVlfDr43Scrg2w00EBExTmxG');
app.use(express.json());
app.use(cors());
const PDFDocument = require('pdfkit');
const fs = require('fs');
const puppeteer = require('puppeteer');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 600, height: 300 });

//Database conexion con mongodb
/*mongoose.connect("mongodb+srv://kicristian250:1234567890@cluster0.zednc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
    tlsInsecure: true,
});*/

const mongoURI = "mongodb+srv://kicristian250:1234567890@cluster0.zednc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const retryDelay = 5000; // Tiempo de espera entre reintentos (5 segundos)

async function connectWithRetry() {
  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000 // Tiempo de espera para cada intento
    });
    console.log('Conectado a MongoDB');
  } catch (error) {
    console.error('Error de conexión a MongoDB. Reintentando en 5 segundos...', error.message);
    setTimeout(connectWithRetry, retryDelay);
  }
}

connectWithRetry();

//Api Creacion
app.get("/", (req, res) => {
    res.send("Express App is running")
})

// image almecenamiento engine
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({storage:storage})
//creando un punto final de carga para imágenes
app.use('/images', express.static('upload/images'))
app.post("/upload", upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    })
})

//esquema para crear productos
const Product = mongoose.model("Product", {
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: false,
    },
    category: {
        type: String,
        required: true,
    },
    new_price: {
        type: Number,
        required: true,
    },
    old_price: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    available: {
        type: Boolean,
        default: true,
    },
    stock: {
        type: Number,
        required: true, // Asegura que el campo de stock es obligatorio
        default: 0 // Define un valor por defecto, como 0
    }
});


// creando API para agregar productos
app.post('/addproduct', async(req, res) => {
    let products = await Product.find({});
    let id;
    if (products.length > 0){
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id +1;
    } else {
        id = 1;
    }
    const product = new Product({
        id: id,
        name: req.body.name,
        image: req.body.image,
        category: req.body.category,
        new_price: req.body.new_price,
        old_price: req.body.old_price,
    });
    console.log(product);
    await product.save();
    console.log("saved")
    res.json({
        success: true,
        name: req.body.name,
    })
})

// creando API para eliminar productos
app.post('/removeproduct', async(req, res) => {
    await Product.findOneAndDelete({id:req.body.id});
    console.log("remove");
    res.json({
        success: true,
        name: req.body.name,
    })
})

// creando API para obtener todos los productos
// Endpoint para obtener todos los productos con filtros
app.get('/allproducts', async (req, res) => {
    const { minStock, maxStock, minPrice, maxPrice, name } = req.query;

    // Crear el filtro base
    const filters = {};

    if (minStock || maxStock) {
        filters.stock = {};
        if (minStock) filters.stock.$gte = parseInt(minStock);
        if (maxStock) filters.stock.$lte = parseInt(maxStock);
    }

    if (minPrice || maxPrice) {
        filters.new_price = {};
        if (minPrice) filters.new_price.$gte = parseFloat(minPrice);
        if (maxPrice) filters.new_price.$lte = parseFloat(maxPrice);
    }

    if (name) {
        filters.name = { $regex: name, $options: 'i' }; // Búsqueda por nombre sin sensibilidad a mayúsculas
    }

    try {
        const products = await Product.find(filters);
        console.log("Filtered products fetched");
        res.send(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Error al obtener los productos" });
    }
});


// Endpoint de confirmación de compra y actualización de inventario
app.post('/confirm-purchase', async (req, res) => {
    const { items } = req.body;

    try {
        for (const item of items) {
            const product = await Product.findOne({ id: item.id });

            if (!product) {
                return res.status(404).json({ success: false, message: `Producto con ID ${item.id} no encontrado` });
            }

            if (product.stock >= item.quantity) {
                // Actualiza el stock del producto
                await Product.updateOne(
                    { id: item.id },
                    { $inc: { stock: -item.quantity } }
                );

                // Registra la venta
                const sale = new Sale({
                    productId: item.id,
                    productName: product.name,
                    quantity: item.quantity,
                    totalPrice: product.new_price * item.quantity,
                });
                await sale.save();
            } else {
                return res.status(400).json({ success: false, message: `Stock insuficiente para ${product.name}` });
            }
        }

        res.json({ success: true, message: 'Compra confirmada y ventas registradas' });
    } catch (error) {
        console.error('Error al confirmar la compra:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

// Modelo de usuario de esquema
const User = mongoose.model('User', {
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    cartData: {
        type: Object,
    },
    date: {
        type: Date,
        default: Date.now,
    },
})

// Creando un punto final para registrar al usuario
app.post('/signup', async(req, res) => {
    let check = await User.findOne({email: req.body.email});
    if(check){
        return res.status(400).json({success: false, errors: "Existing user found with same email address"});
    }
    let cart = {};
    for (let i = 0; i < 300; i++){
        cart[i] = 0;
    }
    const user = new User({
        name: req.body.username,
        email:req.body.email,
        password:req.body.password,
        cartData: cart,
    })
    await user.save();
    const data = {
        user: {
            id: user.id
        }
    }
    const token = jwt.sign(data, 'secret_tienda');
    res.json({success: true, token})
})

// Creación de un punto final para el inicio de sesión del usuario
app.post('/login', async (req, res) => {
    let user = await User.findOne({email:req.body.email});
    if(user) {
        const passMatch = req.body.password === user.password;
        if(passMatch){
            const data = {
                user: {
                    id: user.id
                }
            }
            const token = jwt.sign(data, 'secret_tienda');
            res.json({success:true, token});
        } else {
            res.json({success:false, errors:"Wrong password"});
        } 
    } else {
        res.json({success:false, errors:"Wrong Email address"})
    }
})

// Creando un punto final para los últimos productos
app.get('/newcollections', async(req, res) => {
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    console.log("Newcollection Fetched")
    res.send(newcollection);
})

// Creación de puntos finales para productos populares
app.get('/popularproducts', async (req, res) => {
    let products = await Product.find({category: "men"});
    let popularproducts = products.slice(0,4);
    console.log("popular products Fetched");
    res.send(popularproducts);
})


//creando middleware para buscar usuarios
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({errors: "please authenticate using valid login"})
    } else {
        try{
            const data = jwt.verify(token, 'secret_tienda');
            req.user = data.user;
            next();
        }catch (error){
            res.status(401).send({errors: "please authenticate using valid token"});
        }
    }
}

//creando un punto final para agregar productos en cartdata
app.post('/addtocart', fetchUser, async (req, res) => {
    console.log("Added", req.body.itemId)
    let userData = await User.findOne({_id: req.user.id});
    userData.cartData[req.body.itemId] +=1;
    await User.findOneAndUpdate({_id:req.user.id}, {cartData: userData.cartData});
    res.send("Added");
})

// creando un punto final para eliminar cartData
app.post('/removefromcart', fetchUser, async (req, res) => {
    console.log("Removed", req.body.itemId)
    let userData = await User.findOne({_id: req.user.id});
    if (userData.cartData[req.body.itemId] > 0)
    userData.cartData[req.body.itemId] -=1;
    await User.findOneAndUpdate({_id:req.user.id}, {cartData: userData.cartData});
    res.send("Removed");
})

// creando un punto final para obtener datos del carrito
app.post('/getcart', fetchUser, async(req, res) => {
    console.log('Get cart');
    let userData = await User.findOne({_id: req.user.id});
    res.json(userData.cartData);
})

app.listen(port, (error) => {
    if (!error) {
        console.log("Server is running on port " + port);
    } else {
        console.log("Error: " + error);
    }
}) 

app.post('/create-payment-intent', async (req, res) => {
    const { amount } = req.body;
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'cop', // Asumiendo que usas COP
        automatic_payment_methods: {
          enabled: true,
        },
      });
      res.send({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error('Error creating payment intent:', error);
      res.status(500).send({ error: 'Error al crear el pago, por favor intenta de nuevo.' });
    }
  });

  app.post('/download-invoice', async (req, res) => {
    const { customerName, customerEmail, items, totalAmount } = req.body;
  
    // Crear HTML para la plantilla de factura
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Factura de Compra</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; color: #333; }
          .container { width: 80%; margin: 0 auto; padding: 20px; border: 1px solid #ddd; }
          .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #003366; padding-bottom: 20px; }
          .header img { width: 100px; }
          .header h1 { color: #003366; }
          .details { margin-top: 20px; }
          .details p { margin: 5px 0; }
          .table { width: 100%; margin-top: 20px; border-collapse: collapse; }
          .table th, .table td { padding: 10px; border: 1px solid #ddd; text-align: left; }
          .table th { background-color: #003366; color: #fff; }
          .total { text-align: right; font-size: 1.2em; margin-top: 20px; color: #003366; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="../assets/logo.svg" alt="Logo de la tienda">
            <h1>Factura de Compra</h1>
          </div>
  
          <div class="details">
            <p><strong>Nombre del Cliente:</strong> ${customerName}</p>
            <p><strong>Correo del Cliente:</strong> ${customerEmail}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Nombre de la tienda:</strong> Tienda Y&H</p>
          </div>
  
          <table class="table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>$${item.price}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.price * item.quantity}</td>
                </tr>`).join('')}
            </tbody>
          </table>
  
          <p class="total">Total: $${totalAmount}</p>
        </div>
      </body>
      </html>
    `;
  
    try {
      // Usa Puppeteer para generar el PDF
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
  
      // Cargar el contenido HTML
      await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
  
      // Generar el PDF
      const pdfPath = path.join(__dirname, 'invoice.pdf');
      await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
      });
  
      await browser.close();
  
      // Enviar el archivo PDF al cliente
      res.download(pdfPath, 'invoice.pdf', (err) => {
        if (err) {
          console.error('Error al descargar la factura:', err);
          res.status(500).send('Error al generar la factura.');
        }
        fs.unlinkSync(pdfPath); // Eliminar el archivo después de la descarga
      });
    } catch (error) {
      console.error('Error generando el PDF:', error);
      res.status(500).send('Error al generar el PDF.');
    }
  });

  // Endpoint para limpiar el carrito del usuario autenticado
  app.post('/clearcart', fetchUser, async (req, res) => {
    try {
        console.log("Usuario autenticado:", req.user); // Verifica que `req.user` está definido

        let emptyCart = {};
        for (let i = 0; i < 300; i++) {
            emptyCart[i] = 0;
        }

        // Actualizar el carrito del usuario
        const updateResult = await User.updateOne(
            { _id: req.user.id },
            { $set: { cartData: emptyCart } }
        );

        if (updateResult.modifiedCount > 0) {
            console.log("El carrito ha sido vaciado correctamente para el usuario:", req.user.id);
            res.json({ success: true, message: 'El carrito ha sido vaciado correctamente' });
        } else {
            console.error("No se pudo vaciar el carrito, el usuario no fue encontrado o no se modificó el documento");
            res.status(400).json({ success: false, message: 'No se pudo vaciar el carrito' });
        }
    } catch (error) {
        console.error('Error al limpiar el carrito:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor al intentar limpiar el carrito' });
    }
});

// Endpoint para actualizar un producto
app.put('/updateproduct', async (req, res) => {
    const { id, name, image, category, new_price, old_price, stock } = req.body;

    try {
        const updatedProduct = await Product.findOneAndUpdate(
            { id },
            { name, image, category, new_price, old_price, stock },
            { new: true }
        );

        if (updatedProduct) {
            console.log("Producto actualizado:", updatedProduct);
            res.json({ success: true, message: 'Producto actualizado correctamente' });
        } else {
            console.error("No se encontró el producto con el ID especificado.");
            res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
    } catch (error) {
        console.error("Error al actualizar el producto:", error);
        res.status(500).json({ success: false, message: 'Error al actualizar el producto' });
    }
});


// Esquema para ventas
const Sale = mongoose.model("Sale", {
    productId: {
        type: Number,
        required: true,
    },
    productName: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    saleDate: {
        type: Date,
        default: Date.now,
    },
    totalPrice: {
        type: Number,
        required: true,
    }
});



// Endpoint para obtener datos de ventas agregadas
app.get('/sales-data', async (req, res) => {
    try {
        // Ventas diarias
        const dailySales = await Sale.aggregate([
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$saleDate" } }, totalSales: { $sum: "$totalPrice" }, totalQuantity: { $sum: "$quantity" } } },
            { $sort: { _id: 1 } }
        ]);

        // Ventas mensuales
        const monthlySales = await Sale.aggregate([
            { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$saleDate" } }, totalSales: { $sum: "$totalPrice" }, totalQuantity: { $sum: "$quantity" } } },
            { $sort: { _id: 1 } }
        ]);

        // Total de ventas
        const totalSales = await Sale.aggregate([
            { $group: { _id: null, totalSales: { $sum: "$totalPrice" }, totalQuantity: { $sum: "$quantity" } } }
        ]);

        res.json({
            dailySales,
            monthlySales,
            totalSales: totalSales[0]
        });
    } catch (error) {
        console.error('Error al obtener datos de ventas:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});


// Endpoint para obtener los productos más vendidos con filtros y ordenamiento
app.get('/top-products', async (req, res) => {
    try {
        const { dateFilter, sortBy, sortOrder = 'desc' } = req.query; // `sortOrder` por defecto es descendente

        // Calcular la fecha de inicio en función del filtro
        let startDate;
        const currentDate = new Date();

        if (dateFilter === 'day') {
            startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        } else if (dateFilter === 'month') {
            startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        } else if (dateFilter === 'year') {
            startDate = new Date(currentDate.getFullYear(), 0, 1);
        } else {
            startDate = new Date(0); // Sin límite de fecha
        }

        // Consultar los productos más vendidos desde la fecha de inicio
        const topProducts = await Sale.aggregate([
            { $match: { saleDate: { $gte: startDate } } },
            {
                $group: {
                    _id: "$productId",
                    productName: { $first: "$productName" },
                    totalQuantity: { $sum: "$quantity" },
                    totalIncome: { $sum: "$totalPrice" }
                }
            }
        ]);

        // Consultar detalles adicionales del producto, como la imagen y el precio unitario
        const enrichedProducts = await Promise.all(topProducts.map(async (product) => {
            const productDetails = await Product.findOne({ id: product._id });
            return {
                ...product,
                image: productDetails?.image || '',
                unitPrice: productDetails?.new_price || 0
            };
        }));

        // Ordenar los productos según `sortBy` y `sortOrder`
        if (sortBy) {
            enrichedProducts.sort((a, b) => {
                const fieldA = a[sortBy];
                const fieldB = b[sortBy];
                return sortOrder === 'asc' ? fieldA - fieldB : fieldB - fieldA;
            });
        }

        res.json(enrichedProducts);
    } catch (error) {
        console.error("Error al obtener los productos más vendidos:", error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

app.get('/sales-details', async (req, res) => {
    const { type } = req.query;
  
    try {
      let details;
      if (type === 'totalQuantity') {
        // Información de cantidad total vendida por producto
        details = await Sale.aggregate([
          {
            $group: {
              _id: "$productId",
              productName: { $first: "$productName" },
              quantity: { $sum: "$quantity" },
              saleDate: { $first: "$saleDate" }
            }
          },
          { $sort: { quantity: -1 } } // Ordenar por cantidad de mayor a menor
        ]);
      } else if (type === 'totalSales') {
        // Información de total de ventas por producto
        details = await Sale.aggregate([
          {
            $group: {
              _id: "$productId",
              productName: { $first: "$productName" },
              totalPrice: { $sum: "$totalPrice" },
              saleDate: { $first: "$saleDate" }
            }
          },
          { $sort: { totalPrice: -1 } } // Ordenar por total de ventas de mayor a menor
        ]);
      } else if (type === 'dailySales') {
        // Información de ventas diarias
        details = await Sale.aggregate([
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$saleDate" } },
              totalSales: { $sum: "$totalPrice" },
              totalQuantity: { $sum: "$quantity" }
            }
          },
          { $sort: { _id: 1 } } // Ordenar por fecha de manera ascendente
        ]);
      } else if (type === 'monthlySales') {
        // Información de ventas mensuales
        details = await Sale.aggregate([
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m", date: "$saleDate" } },
              totalSales: { $sum: "$totalPrice" },
              totalQuantity: { $sum: "$quantity" }
            }
          },
          { $sort: { _id: 1 } } // Ordenar por fecha de manera ascendente
        ]);
      }
  
      if (!details || details.length === 0) {
        return res.status(404).json({ message: "No se encontraron datos para el tipo solicitado" });
      }
  
      res.json(details);
    } catch (error) {
      console.error("Error al obtener detalles de ventas:", error);
      res.status(500).json({ message: "Error al obtener los detalles de ventas" });
    }
  });
  

  async function getSalesDataForMonth(month) {
    const [year, monthIndex] = month.split('-'); // Dividir el año y el mes
    const startDate = new Date(year, monthIndex - 1, 1);
    const endDate = new Date(year, monthIndex, 0); // Último día del mes
  
    // Agregar filtro de fechas y sumar ventas
   const data = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalPrice" },
          totalQuantity: { $sum: "$quantity" },
          dailySales: {
            $push: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$saleDate" } },
              totalSales: "$totalPrice",
              quantity: "$quantity",
              productName: "$productName"
            }
          }
        }
      }
    ]);
  
    // Si no hay datos, devuelve valores predeterminados
    return data.length > 0 ? data[0] : { totalSales: 0, totalQuantity: 0, dailySales: [] };
  }

  app.post('/download-report', async (req, res) => {
    const { month } = req.body;

    try {
        // Obtener datos del mes actual y del mes anterior
        const currentMonthData = await getSalesDataForMonth(month);
        const previousMonthData = await getSalesDataForMonth(getPreviousMonth(month));

        // Comparación de índices
        const salesIncrease = previousMonthData.totalSales
            ? ((currentMonthData.totalSales - previousMonthData.totalSales) / previousMonthData.totalSales * 100).toFixed(2)
            : "N/A";
        const quantityIncrease = previousMonthData.totalQuantity
            ? ((currentMonthData.totalQuantity - previousMonthData.totalQuantity) / previousMonthData.totalQuantity * 100).toFixed(2)
            : "N/A";

        // Gráfico de ventas diarias
        const dailySalesData = {
            labels: currentMonthData.dailySales.map(sale => sale.date),
            datasets: [{
                label: 'Ventas Diarias',
                data: currentMonthData.dailySales.map(sale => sale.totalSales),
                backgroundColor: 'rgba(75,192,192,0.4)',
                borderColor: 'rgba(75,192,192,1)',
                fill: true,
            }]
        };
        const dailySalesChart = await chartJSNodeCanvas.renderToDataURL({
            type: 'line',
            data: dailySalesData,
        });

        // Gráfico de ventas mensuales
        const monthlySalesData = {
            labels: [getPreviousMonth(month), month],
            datasets: [{
                label: 'Ventas Mensuales',
                data: [previousMonthData.totalSales, currentMonthData.totalSales],
                backgroundColor: 'rgba(153,102,255,0.4)',
                borderColor: 'rgba(153,102,255,1)',
                fill: true,
            }]
        };
        const monthlySalesChart = await chartJSNodeCanvas.renderToDataURL({
            type: 'bar',
            data: monthlySalesData,
        });

        // Datos adicionales
        const topProduct = currentMonthData.dailySales.reduce((prev, current) => (prev.totalSales > current.totalSales) ? prev : current);
        const mostSoldProduct = currentMonthData.dailySales.reduce((prev, current) => (prev.quantity > current.quantity) ? prev : current);

        // Crear HTML para el informe
        const htmlContent = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <title>Informe de Ventas - ${month}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
              h1 { text-align: center; color: #4a90e2; }
              h2 { color: #333; margin-top: 30px; }
              .section { margin-bottom: 20px; }
              .data-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
              .data-table th, .data-table td { border: 1px solid #ddd; padding: 8px; text-align: center; }
              .data-table th { background-color: #f2f2f2; color: #333; }
              .chart { text-align: center; margin: 20px 0; }
            </style>
          </head>
          <body>
            <h1>Informe de Ventas - ${month}</h1>
            
            <section class="section">
              <h2>Resumen de Ventas</h2>
              <p><strong>Ingresos Totales:</strong> $${currentMonthData.totalSales}</p>
              <p><strong>Ventas Totales:</strong> ${currentMonthData.totalQuantity}</p>
            </section>
            
            <section class="section">
              <h2>Comparación con el Mes Anterior</h2>
              <p><strong>Aumento de Ingresos:</strong> ${salesIncrease}%</p>
              <p><strong>Aumento de Ventas:</strong> ${quantityIncrease}%</p>
            </section>
            
            <section class="chart">
              <h2>Gráfica de Ventas Diarias</h2>
              <img src="${dailySalesChart}" alt="Gráfica de Ventas Diarias">
            </section>

            <section class="chart">
              <h2>Gráfica de Ventas Mensuales</h2>
              <img src="${monthlySalesChart}" alt="Gráfica de Ventas Mensuales">
            </section>

            <section class="section">
              <h2>Datos Adicionales</h2>
              <p><strong>Producto con Mayor Ingreso:</strong> ${topProduct.productName} - $${topProduct.totalSales}</p>
              <p><strong>Producto Más Vendido:</strong> ${mostSoldProduct.productName} - ${mostSoldProduct.quantity} unidades</p>
            </section>

            <section class="section">
              <h2>Ventas Detalladas por Producto</h2>
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad Vendida</th>
                    <th>Ingresos Generados</th>
                  </tr>
                </thead>
                <tbody>
                  ${currentMonthData.dailySales.map(sale => `
                    <tr>
                      <td>${sale.productName}</td>
                      <td>${sale.quantity}</td>
                      <td>$${sale.totalSales}</td>
                    </tr>`).join('')}
                </tbody>
              </table>
            </section>
          </body>
          </html>
        `;

        try {
            // Usa Puppeteer para generar el PDF
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
        
            // Cargar el contenido HTML
            await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
        
            // Generar el PDF
            const pdfPath = path.join(__dirname, 'invoice.pdf');
            await page.pdf({
              path: pdfPath,
              format: 'A4',
              printBackground: true,
            });
        
            await browser.close();
        
            // Enviar el archivo PDF al cliente
            res.download(pdfPath, 'invoice.pdf', (err) => {
              if (err) {
                console.error('Error al descargar la factura:', err);
                res.status(500).send('Error al generar la factura.');
              }
              fs.unlinkSync(pdfPath); // Eliminar el archivo después de la descarga
            });
          } catch (error) {
            console.error('Error generando el PDF:', error);
            res.status(500).send('Error al generar el PDF.');
          }

    } catch (error) {
        console.error('Error al generar el informe PDF:', error);
        res.status(500).send('Error al generar el PDF.');
    }
});

  

// Función auxiliar para obtener el mes anterior
function getPreviousMonth(month) {
  const [year, monthIndex] = month.split('-');
  const date = new Date(year, parseInt(monthIndex) - 2);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
}

  