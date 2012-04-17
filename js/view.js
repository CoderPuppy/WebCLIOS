define(['require', 'exports', './runView'], function(require, exports, runView) {
	var RunView = runView.RunView;
	
	var View = exports.View = (function() {
		function View() {
			var self = this;
			
			this.el = $('<div>').addClass('view').appendTo(document.body);
			
			// Way to run commands through the browser
			this.runEl = $('<div>').addClass('view-run-cmd').appendTo(this.el);
			
			this.runCMDEl = $('<textarea>').appendTo(this.runEl);
			
			this.runBtnEl = $('<button>').text('Run').click(function() {
				self.terminal.runCMD(self.runCMDEl.val());
				self.runCMDEl.val('');
			}).appendTo(this.runEl);
		}
		
		View.prototype.setTerminal = function setMachine(terminal) {
			this.terminal = terminal;
			this.fs = this.terminal.fs;
			this.currentDir = this.terminal.currentDir;
		};
		
		View.prototype.createRunView = function createRunView(runContext, cmdLine) {
			return new RunView(this, runContext, cmdLine);
		};
		
		return View;
	})();
});
