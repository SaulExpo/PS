function loadFooter()
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
            let texto_footer = document.getElementsByClassName("footer_texts")
            for (let i=0; i<texto_footer.length; i++)
            {
                texto_footer[i].textContent = myJson.footer_text[i]
            }
            document.querySelector("#logo_footer").innerHTML = "<img id=\"logo\" src=\"../Resources/logo.png\" style=\"width:128px; height:96px;\">"


            let otro = document.getElementsByClassName("footer_temp")[0].querySelectorAll("div")[2].querySelectorAll("img")
                for (let i=0; i<otro.length; i++)
            {
                otro[i].src = myJson.redes_sociales_footer[i].imagen
                otro[i].addEventListener("click", function()
                {
                    window.open(myJson.redes_sociales_footer[i].link);
                })
            }
        })
}
