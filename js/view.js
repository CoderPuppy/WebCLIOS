define(['require', 'exports', './runView', './os/lib/autocomplete'], function(require, exports, runView, autoComplete) {
	var AutoCompleter = autoComplete.AutoCompleter;
	var RunView = runView.RunView;
	
	function merge(dest, source) {
		for(key in source) {
			dest[key] = source[key];
		}
		
		return dest;
	}
	
	function getCaret(el) { 
	  if (el.selectionStart) { 
		return el.selectionStart; 
	  } else if (document.selection) { 
		el.focus(); 

		var r = document.selection.createRange(); 
		if (r == null) { 
		  return 0; 
		} 

		var re = el.createTextRange(), 
			rc = re.duplicate(); 
		re.moveToBookmark(r.getBookmark()); 
		rc.setEndPoint('EndToStart', re); 

		return rc.text.length; 
	  }  
	  return 0; 
	}
	
	var View = exports.View = (function() {
		function View() {
			var self = this;
			
			this.el = $('<div>').addClass('view');//.appendTo(document.body);
			
			// Way to run commands through the browser
			this.runEl = $('<div>').addClass('view-run-cmd').appendTo(this.el);
			
			this.runCMDEl = $('<textarea>').keyup(function() {
				self.updateAutoComplete();
			}).appendTo(this.runEl);
			
			this.runBtnEl = $('<button>').text('Run').click(function() {
				self.terminal.runCMD(self.runCMDEl.val());
				self.runCMDEl.val('');
			}).appendTo(this.runEl);
			
			this.autoCompleteEl = $('<ul>').text('Autocomplete:').appendTo(this.runEl);
			
			this.autoCompleter = new AutoCompleter(this.terminal);
			
			return self = merge(this.el, this);
		}
		
		View.prototype.updateAutoComplete = function updateAutoComplete() {
			var completions = this.autoCompleter.autoComplete(this.runCMDEl.val(), getCaret(this.runCMDEl[0]), this.terminal);
			this.autoCompleteEl.text('Autocomplete:');
			
			for(var i = 0; i < completions.length; i++) {
				this.autoCompleteEl.append($('<li>')
					.text(completions[i].name)
					.click((function(full) {
						return (function() {
							this.runCMDEl.val(full);
						}).bind(this);
					}).call(this, completions[i].full)));
			}
			
			return this;
		};
		
		View.prototype.setTerminal = function setTerminal(terminal) {
			this.terminal = terminal;
			this.fs = this.terminal.fs;
			this.currentDir = this.terminal.currentDir;
			
			this.updateAutoComplete();
		};
		
		View.prototype.createRunView = function createRunView(runContext, cmdLine) {
			return new RunView(this, runContext, cmdLine);
		};
		
		return View;
	})();
});
