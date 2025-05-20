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
    let {nombre, precio, image} = req.body;
    let result = await productModel.create({nombre, precio, image});
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
    let {pid} = req.params;
    let userToReplace = req.body;
    if (!userToReplace.nombre || !userToReplace.precio || !userToReplace.image) {
        return res.send({ status: "error", message: "Faltan datos" });
    };
    let result = await productModel.updateOne({_id: pid}, userToReplace);
    res.send({result:"success", message: "Producto actualizado", payload: result});
});


export default router;