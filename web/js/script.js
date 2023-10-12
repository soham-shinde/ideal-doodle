document.getElementById("login-form").addEventListener("submit", function (e) {
    e.preventDefault(); 
   
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    
    fetch("http://127.0.0.1:8000/admin/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: email,
            password: password,
        }),
    })
    .then((response) => {
        console.log(email,password);
        if (response.status === 200) {
          
            window.location.href = "/homePage.html";
        } else {
           
            console.error("Login failed");
        }
    })
    .catch((error) => {
        console.error("API request failed:", error);
    });
});