function encrypt_if_possible() {
  //var openpgp = require('openpgp');
  //var key = document.getElementById('pub-key').innerHTML;
  //var publicKey = openpgp.key.readArmored(key);
  //openpgp.encryptMessage(publicKey.keys, document.getElementById('main-input').value).then(function(pgpMessage) {
  //  $('#main-input').value=pgpMessage;
  //  $("contact-form").submit();
  //}).catch(function(error) {
  //  console.log("Failed to encrypt message; sending in plaintext");
    $("contact-form").submit();
  //});
}
