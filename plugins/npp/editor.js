/**
 * @param {Function} require
 * @param {Underscore} _
 * @memberOf __nppPlugin
 * @constructor
 */
zen_coding.define('editorProxy', function(require, _) {
	function getView() {
		return Editor.currentView;
	}
	
	return {
		/** @memberOf editorProxy */
		getSelectionRange: function() {
			var view = getView();
			return {
				start: view.anchor,
				end: view.pos
			};
		},

		createSelection: function(start, end) {
			var view = getView();
			view.anchor = start;
			view.pos = end;
		},

		getCurrentLineRange: function() {
			var view = getView();
			var line = view.lines.get(view.line);
			return {
				start: line.start,
				end:   line.end
			};
		},

		getCaretPos: function() {
			return getView().pos;
		},

		setCaretPos: function(pos) {
			this.createSelection(pos, pos);
		},

		getCurrentLine: function() {
			var view = getView();
			var line = view.lines.get(view.line);
			return line.text;
		},

		replaceContent: function(value, start, end, noIndent) {
			if (_.isUndefined(end)) 
				end = _.isUndefined(start) ? content.length : start;
			if (_.isUndefined(start)) start = 0;
			var utils = require('utils');
			
			// indent new value
			if (!noIndent) {
				value = utils.padString(value, utils.getLinePadding(this.getCurrentLine()));
			}
			
			// find new caret position
			var tabstopData = require('tabStops').extract(value, {
				escape: function(ch) {
					return ch;
				}
			});
			value = tabstopData.text;
			var firstTabStop = tabstopData.tabstops[0];
			
			if (firstTabStop) {
				firstTabStop.start += start;
				firstTabStop.end += start;
			} else {
				firstTabStop = {
					start: value.length + start,
					end: value.length + start
				};
			}
			
			// insert new text
			this.createSelection(start, end);
			getView().selection = value;
			this.createSelection(firstTabStop.start, firstTabStop.end);
		},

		getContent: function(){
			return getView().text || '';
		},

		getSyntax: function() {
			var view = getView();
			
			var syntax = (Editor.langs[view.lang] || '').toLowerCase();
			var caretPos = this.getCaretPos();
				
			if (!require('resources').hasSyntax(syntax))
				syntax = 'html';
			
			if (syntax == 'html') {
				// get the context tag
				var pair = require('html_matcher').getTags(this.getContent(), caretPos);
				if (pair && pair[0] && pair[0].type == 'tag' && pair[0].name.toLowerCase() == 'style') {
					// check that we're actually inside the tag
					if (pair[0].end <= caretPos && pair[1].start >= caretPos)
						syntax = 'css';
				}
			}
			
			return syntax;
		},

		getProfileName: function() {
			switch(this.getSyntax()) {
				 case 'xml':
				 case 'xsl':
				 	return 'xml';
				 case 'html':
				 	var profile = require('resources').getVariable('profile');
				 	if (!profile) { // no forced profile, guess from content
					 	// html or xhtml?
				 		profile = this.getContent().search(/<!DOCTYPE[^>]+XHTML/i) != -1 ? 'xhtml': 'html';
				 	}

				 	return profile;
			}

			return 'xhtml';
		},

		prompt: function(title, value) {
			var ie = new ActiveXObject("InternetExplorer.Application");
			ie.navigate('about:blank'); 
			ie.Visible = 0;
			
			while (ie.Busy) {}
		    var obj = ie.Document.Script;
		    var input = obj.prompt(title, value || '');
		    ie.Quit();
		    return input;
		},

		getSelection: function() {
			return getView().selection || '';
		},

		getFilePath: function() {
			return getView().file;
		}
	};
});