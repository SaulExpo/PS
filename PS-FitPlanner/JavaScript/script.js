console.log("script.js cargado correctamente");

function loadTemplate(templatePath, elementId) {
    fetch(templatePath)
        .then(resp => resp.text())
        .then(data => {
            document.getElementById(elementId).innerHTML = data;
        })
        .catch(error => console.error(`Error cargando ${templatePath}:`, error));
}



loadTemplate("../Templates/header.html", "main_header");
loadTemplate("../Templates/footer.html", "main_footer");
