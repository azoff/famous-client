(function(doc, $, stripe){

	"use strict";

	var form, info, client, config, submit;

	function authorizeStripe(config) {
		stripe.setPublishableKey(config.stripeKey);
	}

	function formReady() {
		form.addClass('ready');
	}

	function setGlobals() {
		form   = $('form');
		info  = form.find('#info');
		submit = form.find('#submit');
		config = $.getJSON('conf/' + doc.domain + '.json');
	}

	function addListeners() {
		config.then(authorizeStripe);
		config.then(formReady);
		form.on('click', 'a', toggleForm);
		form.on('submit', getToken);
	}

	function formParams() {
		var params = {};
		var inputs = form.serializeArray();
		$.each(inputs, function(i, input){
			params[input.name] = input.value;
		});
		return params;
	}

	function getToken() {
		notify();
		var params = formParams();
		submit.prop('disabled', true);
		form.addClass('submitting');
		stripe.createToken(params, responseHandler(params));
		return false;
	}

	function notify(msg, className) {
		info.text(msg)
			.toggleClass('fail', className === 'fail')
			.toggleClass('pass', className === 'pass');
		submit.prop('disabled', false);
	}

	function checkResponse(response) {
		if (response.error) {
			notify(response.error, 'fail');
		} else if (response.content) {
			doc.body.innerHTML = response.content;
		} else {
			notify('You Win! Please reload the page.', 'pass');
		}
	}

	function notifyFailure(request, code, error) {
		notify('Server Error: ' + error, 'fail');
	}

	function chargesLeapfrog(config, token, params) {
		return $.getJSON(config[0].apiServer + '/charges.leapfrog?callback=?', {
			amount: params.charge*100,
			token: token,
			description: params.description
		}).then(checkResponse).fail(notifyFailure);
	}

	function responseHandler(params) {
		return function(status, token) {
			if (token.error) {
				notify(token.error.message, 'fail');
			} else if(token.id) {
				$.when(config, token.id, params).then(chargesLeapfrog);
			} else {
				notify('Unable to process payment at this time', 'fail');
			}
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