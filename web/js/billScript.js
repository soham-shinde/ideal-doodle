const mobileNumberInput = document.getElementById("mobileNumber");
mobileNumberInput.addEventListener("input", fetchCustomerDetails);


function fetchCustomerDetails() {
    const mobileNo = document.getElementById("mobileNumber").value;
    if (mobileNo) {
        // Make an API request to fetch customer details by mobile number
        fetch(`http://127.0.0.1:8000/api/customer/${mobileNo}`)
            .then((response) => response.json())
            .then((data) => {
                // Populate customer name and address fields
                document.getElementById("customerName").value = data.cust_name;
                document.getElementById("customerAddress").value = data.cust_address;
            })
            .catch((error) => {
                console.error("API request failed:", error);
            });
    }
}

// Function to add a product to the bill
function addProductToBill() {
    const productName = document.getElementById("productSelect").value;
    const productQty = document.getElementById("productQty").value;

    if (productName !== "Select Product" && productQty > 0) {
        // Add the product to the table
        const table = document.querySelector("table tbody");
        const newRow = table.insertRow(table.rows.length);
        newRow.innerHTML = `
            <td>${table.rows.length}</td>
            <td>${productName}</td>
            <td>${productPrice}</td>  // Add the price based on the product
            <td>${productBrand}</td>  // Add the brand based on the product
            <td>${productQty}</td>
            <td><button type="button" class="btn mx-1 btn-danger" onclick="removeProduct(this)">Remove</button></td>
        `;

        // Clear the product selection and quantity fields
        document.getElementById("productSelect").value = "Select Product";
        document.getElementById("productQty").value = "";
    }
}

// Function to remove a product from the bill
function removeProduct(button) {
    const row = button.parentNode.parentNode;
    const table = row.parentNode;
    table.deleteRow(row.rowIndex);
}

// Function to calculate the total amount
function calculateTotalAmount() {
    const rows = document.querySelectorAll("table tbody tr");
    let totalAmount = 0;
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
    // Collect customer details, product details, and total amount from the form

    const mobileNo = document.getElementById("exampleFormControlInput1").value;
    const customerName = document.getElementById("customerName").value;
    const customerAddress = document.getElementById("customerAddress").value;
    const products = [];

    const rows = document.querySelectorAll("table tbody tr");
    rows.forEach((row) => {
        const productName = row.cells[1].textContent;
        const quantity = parseInt(row.cells[4].textContent);
        products.push({ productName, quantity });
    });

    const totalAmount = parseFloat(document.getElementById("totalAmount").textContent);

    // Create a bill object
    const bill = {
        mobileNo,
        customerName,
        customerAddress,
        products,
        totalAmount,
    };

    // Make an API request to submit the bill
    fetch("/api/create-bill", {
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
    document.getElementById("exampleFormControlInput1").value = "";
    document.getElementById("customerName").value = "";
    document.getElementById("customerAddress").value = "";
    document.getElementById("productSelect").value = "Select Product";
    document.getElementById("productQty").value = "";
    document.querySelector("table tbody").innerHTML = "";
    document.getElementById("totalAmount").textContent = "0";
}

function fetchProductList() {
    // Make an API request to get the list of products
    fetch('/api/get-product-list') // Replace with the actual API endpoint
        .then((response) => {
            if (response.status === 200) {
                return response.json(); // Parse the JSON response
            } else {
                console.error('Error fetching product list');
            }
        })
        .then((data) => {
            // Handle the product list data here
            if (data) {
                // Iterate through the list and populate your product dropdown/select element
                const productSelect = document.querySelector('#productSelect'); // Adjust the selector
                productSelect.innerHTML = ''; // Clear existing options

                data.forEach((product) => {
                    const option = document.createElement('option');
                    option.value = product.prod_id;
                    option.textContent = product.prod_name;
                    productSelect.appendChild(option);
                });
            }
        })
        .catch((error) => {
            console.error('API request failed:', error);
        });
}

fetchProductList();