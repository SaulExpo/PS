function load()
{
    loadHeader()
    fetch("../JSON/data.json").then(function(res)
    {
        return res.json();
    })
        .then(function (json)
        {
            const personal = json.personal;
            document.querySelector("h1").textContent = personal.name
            let todo = ""
            let temp = ""
            temp = "<p class='info'>Correo: " + personal.correo+ "</p>"
            todo += temp
            temp = "<p class='info'>Edad: " + personal.edad+ "</p>"
            todo += temp
            temp = "<p class='info'>Sexo: " + personal.sexo+ "</p>"
            todo += temp
            temp = "<p class='info'>Altura: " + personal.altura.valor + personal.altura.medida+ "</p>"
            todo += temp
            temp = "<p class='info'>Peso: " + personal.peso.valor + personal.peso.medida+ "</p>"
            todo += temp
            document.querySelector(".rectangle").innerHTML = todo
            document.querySelector("#icon").src = personal.image

        })
    loadFooter()
}