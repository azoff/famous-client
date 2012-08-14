(function(doc, $, stripe){

	"use strict";

	var form, info, config, submit;

	function authorizeStripe(config) {
		stripe.setPublishableKey(config.stripeKey);
	}

	function setGlobals() {
		form   = $('form');
		info  = form.find('#info');
		submit = form.find('#submit');
		config = $.getJSON('conf/' + doc.domain + '.json');
	}

	function addListeners() {
		config.then(authorizeStripe);
		form.on('click', 'a', toggleForm);
		form.on('submit', getToken);
	}

	function getParams() {
		var params = {};
		var inputs = form.serializeArray();
		$.each(inputs, function(i, input){
			params[input.name] = input.value;
		});
	}

	function getToken() {
		submit.prop('disabled', true);
		form.addClass('submitting');
		info.removeClass('fail pass');
		stripe.createToken(getParams(), handleResponse);
		return false;
	}

	function handleResponse(status, response) {
		if (response.error) {
			info.text(response.error.message).addClass('fail');
			submit.prop('disabled', false);
		} else {
			//TODO: AJAX charge!
		}
	}

	function toggleForm() {
		form.toggleClass('active');
	}

	function init() {
		setGlobals();
		config.then(addListeners);
	}

	$(init);

})(document, jQuery, Stripe);