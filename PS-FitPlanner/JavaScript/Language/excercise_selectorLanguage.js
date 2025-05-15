export async function excersiseSelectorLanguage() {
    let language = localStorage.getItem("language");
    let json_language = language === "english"
        ? "../JSON/English/excercise_selectorEnglish.json"
        : "../JSON/Español/excercise_selectorEspañol.json"
    fetch(json_language)
        .then(function (res) {
            return res.json();
        })
        .then(function (json) {
            console.log(json);
            document.getElementById("selector").textContent = json.selector
            document.getElementById("mgroup").textContent = json.mgroup
            document.getElementById("option").textContent = json.option
            document.getElementById("search").textContent = json.search
            document.getElementById("exercise-search").placeholder = json.exercise_search
            document.getElementById("routine-name").placeholder = json.routine_name
            document.getElementById("routine-duration").placeholder = json.routine_duration
            document.getElementById("routine-rest").placeholder = json.routine_rest
            document.getElementById("routine-description").placeholder = json.routine_description
            document.getElementById("save-export-routine").textContent = json.save_export_routine

        })
        .catch(function (err) {
            console.error("Error cargando JSON:", err);
        });
}