/**
 * Common module's preferences storage. This module 
 * provides general storage for all module preferences, their description and
 * default values.<br><br>
 * 
 * This module can also be used to list all available properties to create 
 * UI for updating properties
 * 
 * @memberOf __preferencesDefine
 * @constructor
 * @param {Function} require
 * @param {Underscore} _ 
 */
zen_coding.define('preferences', function(require, _) {
	var preferences = {};
	var defaults = {};
	var _dbgDefaults = null;
	var _dbgPreferences = null;
	
	function isValueObj(obj) {
		return _.isObject(obj) 
			&& 'value' in obj 
			&& _.keys(obj).length < 3;
	}
	
	return {
		/**
		 * Creates new preference item with default value
		 * @param {String} name Preference name. You can also pass object
		 * with many options
		 * @param {Object} value Preference default value
		 * @param {String} description Item textual description
		 * @memberOf preferences
		 */
		define: function(name, value, description) {
			var prefs = name;
			if (_.isString(name)) {
				prefs = {};
				prefs[name] = {
					value: value,
					description: description
				};
			}
			
			_.each(prefs, function(v, k) {
				defaults[k] = isValueObj(v) ? v : {value: v};
			});
		},
		
		/**
		 * Updates preference item value. Preference value should be defined
		 * first with <code>define</code> method.
		 * @param {String} name Preference name. You can also pass object
		 * with many options
		 * @param {Object} value Preference default value
		 * @memberOf preferences
		 */
		set: function(name, value) {
			var prefs = name;
			if (_.isString(name)) {
				prefs = {};
				prefs[name] = value;
			}
			
			_.each(prefs, function(v, k) {
				if (!(k in defaults)) {
					throw 'Property "' + k + '" is not defined. You should define it first with `define` method of current module';
				}
				
				// do not set value if it equals to default value
				if (v !== defaults[k].value) {
					preferences[k] = v;
				} else if  (k in preferences) {
					delete preferences[p];
				}
			});
		},
		
		/**
		 * Returns preference value
		 * @param {String} name
		 * @returns {String} Returns <code>undefined</code> if preference is 
		 * not defined
		 */
		get: function(name) {
			if (name in preferences)
				return preferences[name];
			
			if (name in defaults)
				return defaults[name].value;
			
			return void 0;
		},
		
		/**
		 * Returns comma-separated preference value as array of values
		 * @param {String} name
		 * @returns {Array} Returns <code>undefined</code> if preference is 
		 * not defined, <code>null</code> if string cannot be converted to array
		 */
		getArray: function(name) {
			var val = this.get(name);
			if (!_.isUndefined(val)) {
				val = _.map(val.split(','), require('utils').trim);
				if (!val.length)
					val = null;
			}
			
			return val;
		},
		
		/**
		 * Returns description of preference item
		 * @param {String} name Preference name
		 * @returns {Object}
		 */
		description: function(name) {
			return name in defaults ? defaults[name].description : void 0;
		},
		
		/**
		 * Completely removes specified preference(s)
		 * @param {String} name Preference name (or array of names)
		 */
		remove: function(name) {
			if (!_.isArray(name))
				name = [name];
			
			_.each(name, function(key) {
				if (key in preferences)
					delete preferences[key];
				
				if (key in defaults)
					delete defaults[key];
			});
		},
		
		/**
		 * Returns sorted list of all available properties
		 * @returns {Array}
		 */
		list: function() {
			return _.map(_.keys(defaults).sort(), function(key) {
				return {
					name: key,
					value: this.get(key),
					description: defaults[key].description
				};
			}, this);
		},
		
		/**
		 * Loads user-defined preferences from JSON
		 * @param {Object} json
		 * @returns
		 */
		load: function(json) {
			_.each(json, function(value, key) {
				this.set(key, value);
			}, this);
		},
		
		/**
		 * Reset to defaults
		 * @returns
		 */
		reset: function() {
			preferences = {};
		},
		
		/**
		 * For unit testing: use empty storage
		 */
		_startTest: function() {
			_dbgDefaults = defaults;
			_dbgPreferences = preferences;
			defaults = {};
			preferences = {};
		},
		
		/**
		 * For unit testing: restore original storage
		 */
		_stopTest: function() {
			defaults = _dbgDefaults;
			preferences = _dbgPreferences;
		}
	};
});