let email = "elouariachimohamed2002@gmail.com"
const response = await fetch("http://localhost:1337/api/profesional-user-app/getProfesional", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({email})
});
console.log("hola");
const data = await response.json();
console.log('Tu entrenador asignado es ' + data.profesional.name);