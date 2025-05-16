export async function calendarLanguage() {
    let language = localStorage.getItem("language");
    let json_language = language === "english"
        ? "../JSON/English/calendarEnglish.json"
        : "../JSON/Español/calendarEspañol.json"
    fetch(json_language)
        .then(function (res) {
            return res.json();
        })
        .then(function (json) {
            console.log(json);
            document.getElementById("eventModalLabel").textContent = json.new_event
            document.getElementById("editEventModalLabel").textContent = json.edit_event
            document.getElementById("Date").textContent = json.date
            document.getElementById("Rutine").textContent = json.rutine
            document.getElementById("Remember").textContent = json.remember
            document.getElementById("Create").textContent = json.create_event
            document.getElementById("Save").textContent = json.save_changes
            document.getElementById("deleteEventButton").textContent = json.delete
            document.getElementById("deleteEventButton").textContent = json.delete
            document.getElementById("deleteEventButton").textContent = json.delete
            document.getElementById("progress-label-month").textContent = json.month
            document.getElementById("progress-label-week").textContent = json.week
        })
        .catch(function (err) {
            console.error("Error cargando JSON:", err);
        });
}