function loadHeader()
{
    let language = localStorage.getItem("language")
    let json
    if (language == "english"){
        json = "../JSON/english_data.json"
    } else {
        json = "../JSON/data.json"
    }
    fetch(json).then(function(response) {
        return response.json();
    })
        .then(function (myJson)
        {
            let navega = document.getElementsByClassName("enlaces")
            for (let i=0; i<navega.length; i++)
            {
                navega[i].textContent = myJson.nav_items_header[i]
            }
            let logeo = document.getElementsByClassName("logs")
            for (let i=0; i<logeo.length; i++)
            {
                logeo[i].textContent = myJson.logeo_header[i]
            }

            document.querySelector("#foto_perf").src = myJson.personal.image

            var iniciar = document.querySelectorAll(".iniciar")
            var cerrar = document.querySelectorAll(".cerrar")
            const token = localStorage.getItem("jwt");
            if (!token){
                cerrar.forEach((item)=> {
                    item.style.display = "none"
                })
            } else{
                iniciar.forEach((item)=> {
                    item.style.display = "none"
                })
            }

            cerrar[0].addEventListener("click", function(){
                localStorage.removeItem("jwt"); // Borra el token del almacenamiento
                window.location.href = "../Pages/first_page.html";
            })

            if(localStorage.getItem("language")){
                document.getElementById("english").style.display = "block"
                document.getElementById("spanish").style.display = "none"
            } else{
                document.getElementById("spanish").style.display = "block"
                document.getElementById("english").style.display = "none"
            }

            document.getElementById("spanish").addEventListener("click", function(){
                localStorage.setItem("language", "english")
                window.location.reload()
            })

            document.getElementById("english").addEventListener("click", function(){
                localStorage.removeItem("language")
                window.location.reload()
            })
        })
}
