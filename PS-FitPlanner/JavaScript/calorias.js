import {getUserRoutines} from "./GetDB/getUserRoutines.js";
import {getUserProfile} from "./GetDB/getUser.js";

document.addEventListener("DOMContentLoaded", async () => {
    const user = await getUserProfile();
    getUserRoutines(user.email).then(userRoutines => {
        userRoutines.forEach(userRoutine => {
            getCalorias(userRoutine);
        })
    })
})

function getCalorias(userRoutine){
    let calorias=0
    let level
    if (userRoutine.level === "begginer"){
        level = 1
    } else if(userRoutine.level === "intermediate"){
        level = 1.5
    } else{
        level = 2
    }
    userRoutine.rutine.exercises.forEach(exercise => {
        if (exercise.reps == "3x10"){
            calorias += 7*level
        } else if (exercise.reps == "4x10"){
            calorias += 9*level
        } else if (exercise.reps == "5x10"){
            calorias += 11*level
        } else if (exercise.reps == "3x12"){
            calorias += 8*level
        } else if (exercise.reps == "4x12"){
            calorias += 10*level
        } else if (exercise.reps == "5x12"){
            calorias += 12*level
        } else if (exercise.reps == "3x15"){
            calorias += 11*level
        } else if (exercise.reps == "4x15"){
            calorias += 13*level
        } else if (exercise.reps == "5x15"){
            calorias += 15*level
        }
    })
    return userRoutine.rutine.name + calorias;
}