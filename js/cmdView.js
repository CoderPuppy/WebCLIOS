define(['require', 'exports', './stream', './events'], function(require, exports, Stream, events) {
	var EventEmitter = events.EventEmitter;
	
	function merge(dest, source) {
		for(key in source) {
			dest[key] = source[key];
		}
		
		return dest;
	}
	
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
			
			this.stream = (function() {
				var stream = {
					write: function write() { // Write data out
						this.emit.apply(this, ['__data__'].concat([].slice.call(arguments)));
					},
					data: function data(cb) { // On recieve data
						this.on('data', cb);
					},
					contentType: function contentType(value) {
						if(value) {
							this._contentType = value;
							
							return this;
						} else {
							return this._contentType || 'application/json';
						}
					},
					__write__: function() { // Write data in
						this.emit.apply(this, ['data'].concat([].slice.call(arguments)));
					},
					__data__: function(cb) { // On write data
						this.on('__data__', cb);
					}
				};
				
				EventEmitter.call(stream);
				
				stream = merge(stream, new EventEmitter());
				
				return stream;
			})();
			
			this.inData = [];
			this.outData = [];
			
			this.input = new Stream();
			this.output = new Stream();
			
			this.input.on('data', function() {
				self.stream.__write__.apply(self.stream, arguments);
				self.data = self.inData.concat(arguments);
			});
			
			this.stream.__data__(function() {
				self.output.write.apply(self.output, [].slice.call(arguments));
				self.data = self.outData.concat(arguments);
			});
			
			this.output.on('data', function(data) {
				self.outputEl.append((self.outputEl.html().length > 0 ? '<br />' : '') + data);
			});
		}
		
		CMDView.prototype.setExitCode = function setExitCode(code) {
			this.exitCode = code;
			this.exitCodeEl.text(code);
		};
		
		return CMDView;
	})();
});
