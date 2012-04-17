define(['require', 'exports', './stream'], function(require, exports, Stream) {
	var CMDView = exports.CMDView = (function() {
		function CMDView(runView, cmdContext, cmd, options) {
			var self = this;
			
			this.runView = runView;
			this.options = options || {};
			this.cmdContext = cmdContext;
			this.cmd = cmd;
			this.pipe = this.options.pipe || false;
			this.exitCode = 'Unknown';
			
			this.output = [];
			
			this.el = $('<div>').addClass('cmd-view').text(cmd.str);
			
			this.exitCodeEl = $('<span>').addClass('cmd-view-exit-code').text(this.exitCode).appendTo(this.el);
			
			this.outputEl = $('<div>').addClass('cmd-view-output').appendTo(this.el);
			
/*			if(this.pipe == 'later') this.runView.el.insertBefore(this.el, this.runView.el.childNodes[this.runView.el.childNodes.length - 1]);
			else this.runView.el.appendChild(this.el);*/
			
			if(this.pipe == 'later') this.el.insertBefore(this.runView.el.children().last());
			else this.el.appendTo(this.runView.el);
			
			
			this.stream = new Stream();
			
			this.stream.on('data', function(data) {
				self.output.push(data);
				self.outputEl.append((self.outputEl.children().length > 0 ? '<br />' : '') + data);
			});
		}
		
		CMDView.prototype.setExitCode = function setExitCode(code) {
			this.exitCode = code;
			this.exitCodeEl.text(code);
		};
		
		return CMDView;
	})();
});
