document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem("jwt");
    if (!token){
        window.location.href = "../Pages/login.html"
    }

    function getName() {
        return getUserProfile().then(user => user.name);
    }

    getName().then(name => {
        fetch("index.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: "name=" + encodeURIComponent(name)
        });
    });


});
