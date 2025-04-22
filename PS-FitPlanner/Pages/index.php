<?php
    session_start();
    if (isset($_POST['name'])) {
         $_SESSION['name'] = $_POST['name'];
    }

?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "https://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>Chat - Customer Module</title>
    <link type="text/css" rel="stylesheet" href="../Styles/chat.css" />
    <link rel="stylesheet" href="../Styles/header.css">
    <link rel="stylesheet" href="../Styles/footer.css">
    <script src="prueba.js"></script>
    <script src="../JavaScript/getUser.js"></script>
    <script src="../JavaScript/loadFooter.js"></script>
    <script src="../JavaScript/loadHeader.js"></script>
    <script src="../JavaScript/script.js"></script>

</head>
<header id="main_header">
</header>
<body>

<div id="wrapper">
	<div id="menu">
		<p class="welcome">Welcome, <b><?php echo $_SESSION['name']; ?></b></p>
		<p class="logout"><a id="exit" href="#">Exit Chat</a></p>
		<div style="clear:both"></div>
	</div>
	<div id="chatbox"><?php
    	if(file_exists("log.html") && filesize("log.html") > 0){
    		$handle = fopen("log.html", "r");
    		$contents = fread($handle, filesize("log.html"));
    		fclose($handle);

    		echo $contents;
    	}
    	?></div>

	<form name="message" action="">
		<input name="usermsg" type="text" id="usermsg" size="63" />
		<input name="submitmsg" type="submit"  id="submitmsg" value="Send" />
	</form>
</div>

<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.3/jquery.min.js"></script>
<script type="text/javascript">
// jQuery Document
$(document).ready(function(){
    //If user submits the form
        $("#submitmsg").click(function(){
            var clientmsg = $("#usermsg").val();
            $.post("post.php", {text: clientmsg});
            $("#usermsg").attr("value", "");
            return false;
        });
    //Load the file containing the chat log
    	let previousChatContent = ""; // <= Guardamos el HTML anterior fuera de loadLog()

        function loadLog(){
            var oldscrollHeight = $("#chatbox")[0].scrollHeight - 20;

            $.ajax({
                url: "log.html",
                cache: false,
                success: function(html){
                    let chatbox = $("#chatbox");

                    if (html !== previousChatContent) {
                        chatbox.html(html);
                        previousChatContent = html; // <- Actualiza después de compararlo

                        var newscrollHeight = chatbox[0].scrollHeight - 20;
                        if (newscrollHeight > oldscrollHeight) {
                            chatbox.animate({ scrollTop: newscrollHeight }, 'normal');
                        }

                        if (!windowHasFocus) {
                            unreadCount++;
                            document.title = `(${unreadCount}) New message(s) - Chat`;

                            let tempDiv = document.createElement("div");
                            tempDiv.innerHTML = html.trim();
                            let messages = tempDiv.querySelectorAll("div");
                            let lastMsg = messages[messages.length - 1]?.innerText;

                            if (lastMsg) {
                                showNotification(lastMsg);
                            }
                        }
                    }
                }
            });
        }


    setInterval (loadLog, 2500);

});
</script>

<footer id="main_footer">
</footer>
</body>
<script>
        let windowHasFocus = true;
        let unreadCount = 0;
        let originalTitle = document.title;

        window.onfocus = function () {
            windowHasFocus = true;
            unreadCount = 0;
            document.title = originalTitle;
        };

        window.onblur = function () {
            windowHasFocus = false;
        };

        if ("Notification" in window) {
            if (Notification.permission !== "granted") {
                Notification.requestPermission();
            }
        }

        function showNotification(message) {
            console.log(message);
            if (Notification.permission === "granted") {
                new Notification("Nuevo mensaje en el chat", {
                    body: message,
                    icon: "../Assets/chat-icon.png" // Usa un ícono tuyo si quieres
                });
            }
        }


        Promise.all([loadTemplate("../Templates/footer.html", "main_footer"),
            loadTemplate("../Templates/header.html", "main_header")]
        ).then(() => {
            loadHeader()
            loadFooter()
        })
    </script>
</html>

