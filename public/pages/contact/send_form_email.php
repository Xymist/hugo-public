<?php

if(isset($_POST['email'])) {

    $email_to = "james@jamieduerden.co.uk";
    $email_subject = $_POST['subject'];
    $name = $_POST['name'];
    $email_from = $_POST['email'];
    $main_input = $_POST['main-input'];

    function clean_string($string) {

      $bad = array("content-type","bcc:","to:","cc:","href");

      return str_replace($bad,"",$string);

    }

    $email_message = clean_string($main_input)."\n";

$headers = 'From: '.$email_from."\r\n".

'Reply-To: '.$email_from."\r\n" .

'X-Mailer: PHP/' . phpversion();

@mail($email_to, $email_subject, $email_message, $headers);
}

header("Location: https://jamieduerden.co.uk/pages/contact");
die();


?>
