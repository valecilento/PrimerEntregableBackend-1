const socket = new WebSocket('ws://localhost:4000');

socket.onmessage = (event) => {
    const products = JSON.parse(event.data);
    const productList = document.getElementById('product-list');

    productList.innerHTML = ""; // Limpia la lista antes de actualizar

    products.forEach(product => {
        const li = document.createElement("li");
        li.setAttribute("id", product.id);
        li.innerHTML = `
            <img src="${product.image}" alt="${product.name}" width="100">
            
            <!-- Mostrar "span" y "input" desde el inicio -->
            <span id="name-${product.id}">${product.name}</span>
            <input type="text" id="input-name-${product.id}" class="form-control d-none" value="${product.name}">

            <span id="price-${product.id}">$ ${product.price}</span>
            <input type="number" id="input-price-${product.id}" class="form-control d-none" value="${product.price}">

            <button class="btn btn-warning" onclick="editProduct('${product.id}')">Editar</button>
            <button class="btn btn-success d-none" onclick="saveProduct('${product.id}')">Guardar</button>
            <button class="btn btn-danger" onclick="deleteProduct('${product.id}')">Eliminar</button>
        `;
        productList.appendChild(li);
    });
};

document.getElementById("productForm").addEventListener("submit", async (event) => {
    event.preventDefault(); // Evita recargar la página

    const formData = new FormData();
    formData.append("image", document.getElementById("productImage").files[0]);

    const response = await fetch("/upload-img", {
        method: "POST",
        body: formData
    });

    const result = await response.json();
    console.log("Imagen subida:", result.imageUrl);

    // Muestra la imagen en la vista y la oculta
    const previewImage = document.getElementById("preview");
    previewImage.src = result.imageUrl;
    document.getElementById("productForm").reset()
});

async function sendProduct() {
    const name = document.getElementById('productName').value;
    const price = document.getElementById('productPrice').value;
    const imageInput = document.getElementById('productImage').files[0];  

    if (name && price && imageInput) {
        const formData = new FormData();
        formData.append("image", imageInput);
        formData.append("name", name);
        formData.append("price", price);

        try {
            const response = await fetch("/upload-img", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: No se pudo subir la imagen`);
            }

            const result = await response.json();
            console.log("Imagen subida en:", result.imageUrl);
            const product = { name, price, image: result.imageUrl };
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify(product));
            } else {
                console.error("WebSocket está cerrado. No se puede enviar el producto.");
            }
        } catch (error) {
            console.error("Error al subir la imagen:", error);
        }
    } else {
        alert("Por favor, completa todos los campos antes de enviar.");
    }
}

async function deleteProduct(productId) {
    try {
        const response = await fetch(`/delete-product/${productId}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: No se pudo eliminar el producto`);
        }

        console.log("Producto eliminado:", productId);

        // Verifica si el elemento existe antes de eliminarlo
        const productElement = document.getElementById(productId);
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

    const response = await fetch(`/edit-product/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price }),
    });

    if (response.ok) {
        console.log("Producto actualizado:", productId);

        // Restaura el texto y oculta los inputs
        document.getElementById(`name-${productId}`).textContent = name;
        document.getElementById(`price-${productId}`).textContent = `$ ${price}`;
        
        document.getElementById(`name-${productId}`).classList.remove("d-none");
        document.getElementById(`input-name-${productId}`).classList.add("d-none");

        document.getElementById(`price-${productId}`).classList.remove("d-none");
        document.getElementById(`input-price-${productId}`).classList.add("d-none");

        document.querySelector(`button[onclick="saveProduct('${productId}')"]`).classList.add("d-none");
    } else {
        console.error("Error al editar el producto.");
    }
}
    
