// src/boot/jquery.js

import { boot } from "quasar/wrappers";
import $ from "jquery";
import "dropify/dist/js/dropify.min";
import "dropify/dist/css/dropify.min.css";

export default boot(() => {
  $(document).ready(() => {
    $(".dropify").dropify(); // Inicializa Dropify en todos los inputs con la clase 'dropify'
  });
});

export { $ };
