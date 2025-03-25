document.addEventListener('DOMContentLoaded', () => {
    console.log(document.getElementById("member"));
    document.getElementById("member").addEventListener("click", function(){
        let token = localStorage.getItem("jwt");
        getUserProfile()
    })
})
