define(['require', 'exports', './cmdView'], function(require, exports, cmdView) {
	var CMDView = cmdView.CMDView;
	
	var RunView = exports.RunView = (function() {
		function RunView(view, runContext, cmdLine) {
			this.view = view;
			this.runContext = runContext;
			this.cmdLine = cmdLine;
			
			this.el = $('<div>').addClass('run-view').text(this.cmdLine.map(function(cmd) {
				return  ( cmd.joiner == '^' ? '' : ' ' + cmd.joiner ) + cmd.str + ' ';
			}).join(' '));
			
//			this.view.el.insertBefore(this.el, this.view.el.childNodes[this.view.el.childNodes.length - 1]);
			this.el.insertBefore(this.view.el.children().last());
		}
		
		RunView.prototype.createCMDView = function createCMDView(cmdContext, cmd, options) {
			return new CMDView(this, cmdContext, cmd, options);
		};
		
		return RunView;
	})();
});
