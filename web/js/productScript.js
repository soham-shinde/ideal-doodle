function handleDeleteProductClick(productId) {
    
    const confirmDelete = confirm("Are you sure you want to delete this product?");
    if (confirmDelete) {
        fetch(`http://127.0.0.1:8000/product/delete/${productId}`, {
            method: "DELETE",
        })
        .then((response) => {
            if (response.status === 200) {
                fetchAndRenderProductData();
            } else {
                console.error("Error deleting product");
            }
        })
        .catch((error) => {
            console.error("API request failed:", error);
        });
    }
}
function openUpdateProductDialog(productId, productName, productPrice, productBrand) {
    const updateProductDialog = new bootstrap.Modal(document.getElementById("updateProductDialog"));
    updateProductDialog.show();

    document.getElementById("updatedName").value = productName;
    document.getElementById("updatedPrice").value = productPrice;
    document.getElementById("updatedBrand").value = productBrand;

    document.getElementById("updateProductSubmit").addEventListener("click", function () {
        const updatedName = document.getElementById("updatedName").value;
        const updatedPrice = document.getElementById("updatedPrice").value;
        const updatedBrand = document.getElementById("updatedBrand").value;

        const request = {
            _id: productId,
            p_name: updatedName,
            p_price: parseFloat(updatedPrice),
            p_brand: updatedBrand,
        };

        fetch(`http://127.0.0.1:8000/product/update/${productId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        })
        .then((response) => {
            if (response.status === 200) {
                updateProductDialog.hide();
                fetchAndRenderProductData(); 
            } else {
                console.error("Error updating product");
            }
        })
        .catch((error) => {
            console.error("API request failed:", error);
        });
    });
}


const addQtyDialog = new bootstrap.Modal(document.getElementById("addQtyDialog"));
function openAddQtyDialog() {
    addQtyDialog.show();
    
}

function handleAddQtyClick(productId) {
    openAddQtyDialog();

    document.getElementById("addQtySubmit").addEventListener("click", function () {
        const qty = document.getElementById("qty").value;
        const request = {
            p_id: productId,
            quantity: qty
        };
        console.log(request);

        fetch(`http://127.0.0.1:8000/product/addQty`, {
            method: "post",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        })
        .then((response) => {
            if (response.status === 200) {
                addQtyDialog.hide();
            } else {
                console.error("Error adding quantity");
            }
        })
        .catch((error) => {
            console.error("API request failed:", error);
        });
    });
}

function fetchAndRenderProductData() {
    fetch("http://127.0.0.1:8000/product/getList") 
        .then((response) => response.json())
        .then((data) => {
            const productTableBody = document.getElementById("product-table-body");
            productTableBody.innerHTML = ""; 

            data.forEach((product, index) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <th scope="row">${index + 1}</th>
                    <td>${product.p_name}</td>
                    <td>${product.p_price}</td>
                    <td>${product.p_brand}</td>
                    <td>${product.p_quantity}</td>
                    <td>
                        <div class="d-flex">
                            <button type="button" class="btn mx-1 btn-primary" onclick="openUpdateProductDialog('${product._id}', '${product.p_name}', '${product.p_price}', '${product.p_brand}')"">Update</button>
                            <button type="button" class="btn mx-1 btn-info" onclick="handleAddQtyClick('${product._id}')">Add Qty</button>
                            <button type="button" class="btn mx-1 btn-danger" onclick="handleDeleteProductClick('${product._id}')">Delete</button>
                        </div>
                    </td>
                `;
                productTableBody.appendChild(row);
            });
        })
        .catch((error) => {
            console.error("API request failed:", error);
        });
}


fetchAndRenderProductData();