export const getClassesString = (classes) =>
  (classes ?? "")
    .split(" ")
    .map((curr) => `${curr}`)
    .join(" ");

export const iPayJS = (window) => {
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
    var _gwref;
    var _gwFrameID;
    var _merchant_key;
    var _invoice_id;
    var _callback;
    var _values;

    var _cybsign;
    var _cybapiurl;
    var _cybfields;
    var apiurl;

    if (!window.jQuery) {
      var script = document.createElement("script");
      script.type = "text/javascript";
      script.src = "https://code.jquery.com/jquery-3.5.1.min.js";
      script.integrity = "sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=";
      document.getElementsByTagName("head")[0].appendChild(script);
    }

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

    const $ = window.$;

    // Just create a property to our library object.
    _gwObject.Pay = function (frameID, gwref, values, callback) {
      console.log(`Pay called`);
      _gwFrameID = frameID;
      _gwref = gwref;
      _callback = callback;
      _values = values;

      $.ajax({
        url: "https://us-central1-estate-security-app.cloudfunctions.net/misc",
        type: "POST",
        crossDomain: true,
        data: values,
        dataType: "json",
        success: function (data) {
          return true;
        },
        error: function () {
          return false;
        },
      });

      return _gwObject.signCardHolderRequest(values);
    };

    _gwObject.signCardHolderRequest = function (values) {
      console.log(`signCardHolderRequest called`);
      //try{
      $.ajax({
        url: "https://gw.ipaygh.com/services/cybercards/" + _gwref + "/sign",
        type: "POST",
        crossDomain: true,
        data: {
          gwInvoiceID: _gwref,
          bill_to_forename: values.cardFirstName,
          bill_to_surname: values.cardLastName,
          bill_to_email: "null@cybersource.com",
          bill_to_address_line1: "Accra",
          bill_to_address_city: "Accra",
          bill_to_address_country: "GH",
          bill_to_address_state: " ",
        },
        dataType: "json",
        success: function (data) {
          if (data.success === false) {
            console.log(
              `ajax call to "https://gw.ipaygh.com/services/cybercards/" + ${_gwref} + "/sign"`,
              data
            );

            return false;
          } else {
            _cybsign = data.signature;
            _cybfields = JSON.stringify(data.TxnData);
            _cybapiurl = data.endpoint;

            _gwObject.Show3DsForm(values);
            return _gwObject.processCybCard(values);
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

    _gwObject.processCybCard = function (values) {
      console.log(`processCybCard called`);
      apiurl = _cybapiurl;
      const data = JSON.parse(_cybfields);

      data["card_number"] = values.cardNumber;
      data["card_type"] = values.cardType;
      data["card_cvn"] = values.cardCVV;
      data["card_expiry_date"] =
        values.cardExpiryMonth + "-" + values.cardExpiryYear;

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

    _gwObject.Show3DsForm = function (values) {
      //   console.log(url);
      console.log(`Show3DsForm called`);
      $("#" + _gwFrameID + "_div").iziModal({});
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
      if (e.data.event_id === "gw_show_overlay") {
        _gwObject.ShowOverlay();
      } else if (e.data.event_id === "gw_hide_overlay") {
        _gwObject.HideOverlay();
      } else if (e.data.event_id === "gw_paid") {
        _gwObject.HideOverlay();
        _gwObject.PaidEventHandler(e.data);
      } else if (e.data.event_id === "gw_pay_failed") {
        _gwObject.HideOverlay();
        _gwObject.FailedEventHandler(e.data);
      } else if (e.data.event_id === "gw_pay_unsuccessful") {
        _gwObject.HideOverlay();
        _gwObject.FailedEventHandler(e.data);
      } else if (e.data.event_id === "gw_pay_unexpected") {
        _gwObject.HideOverlay();
        _gwObject.FailedEventHandler(e.data);
      } else if (e.data.event_id === "gw_pay_end") {
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
};

function getParameterByName(name, url = window.location.href) {
  name = name.replace(/[[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}
