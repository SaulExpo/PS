const clave = localStorage.getItem("jwt")
if(clave)
{
    location.replace("http://localhost:63342/PWM-Fitness-App/Pages/first_page.html")
}
document.addEventListener("DOMContentLoaded", () =>
{
    document.getElementById("formulario").addEventListener("submit", async event =>
    {
        event.preventDefault()
        const email = document.getElementById("email").value
        const password = document.getElementById("password").value

        const response = await fetch("http://localhost:1337/api/user-app/login",
            {
                method: "POST",
                headers:
                    {
                        "Content-Type": "application/json"
                    },
                body: JSON.stringify({email, password})
            })

        const data = await response.json()

        if (response.ok)
        {
            alert("Datos correctos")
            localStorage.setItem("jwt", data.token)
            location.replace("http://localhost:63342/PWM-Fitness-App/Pages/first_page.html")
        }
        else
        {
            alert("Datos incorrectos")
            document.getElementById("password").style.borderColor = "red"
        }
    })
})