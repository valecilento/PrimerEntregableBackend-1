const socket = new WebSocket('ws://localhost:4000');

socket.onmessage = async (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "products") {
    const productList = document.getElementById('product-list');
    productList.innerHTML = "";
    data.payload.forEach(product => {
      const li = document.createElement("li");
      li.setAttribute("id", product._id);
      li.innerHTML = `
                <img src="${product.image}" alt="${product.name}" width="100">
                <span id="name-${product._id}">${product.name}</span>
                <input type="text" id="input-name-${product._id}" class="form-control d-none" value="${product.name}">
                <span id="price-${product._id}">$ ${product.price}</span>
                <input type="number" id="input-price-${product._id}" class="form-control d-none" value="${product.price}">

                <button class="btn btn-warning" onclick="editProduct('${product._id}')">Editar</button>
                <button class="btn btn-success d-none" onclick="saveProduct('${product._id}')">Guardar</button>
                <button class="btn btn-danger" onclick="deleteProduct('${product._id}')">Eliminar</button>
            `;
      productList.appendChild(li);
    });
  }
  if (data.type === "carts") {
    const cartList = document.getElementById('cart-list');
    if (cartList) {
      cartList.innerHTML = "";
      const product = data?.payload?.[0]?.products?.[0]?.product; // uso opcional chaining para evitar errores si no hay productos (devuelve undefined si no hay productos)
      // Verifica si el producto existe antes de continuar
      if (!product) {
        console.warn("No se encontró producto válido en la estructura recibida.");
        return; // si no encuentra el producto, no continúa
      }
      data.payload.forEach(cart => {
        const li = document.createElement("li");
        li.setAttribute("id", cart._id);
        li.innerHTML = `
                <strong>Carrito ID:</strong> ${cart._id}
                <img src="${product.image}" alt="${product.name}" width="100">
                <span id="name-${product._id}">${product.name}</span>
                <span id="price-${product._id}">$ ${product.price}</span>
                <button class="btn btn-success d-none" onclick="addProductToCart('${cart._id}','${product._id}')">Guardar</button>

                <ul>
                    ${cart.products.map(p => `
                        <li>${p.product.name} - Cantidad: ${p.quantity}</li>
                    `).join('')}
                </ul>
            `;
        cartList.appendChild(li);
      });
    }
  }
};

async function sendProduct() {
  const name = document.getElementById('productName').value;
  const price = document.getElementById('productPrice').value;
  const imageInput = document.getElementById('productImage').files[0];

  if (name && price && imageInput) {
    try {
      const formData = new FormData();
      formData.append("image", imageInput);
      const imgResponse = await fetch("/upload-img", {
        method: "POST",
        body: formData
      });

      if (!imgResponse.ok) {
        throw new Error(`Error ${imgResponse.status}: No se pudo subir la imagen`);
      }

      const imgResult = await imgResponse.json();
      const productData = { name, price, image: imgResult.imageUrl };

      const productResponse = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData)
      });
      if (!productResponse.ok) {
        throw new Error(`Error ${productResponse.status}: No se pudo guardar el producto`);
      }
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(productData));
      } else {
        console.error("WebSocket está cerrado. No se puede enviar el producto.");
      }
    } catch (error) {
      console.error("Error", error);
    }
  } else {
    alert("Por favor, completa todos los campos antes de enviar.");
  }
}
document.getElementById("productForm").addEventListener("submit", async (event) => {
  event.preventDefault(); // Evita recargar la página
  document.getElementById("productForm").reset()

});

async function deleteProduct(productId) {
  try {
    const response = await fetch(`/api/products/${productId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: No se pudo eliminar el producto`);
    }
    console.log("Producto eliminado:", productId);

    // Verifica si el elemento existe antes de eliminarlo
    const productElement = document.getElementById(productId);
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        action: "delete", productId
      }));
    }
    if (productElement) {
      productElement.remove();
    } else {
      console.warn(`El producto con ID ${productId} no existe en el DOM.`);
    }
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
  }
}

async function editProduct(productId) {
  // Oculta el texto y muestra los inputs
  document.getElementById(`name-${productId}`).classList.add("d-none");
  document.getElementById(`input-name-${productId}`).classList.remove("d-none");

  document.getElementById(`price-${productId}`).classList.add("d-none");
  document.getElementById(`input-price-${productId}`).classList.remove("d-none");

  document.querySelector(`button[onclick="saveProduct('${productId}')"]`).classList.remove("d-none");
}

async function saveProduct(productId) {
  const name = document.getElementById(`input-name-${productId}`).value;
  const price = document.getElementById(`input-price-${productId}`).value;

  const response = await fetch(`/api/products/${productId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, price }),
  });

  if (response.ok) {
    const updatedProduct = await response.json();
    // Restaura el texto y oculta los inputs
    document.getElementById(`name-${productId}`).textContent = updatedProduct.payload.name;
    document.getElementById(`price-${productId}`).textContent = `$ ${updatedProduct.payload.price}`;

    document.getElementById(`name-${productId}`).classList.remove("d-none");
    document.getElementById(`input-name-${productId}`).classList.add("d-none");

    document.getElementById(`price-${productId}`).classList.remove("d-none");
    document.getElementById(`input-price-${productId}`).classList.add("d-none");

    document.querySelector(`button[onclick="saveProduct('${productId}')"]`).classList.add("d-none");

    // Envia el producto editado a través del WebSocket
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        action: "update", product: updatedProduct.payload
      }));
    }
  } else {
    console.error("Error al editar el producto.");
  }
}

