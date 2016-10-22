tune_up_btn = document.querySelector( '#tune_up' );

tune_up_btn.click(function(e){
  e.preventDefault();
  tuning('tune_up');
});

updateStatus = function(status){
  // $('#tuner_status_display').html( status );
};

timer = setInterval(getStatus, 2000);

// tuning = function( action )
//   {
//     $.ajax({
//     url: 'php/powerController.php',
//     type: 'post',
//     cache: false,
//     data: {
//       'action': action,
//     },
//     dataType: 'json',
//     success: function(data) {
//       updateStatus(data.status);
//     },
//     error: function(xhr, desc, err) {
//       console.log(xhr);
//       console.log("Details: " + desc + "\nError:" + err);
//     }
//   });
// };
