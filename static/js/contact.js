$(document).ready(function () {
  $('#contact-form').submit(function (event) {
    $.ajax({
      type     : 'POST',
      url      : 'https://jamieduerden.co.uk/pages/contact',
      data     : $('#contact-form').serialize(),
      dataType : 'json',
      encode   : true
    })
    .done(function (data) {
      console.log(data);
      $('#contactThankYou').show();
      $('#contact-form').hide();
    })
    .fail(function () {
        alert("error");
    });
    event.preventDefault();
  });
});
