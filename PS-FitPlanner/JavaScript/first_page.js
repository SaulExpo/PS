
function load()
{
    loadHeader()
    fetch("../JSON/data.json").then(function(res)
    {
        return res.json();
    })
        .then(function (json)
        {
            document.querySelectorAll("#info")[0].textContent = json.first_page.today
            document.querySelectorAll("#info")[1].textContent = json.first_page.calendar
            document.querySelectorAll("#picture")[0].src = json.first_page.today_img;
            document.querySelectorAll("#picture")[1].src = json.first_page.calendar_img;
            document.querySelectorAll("#picture")[1].addEventListener("click", () =>
            {
                location.replace("http://localhost:63342/PWM-Fitness-App/Pages/calendar.html")
            })
        })
    loadFooter()
}