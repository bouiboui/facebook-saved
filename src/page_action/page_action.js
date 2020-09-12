chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	if (!tabs[0].url.match(/^https:\/\/www.facebook.com\/saved/gis)) {
		UIkit.modal(document.querySelector('#modal-center')).show();
	} else {
		UIkit.modal(document.querySelector('#modal-center')).hide();
		sendMessageToTab({doIt: true});
	}
});

const sendMessageToTab = (message, callback) => {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, message, callback);
	});
};

const onClick = (selector, callback) => document.querySelector(selector)
.addEventListener("click", callback);

onClick('#doItButton', () => {
	document.querySelector('#spinner').style.display = "block";
	sendMessageToTab({doIt: true});
});

onClick('#startAutoScrollButton', () => {
	document.querySelector('#startAutoScrollButton').style.display = "none";
	document.querySelector('#stopAutoScrollButton').style.display = "inline";
	sendMessageToTab({autoScroll: "start"});
});

onClick('#stopAutoScrollButton', () => {
	document.querySelector('#startAutoScrollButton').style.display = "inline";
	document.querySelector('#stopAutoScrollButton').style.display = "none";
	sendMessageToTab({autoScroll: "stop"});
});

onClick('#copyButton', () => {
	document.querySelector('#foundLinksTextarea').select();
	document.execCommand("copy");
	UIkit.notification('Copied to clipboard!', {pos: 'bottom-center'});
});

onClick('#openSavedPage', () => {
	chrome.tabs.create({ url: 'https://www.facebook.com/saved' });
});

chrome.extension.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.foundLinks) {
			document.querySelector('#spinner').style.display = "none";
			const res = request.foundLinks;
			document.querySelector('#foundLinksCountSpan').innerHTML = res.length;
			document.querySelector('#foundLinksTextarea').value = res.join(' ');
		}
	});
