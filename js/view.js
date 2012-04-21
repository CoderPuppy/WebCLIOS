define(['require', 'exports', './runView', './os/lib/autocomplete'], function(require, exports, runView, autoComplete) {
	var AutoCompleter = autoComplete.AutoCompleter;
	var RunView = runView.RunView;
	
	function merge(dest, source) {
		for(key in source) {
			dest[key] = source[key];
		}
		
		return dest;
	}
	
	function totalWidthOf(el) {
	  var style = window.getComputedStyle(el);
	  
	  // return toPx(style.marginLeft) + toPx(style.borderLeft) + toPx(style.paddingLeft) + toPx(style.width) + toPx(style.paddingRight) + toPx(style.borderRight) + toPx(style.marginRight);
	  return toPx(style.marginLeft) + toPx(style.width) + toPx(style.marginRight);
	}
	
	function toPx(v) {
		return parseFloat(v.replace(/px$/, ''));
	}
	
	function max(num, limit) {
		return num > limit ? limit : num;
	}
	
	function min(num, limit) {
		return num < limit ? limit : num;
	}
	
	function moveCaret(el, pos) {
		if (typeof el.selectionStart == "number") {
			el.selectionStart = el.selectionEnd = pos;
		}
	}
	
	function textWidth(text, style) {
		var el = document.createElement("div");
		el.style.position = 'fixed';
		el.style.visibility = 'hidden';
		el.style.height = 'auto';
		el.style.width = 'auto';
		/*el.style.left = '-2000px';
		el.style.top = '-2000px';*/
		if(style.fontSize) el.style.fontSize = style.fontSize;
		if(style.fontFamily) el.style.fontFamily = style.fontFamily;
		if(style.fontWeight) el.style.fontWeight = style.fontWeight;
		if(style.fontStyle) el.style.fontStyle = style.fontStyle;
		if(style.fontVariant) el.style.fontVariant = style.fontVariant;
		
		el.textContent = text;
		
		document.body.appendChild(el);
		
		var width = el.clientWidth + 1;
		
		document.body.removeChild(el);
		
		return width;
	}
	
	$.fn.equals = function equals(compareTo) {
		if (!compareTo || !compareTo.length || this.length != compareTo.length) {
			return false;
		}
		for (var i = 0; i < this.length; i++) {
			if (this[i] !== compareTo[i]) {
				return false;
			}
		}
		
		return true;
	};
	
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
			
			this.autoCompleteEl = $('<ul>').addClass('autocomplete').text('Autocomplete:').appendTo(this.runEl);
			
			this.runCMDViewEl = $('<span>').addClass('view-cmd-view').click(function(e) {
				self.runCMDEl[0].focus();
				
				// Find caret position
				if(this.textContent.length > 0) {
					var width = textWidth(this.textContent, this.style) / this.textContent.length;
					var x = e.screenX;
					var caret = (x - (x % width)) / width;
					
					moveCaret(self.runCMDEl[0], ( caret > this.textContent.length ? this.textContent.length : caret - 1 ));
				}
			}).appendTo(this.runEl);
			
			this.completion = undefined;
			
			this.runCMDEl = $('<input>').addClass('view-hidden-input').keydown(function() {
				//self.liveParse();
			}).keyup(function(e) {
				var liveParse = true;
				
				switch(e.keyCode) {
					case 13: // Enter
						if(self.completion) {
							// Apply completion
							self.runCMDEl.val(self.completion.full);
						} else {
							// Run CMD
							self.terminal.runCMD(self.runCMDEl.val());
							self.runCMDEl.val('');
						}
						
						self.liveParse();
						break;
					case 37: // Left
						// Move cursor left
						liveParse = false;
						break;
					case 38: // Up
						// Select autocomplete
						liveParse = false;
						if(self.completionIndex > 0/*self.completions.length - 1*/ || self.completionIndex === undefined) {
							self.completion = self.completions[
								self.completionIndex = (typeof(self.completionIndex) == 'undefined' ? self.completions.length : self.completionIndex) - 1
							];
						} else {
							self.completion = self.completions[
								self.completionIndex = self.completions.length - 1
							];
						}
						break;
					case 39: // Right
						// Move cursor right
						liveParse = false;
						break;
					case 40: // Down
						// Select autocomplete
						liveParse = false;
						if(self.completionIndex < self.completions.length - 1) {
							self.completion = self.completions[++self.completionIndex];
						} else if(self.completion === undefined && self.completionIndex === undefined) {
							self.completion = self.completions[
								self.completionIndex = 0
							];
						} else {
							self.completion = self.completionIndex = undefined;
						}
						break;
					//case !/\w/.test(String.fromCharCode(e.keyCode)):
					case !/[0-9a-zA-Z]/.test(String.fromCharCode(e.keyCode)):
					//default:
						console.log(e.keyCode);
						break;
				}
				
				self.selectAutoComplete();
				
				if(liveParse) self.liveParse();
			}).appendTo(this.runEl);
			
			this.runBtnEl = $('<button>').addClass('view-run-btn').text('Run').click(function() {
				self.terminal.runCMD(self.runCMDEl.val());
				self.runCMDEl.val('');
				self.liveParse();
			}).appendTo(this.runEl);
			
			this.runCMDViewEl.css('right', totalWidthOf(this.runBtnEl[0]));
			
			this.autoCompleter = new AutoCompleter(this.terminal);
			
			$('.view').livequery(function() {
				var $t = $(this);
				
				if(this == self.el[0]) {
					self.runCMDEl.css('right', toPx(self.runCMDViewEl.css('right', totalWidthOf(self.runBtnEl[0]) + 4 + 16).css('right')) + 5);
				}
				
				self.runCMDEl[0].focus();
			});
			
			return self = merge(this.el, this);
		}
		
		View.prototype.updateAutoComplete = function updateAutoComplete() {
			if(!this.parsed) {
				this.liveParse();
				return this;
			}
			
			this.completion = this.completionIndex = undefined;
			
			this.completions = this.autoCompleter.autoComplete(/*this.runCMDEl.val()*/this.parsed, getCaret(this.runCMDEl[0]), this.terminal);
			this.autoCompleteEl.text('Autocomplete:');
			
			for(var i = 0; i < this.completions.length; i++) {
				this.completions[i].el = $('<li>').text(this.completions[i].name)
					.click((function(full) {
						return (function() {
							this.runCMDEl.val(full);
							this.liveParse();
						}).bind(this);
					}).call(this, this.completions[i].full))
					.addClass('completion')
					.appendTo(this.autoCompleteEl);
			}
			
			return this;
		};
		
		View.prototype.liveParse = function liveParse() {
			var self = this, el = this.runCMDViewEl.text(''), cmdEl;
			
			this.parsed = this.autoCompleter.parse(this.runCMDEl.val());
			
			// Old code just set the text
			// this.runCMDViewEl.text(this.parsed.text);
			
			this.parsed.forEach(function(cmd) {
				cmdEl = $('<span>').addClass('cli-cmd-view').appendTo(el);
				
				cmdEl.text(cmd.str);
				cmdEl.html(/^(\s*)/.exec(cmd.str.split('').join(''))[1].replace(/\t/, '    ').replace(/ /g, '&nbsp;') +
					cmdEl.html() +
					/(\s*)$/.exec(cmd.str.split('').join(''))[1].replace(/\t/, '    ').replace(/ /g, '&nbsp;'));
			});
			
			this.updateAutoComplete();
		};
		
		View.prototype.selectAutoComplete = function selectAutoComplete() {
			if(this.completion) {
				$('.completion.selected', this.el).removeClass('selected');
				this.completion.el.addClass('selected');
			}
		};
		
		View.prototype.setTerminal = function setTerminal(terminal) {
			this.terminal = terminal;
			this.fs = this.terminal.fs;
			this.currentDir = this.terminal.currentDir;
			
			this.liveParse();
		};
		
		View.prototype.createRunView = function createRunView(runContext, cmdLine) {
			return new RunView(this, runContext, cmdLine);
		};
		
		return View;
	})();
});
