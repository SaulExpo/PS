function loadFooter()
{
    fetch("../JSON/data.json").then(function(response) {
        return response.json();
    })
        .then(function (myJson)
        {
            let texto_footer = document.getElementsByClassName("footer_texts")
            for (let i=0; i<texto_footer.length; i++)
            {
                texto_footer[i].textContent = myJson.footer_text[i]
            }
            let texto_footer2 = document.getElementsByClassName("footer_temp")[0].querySelectorAll("div")[1].querySelectorAll("nav")[0].querySelectorAll("a")

            for (let i = 0; i < texto_footer2.length; i++) {
                texto_footer2[i].textContent = myJson.company_footer[i]
            }
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
