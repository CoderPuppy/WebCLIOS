define(['require', 'exports', './os/lib/index', './view'], function(requre, exports, os, view) {
	window.os = os;
	window.Machine = os.Machine;
	window.view = view;
	window.View = view.View;
	
	exports.machine = new Machine();
	exports.view = new View();
	exports.terminal = exports.machine.createTerminal(exports.view);
	
	window.test = exports;
	
	$(function() {
		exports.view.appendTo(document.body);
	});
});
