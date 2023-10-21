
 function fetchAndRenderCustomerData() {
    fetch("http://127.0.0.1:8000/customer/getList") 
        .then((response) => response.json())
        .then((data) => {
            const customerTableBody = document.getElementById("customer-table-body");
            customerTableBody.innerHTML = "";

            data.forEach((customer, index) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <th scope="row">${index + 1}</th>
                    <td>${customer.cust_name}</td>
                    <td>${customer.cust_mobile_no}</td>
                    <td>${customer.cust_address}</td>
                    <td>
                        <div class="d-flex">
                            <button type="button" class="btn mx-1 btn-primary" onclick="openUpdateCustomerDialog('${customer._id}', '${customer.cust_name}', '${customer.cust_mobile_no}', '${customer.cust_address}')">Update</button>
                        <button type="button" class="btn mx-1 btn-info" onclick="showCustomerHistory('${customer._id}')">History</button>
                        <button type="button" class="btn mx-1 btn-danger" onclick="handleDeleteCustomerClick('${customer._id}')">Delete</button>
                   </div>
                    </td>
                `;
                customerTableBody.appendChild(row);
            });
        })
        .catch((error) => {
            console.error("API request failed:", error);
        });
}

fetchAndRenderCustomerData();

function openUpdateCustomerDialog(custId, custName, custMobileNo, custAddress) {
    const updateCustomerDialog = new bootstrap.Modal(document.getElementById("updateCustomerDialog"));
    updateCustomerDialog.show();

    document.getElementById("updatedName").value = custName;
    document.getElementById("updatedMobileNo").value = custMobileNo;
    document.getElementById("updatedAddress").value = custAddress;

    document.getElementById("updateCustomerSubmit").addEventListener("click", function () {
      
        const updatedName = document.getElementById("updatedName").value;
        const updatedMobileNo = document.getElementById("updatedMobileNo").value;
        const updatedAddress = document.getElementById("updatedAddress").value;

        const request = { 
            cust_name: updatedName,
            cust_mobile_no: updatedMobileNo,
            cust_address: updatedAddress,
        };

        fetch(`http://127.0.0.1:8000/customer/update/${custId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        })
            .then((response) => {
                if (response.status === 200) {
                 updateCustomerDialog.hide();
                    fetchAndRenderCustomerData(); 
                } else {
                    
                    console.error("Error updating customer");
                }
            })
            .catch((error) => {
                console.error("API request failed:", error);
            });
    });
}
function showCustomerHistory(custId) {
    console.log(custId);
    const updateCustomerDialog = new bootstrap.Modal(document.getElementById("customerHistoryDialog"));
    updateCustomerDialog.show();
    fetch(`http://127.0.0.1:8000/users/purchase-history/${custId}`) 
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            const customerHistoryList = document.getElementById("customerHistoryList");
            customerHistoryList.innerHTML = "";
            data.forEach((purchase, index) => {
                const listItem = document.createElement("li");
                listItem.className = "list-group-item";
                listItem.innerHTML = `
            <strong>Order ID:</strong> ${purchase.id}<br>
            <strong>Date:</strong> ${purchase.date}<br>
            <strong>Quantity:</strong> ${purchase.prod.length}<br>
            <strong>Total Amount:</strong> ${purchase.pay_amount}<br>
        `;
                customerHistoryList.appendChild(listItem);
            });

            const customerHistoryDialog = new bootstrap.Modal(document.getElementById("customerHistoryDialog"));
            customerHistoryDialog.show();
        })
        .catch((error) => {
            console.error("API request failed:", error);
        });
}

function handleDeleteCustomerClick(custId) {
    const confirmDelete = confirm("Are you sure you want to delete this customer?");

    if (confirmDelete) {
        fetch(`http://127.0.0.1:8000/customer/delete/${custId}`, {
            method: "DELETE",
        })
            .then((response) => {
                if (response.status === 200) {
                   const updateCustomerDialog = new bootstrap.Modal(document.getElementById("updateCustomerDialog"));
                    updateCustomerDialog.hide();
                    fetchAndRenderCustomerData(); 
                } else {
                    
                    console.error("Error deleting customer");
                }
            })
            .catch((error) => {
                console.error("API request failed:", error);
            });
    }
}