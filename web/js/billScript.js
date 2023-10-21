const mobileNumberInput = document.getElementById("mobileNumber");
// mobileNumberInput.addEventListener("input", fetchCustomerDetails);


fetchProductList();

let productList = []

// Function to add a product to the bill
function addProductToBill() {
    const productId = document.getElementById("productSelect").value;
    const productQty = document.getElementById("product-qty").value;


    if (productId !== "Select Product" && productQty > 0) {
        fetch(`http://127.0.0.1:8000/products/${productId}`)
            .then((response) => {
                if (response.status === 200) {
                    return response.json();
                } else {
                    console.error('Error fetching product list');
                }
            })
            .then((data) => {
                if (data) {
                    productList.push({
                        "_id": data._id,
                        "p_name": data.p_name,
                        'p_price': data.p_price,
                        "p_brand": data.p_brand,
                        "productQty": productQty,
                        "totalAmount": Number(data.p_price) * Number(productQty)
                    })
                    renderProductList()
                    // Clear the product selection and quantity fields
                    document.getElementById("productSelect").value = "Select Product";
                    document.getElementById("product-qty").value = "0";
                }
            })
            .catch((error) => {
                console.error('API request failed:', error);
            });


    }
}

function renderProductList(params) {
    const table = document.querySelector("table tbody");
    console.log(table);
    table.innerHTML = '';
    let totalAmount = 0;
    productList.forEach(element => {
        totalAmount += Number(element.totalAmount)
        const newRow = table.insertRow(table.rows.length);
        newRow.innerHTML = `
                    <td>${table.rows.length}</td>
                    <td>${element.p_name}</td>
                    <td>${element.p_price}</td>  
                    <td>${element.p_brand}</td>  
                    <td>${element.productQty}</td>
                    <td>${element.totalAmount}</td>
                    <td><button type="button" class="btn mx-1 btn-danger" onclick="removeProduct('${element._id}')">Remove</button></td>
                `;
    });
    document.getElementById('total').textContent = totalAmount;

}

function removeProduct(id) {
    console.log(id);
    productList = productList.filter((item) => { return item._id != id })
    renderProductList()
}

// Function to calculate the total amount
function calculateTotalAmount() {
    const rows = document.querySelectorAll("table tbody tr");

    rows.forEach((row) => {
        const price = parseFloat(row.cells[2].textContent);
        const quantity = parseInt(row.cells[4].textContent);
        totalAmount += price * quantity;
    });

    // Display the total amount
    document.getElementById("totalAmount").textContent = totalAmount;
}

// Function to submit the bill
function submitBill() {
    const id = document.getElementById("custId").value;
    const totalAmount = parseFloat(document.getElementById("total").textContent);

    let products = [];
    productList.forEach(element => {
        products.push({
            "prod_id": element._id,
            "prod_name": element.p_name,
            "prod_price": element.totalAmount,
            "prod_quantity": element.productQty
        })
    });
    const bill = {
            "id": id,
            "pay_amount": totalAmount,
            "prod": products
    };

    // Make an API request to submit the bill
    fetch("http://127.0.0.1:8000/payment/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(bill),
    })
        .then((response) => {
            if (response.status === 200) {
                alert("Bill created successfully!");
                // Optionally, clear the form and update UI as needed
                clearForm();
            } else {
                console.error("Error creating bill");
            }
        })
        .catch((error) => {
            console.error("API request failed:", error);
        });
}

function clearForm() {
    // document.getElementById("exampleFormControlInput1").value = "";
    document.getElementById("customerName").value = "";
    document.getElementById("customerAddress").value = "";
    document.getElementById("productSelect").value = "Select Product";
    document.getElementById("product-qty").value = "";
    document.querySelector("table tbody").innerHTML = "";
    document.getElementById("total").textContent = "0";
}

clearForm()


function fetchProductList() {
    fetch('http://127.0.0.1:8000/product/getList')
        .then((response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                console.error('Error fetching product list');
            }
        })
        .then((data) => {
            if (data) {
                const productSelect = document.querySelector('#productSelect');
                productSelect.innerHTML = '<option selected>Select Product</option>';
                console.log(data);
                data.forEach((product) => {
                    const option = document.createElement('option');
                    option.value = product._id;
                    option.textContent = product.p_name;
                    productSelect.appendChild(option);
                });
            }
        })
        .catch((error) => {
            console.error('API request failed:', error);
        });
}



async function searchUsers() {
    const mobileNumber = document.getElementById("mobileNumber").value;
    const userDropdown = document.getElementById("userDropdown");

    userDropdown.innerHTML = "";
    try {
        const response = await fetch(`http://127.0.0.1:8000/customer/getList`);
        const users = await response.json();

        const filteredUsers = users.filter(user => user.cust_mobile_no.toLowerCase().includes(mobileNumber.toLowerCase()));
        filteredUsers.forEach(user => {
            const userItem = document.createElement("div");
            userItem.className = "dropdown-item";
            userItem.textContent = user.cust_name;

            userItem.addEventListener("click", () => {
                document.getElementById("custId").value = user._id;

                document.getElementById("mobileNumber").value = user.cust_mobile_no;
                document.getElementById("customerName").value = user.cust_name;
                document.getElementById("customerAddress").value = user.cust_address;
                userDropdown.innerHTML = "";
            });

            userDropdown.appendChild(userItem);
        });
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
}

document.addEventListener("click", function (e) {
    if (!e.target.matches(".form-control")) {
        const userDropdown = document.getElementById("userDropdown");
        userDropdown.innerHTML = "";
    }
});

