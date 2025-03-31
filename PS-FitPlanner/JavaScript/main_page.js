
function load()
{
    loadHeader()
    fetch("../JSON/data.json").then(function(res)
    {
        return res.json();
    })
        .then(function (json)
        {
            console.log(document.getElementsByClassName("text-box")[0])
            document.getElementsByClassName("text-box")[0].innerHTML = "<p>"+json.message_main_page+"</p>"
            document.querySelector("#imagenes").src = "/Resources/main_foto.jpg"
        })
    loadFooter()
}