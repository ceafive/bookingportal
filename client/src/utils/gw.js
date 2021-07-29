(function (window) {
  // You can enable the strict mode commenting the following line
  // 'use strict';

  // This function will contain all our code
  function loadJS(path) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = path;
    document.getElementsByTagName("head")[0].appendChild(script);
  }

  function loadCSS(path) {
    var css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = path;
    document.getElementsByTagName("head")[0].appendChild(css);
  }

  function gw() {
    var _gwObject = {};
    var _gwFrameID;
    var _gwref;
    var _merchant_key;
    var _invoice_id;
    var _callback;

    var _cybsign;
    var _cybapiurl;
    var _cybfields;

    if (!window.jQuery) {
      var script = document.createElement("script");
      script.type = "text/javascript";
      script.src = "https://code.jquery.com/jquery-3.5.1.min.js";
      script.integrity = "sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=";
      document.getElementsByTagName("head")[0].appendChild(script);
    }

    document.addEventListener("DOMContentLoaded", function () {
      var overlayElem = document.createElement("div");
      overlayElem.id = "overlay";
      document.body.appendChild(overlayElem);

      var modalOverlayElem = document.createElement("div");
      modalOverlayElem.id = "gw_modal";
      document.body.appendChild(modalOverlayElem);

      //Load overlay script
      loadJS(
        "https://cdnjs.cloudflare.com/ajax/libs/jquery-loading-overlay/2.1.7/loadingoverlay.min.js"
      );
      loadJS(
        "https://cdnjs.cloudflare.com/ajax/libs/izimodal/1.5.1/js/iziModal.min.js"
      );

      loadCSS(
        "https://cdnjs.cloudflare.com/ajax/libs/izimodal/1.5.1/css/iziModal.min.css"
      );

      //$.fn.iziModal = iziModal;
      //$("#gw_modal").iziModal();
      // $("#modal-iframe").iziModal({
      //     iframe: true,
      //     iframeHeight: 800,
      //     iframeURL: "<a class="vglnk" href="http://izimodal.marcelodolza.com" rel="nofollow"><span>http</span><span>://</span><span>izimodal</span><span>.</span><span>marcelodolza</span><span>.</span><span>com</span></a>"
      // });
    });

    // Just create a property to our library object.
    _gwObject.Pay = function (frameID, gwref, callback) {
      _gwFrameID = frameID;
      _gwref = gwref;
      _callback = callback;

      return _gwObject.signCardHolderRequest();
      //var signSuccess = _gwObject.signCardHolderRequest();
      //if (!signSuccess) {
      //  return false;
      //}

      //_gwObject.Show3DsForm();
      //return _gwObject.processCybCard();
    };

    _gwObject.signCardHolderRequest = function () {
      //try{
      $.ajax({
        url: "https://gw.ipaygh.com/services/cybercards/" + _gwref + "/sign",
        type: "POST",
        crossDomain: true,
        data: {
          gwInvoiceID: _gwref,
          bill_to_forename: $("#gw_card_first_name").val(),
          bill_to_surname: $("#gw_card_last_name").val(),
          // bill_to_email: $("#card_email").val(),
          // bill_to_address_line1: $("#card_address").val(),
          // bill_to_address_city: $("#card_city").val(),
          // bill_to_address_country: $("#card_country").val(),
          // bill_to_address_state: $("#card_state").val()
          bill_to_email: "null@cybersource.com",
          bill_to_address_line1: "Accra",
          bill_to_address_city: "Accra",
          bill_to_address_country: "GH",
          bill_to_address_state: " ",
        },
        dataType: "json",
        success: function (data) {
          if (data.success == false) {
            //alert(data.reason);
            return false;
          } else {
            _cybsign = data.signature;
            _cybfields = JSON.stringify(data.TxnData);
            _cybapiurl = data.endpoint;

            _gwObject.Show3DsForm();
            return _gwObject.processCybCard();
          }
        },
        error: function () {
          alert("Error processing card holder address");
          return false;
        },
      });
      //}

      return true;

      //send card request
    };

    _gwObject.processCybCard = function () {
      apiurl = _cybapiurl;
      data = JSON.parse(_cybfields);

      data["card_number"] = $("#gw_card_number").val();
      data["card_type"] = $("#gw_card_type").val();
      data["card_cvn"] = $("#gw_card_cvn").val();
      data["card_expiry_date"] =
        $("#gw_card_expire_month").val() +
        "-" +
        $("#gw_card_expire_year").val();

      var form = document.createElement("form");
      form.setAttribute("method", "POST");
      form.setAttribute("action", apiurl);
      form.setAttribute("target", _gwFrameID);
      form.setAttribute("style", "display:block; visibility:hidden");

      //Move the submit function to another variable
      //so that it doesn't get overwritten.
      form._submit_function_ = form.submit;

      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          var hiddenField = document.createElement("input");
          hiddenField.setAttribute("type", "hidden");
          hiddenField.setAttribute("name", key);
          hiddenField.setAttribute("value", data[key]);

          form.appendChild(hiddenField);
        }
      }

      document.body.appendChild(form);
      form._submit_function_();
      //console.log(form);

      return true;
    };

    _gwObject.Show3DsForm = function (url) {
      //$("#gw_modal").iziModal();
      console.log(url);
      $("#" + _gwFrameID + "_div").iziModal({
        //iframe: true,
        //iframeHeight: 800,
        //iframeURL: "https://www.cnn.com"
      });
      $("#" + _gwFrameID + "_div").iziModal("setFullscreen", true);
      $("#" + _gwFrameID + "_div").iziModal("open");
    };

    _gwObject.Close3DsForm = function () {
      $("#" + _gwFrameID + "_div").iziModal("close");
    };

    _gwObject.ShowOverlay = function () {
      $.LoadingOverlay("show");
    };

    _gwObject.HideOverlay = function () {
      $.LoadingOverlay("hide");
    };

    _gwObject.PaidEventHandler = function (e) {
      console.log("PaidEventHandler called");
      console.log(e);
      // alert(e.data.msg);
      _callback(e.data);
    };

    _gwObject.FailedEventHandler = function (e) {
      // alert(e.data.msg);
      _callback(e.data);
    };

    _gwObject.ErrorEventHandler = function (e) {
      // alert(e.data.msg);
      _callback(e.data);
    };

    _gwObject.MessageHandler = function (e) {
      if (e.data.event_id == "gw_show_overlay") {
        _gwObject.ShowOverlay();
      } else if (e.data.event_id == "gw_hide_overlay") {
        _gwObject.HideOverlay();
      } else if (e.data.event_id == "gw_paid") {
        _gwObject.HideOverlay();
        _gwObject.PaidEventHandler(e.data);
      } else if (e.data.event_id == "gw_pay_failed") {
        _gwObject.HideOverlay();
        _gwObject.FailedEventHandler(e.data);
      } else if (e.data.event_id == "gw_pay_unsuccessful") {
        _gwObject.HideOverlay();
        _gwObject.FailedEventHandler(e.data);
      } else if (e.data.event_id == "gw_pay_unexpected") {
        _gwObject.HideOverlay();
        _gwObject.FailedEventHandler(e.data);
      } else if (e.data.event_id == "gw_pay_end") {
        _gwObject.Close3DsForm();
        _gwObject.ErrorEventHandler(e);
      }
    };

    return _gwObject;
  }

  // We need that our library is globally accesible, then we save in the window
  if (typeof window.gw === "undefined") {
    window.gw = gw();
    window.addEventListener("message", window.gw.MessageHandler, false);
  }
})(window); // We send the window variable withing our function

// Then we can call our custom function using
//myWindowGlobalLibraryName.myCustomLog(["My library","Rules"]);
