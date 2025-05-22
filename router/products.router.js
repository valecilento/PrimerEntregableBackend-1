import { Router } from "express";
import { productModel } from "../models/products.model.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    let products = await productModel.find().lean();
    res.send({result:"success", products});
  } catch (error) {
    console.error(error);
    res.status(500).send({ result: "error", message: "Error al obtener productos" });
  }
});
router.get("/:pid", async (req, res) => {
  const { pid } = req.params;
  try {
    let product = await productModel.find({ _id: pid });
    res.send(({result:"success", payload: product}));
  } catch (error) {
    console.error(error);
  }
});

router.post("/", async (req, res) => {
  try {
    let {name, price, image} = req.body;
    let result = await productModel.create({name, price, image});
    res.send({result:"success", message: "Producto agregado", payload: result});
  }
  catch (error) {
    console.error(error);
    res.status(500).send({result:"error", message: "Error al agregar el producto"});
  }
});

router.delete("/:pid", async (req, res) => {
    let pid = req.params.pid;
    let result = await productModel.deleteOne({_id: pid});
    res.send({result:"success", message: "Producto eliminado", payload: result});
});

router.put("/:pid", async (req, res) => {
  try {
    const { pid } = req.params;
    const { name, price, image } = req.body;
    if (!name || !price) {
        return res.send({ status: "error", message: "No se pudo actualizar el producto" });
    };
    const updatedProduct = await productModel.findByIdAndUpdate(pid, { name, price }, { new: true } 
        );
    if (!updatedProduct) {
        return res.status(404).json({ result: "error", message: "Producto no encontrado" });
    }
    res.json({ result: "success", message: "Producto actualizado", payload: updatedProduct });
    } catch (error) {
        console.error("Error al actualizar el producto:", error);
        res.status(500).json({ result: "error", message: "Error interno en el servidor" });
    }
});

export default router;