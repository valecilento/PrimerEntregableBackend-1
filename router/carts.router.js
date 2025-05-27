import { Router } from "express";
import { cartModel } from "../models/cart.model.js";
import { wss } from "../server.js";

const router = Router();

// Crear un carrito vacío
router.post("/", async (req, res) => {
  try {
    const newCart = await cartModel.create({ products: [] });
     broadcastCarts();
 
    res.json({result:"success", message: "Carrito creado", cart: newCart});
  } catch (error) {
    res.status(500).json({ result: "error", message: error.message });
  }
});

// Obtener todos los carritos
router.get("/carts", async (req, res) => {
  try {
    const carts = await cartModel.find().populate("products.product");
    res.json({ result: "success", carts });
  } catch (error) {
    res.status(500).json({ result: "error", message: error.message });
  }
});

// Agrego el producto a un carrito
router.post("/:cid/product/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  try {
    const cart = await cartModel.findById(cid);
    if (!cart) return res.status(404).json({ result: "error", message: "Carrito no encontrado" });

    const prodIndex = cart.products.findIndex(p => p.product.toString() === pid);
    if (prodIndex !== -1) {
      cart.products[prodIndex].quantity += 1;
    } else {
      cart.products.push({ product: new mongoose.Types.ObjectId(pid), quantity: 1  });
    }
    await cart.save();
    broadcastCarts();
    res.json({ result: "success", message: "Producto agregado al carrito", cart });
  } catch (error) {
    res.status(500).json({ result: "error", message: error.message });
  }
});
async function broadcastCarts() {
  try{ 
      const cartsData = await cartModel.find().populate("products.product").lean();
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "carts", payload: cartsData }));
        }
        });
    } catch (error) {
        console.error("Error al enviar los carritos vía WebSocket:", error);
    }
}

export default router;