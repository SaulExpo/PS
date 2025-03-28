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

        const name = document.getElementById("name").value
        const email = document.getElementById("email").value
        const password = document.getElementById("password").value
        const check_password = document.getElementById("check_password").value
        let vali = validacion(password, check_password);
        if (!vali[0])
        {
            alert(vali[1])
            document.getElementById("password").style.borderColor="red"
            document.getElementById("check_password").style.borderColor="red"
            return;
        }

        const response = await fetch("http://localhost:1337/api/user-app/register",
            {
                method: "POST",
                headers:
                    {
                        "Content-Type": "application/json"
                    },
                body: JSON.stringify({name, email, password})
            })

        const data = await response.json()
        if (response.ok)
        {
            alert("Cuenta creada correctamente")
            localStorage.setItem("jwt", data.token)
            location.replace("http://localhost:63342/PWM-Fitness-App/Pages/first_page.html")
        }
        else
        {
            alert(data.message);
        }
    })
})

function validacion(password, check_password){
    if(password.length < 8)
    {
        return [false, "Longitud insuficiente"]
    }
    if(password !== check_password)
    {
        return [false, "Tienen  que ser iguales"]
    }
    return [true, "Todo bien"]

}