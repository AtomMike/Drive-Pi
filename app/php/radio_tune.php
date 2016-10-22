<?php

if( isset($_POST) ) {
  $response = array();

  switch ($_POST['action']) {

    case 'tune_up':
      $command = '../python/radio_tune.py 104.9 2>&1';
      // $command = 'rtl_fm -f 97e6 -M wbfm -s 200000 -r 48000 - | aplay -r 48000 -f S16_LE 2>&1';
      // $command = 'ls ~/';

      $exec_action = exec($command, $output);
      // $response = array(
      //   'request' => 'tuning...',
      //   'status' => $exec_action
      // );
      // echo $exec_action;
      echo json_encode($output);
      exit();
    break;

  }
}

?>
