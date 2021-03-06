/*/////////////////////////////////////////////////////////////////////////
//                                                                       //
//   Switchy! Chrome Proxy Manager and Switcher                          //
//   Copyright (c) 2009 Mohammad Hejazi (mohammadhi at gmail d0t com)    //
//   Dual licensed under the MIT and GPL licenses.                       //
//                                                                       //
/////////////////////////////////////////////////////////////////////////*/

var Logger = {};

///// Log Types //////
Logger.debug = "debug";
Logger.info = "info";
Logger.success = "success";
Logger.warning = "warning";
Logger.error = "error";

///// Event Types //////
Logger.onLog = "log";

Logger.entries = [];
Logger.enabled = true;
Logger.logToConsole = true;
Logger.logAlert = false;
Logger.logStackTrace = false;
Logger.maxCapacity = 10;
Logger.listeners = [];

Logger.log = function log(message, type, logStackTrace) {
	if (!Logger.enabled)
		return;
	
	if (!type)
		type = Logger.debug;
	
	if (logStackTrace == undefined)
		logStackTrace = Logger.logStackTrace;
	
	var time = new Date().toLocaleTimeString();
	var formattedMessage = Logger.format(message, type, time);
	var stackTrace = null;
	if (logStackTrace) {
		stackTrace = Logger.getStackTrace();
		formattedMessage += "\nStack Trace:\n" + stackTrace.join("\n");
	}
	
	if (Logger.listeners[Logger.onLog]) {
		for (var i in Logger.listeners[Logger.onLog]) {
			var fn = Logger.listeners[Logger.onLog][i];
			try {
				fn({ message: message, type: type, formattedMessage: formattedMessage });
			} 
			catch (ex) {}
		}
	}
	
	if (Logger.logToConsole)
		console.log(formattedMessage);
	
	if (Logger.logAlert)
		alert(formattedMessage);
	
	if (Logger.entries.length >= Logger.maxCapacity)
		Logger.entries.shift();
	
	Logger.entries.push({ message: message, type: type, time: time, stackTrace: stackTrace });
};

Logger.getStackTrace = function getStackTrace() {
	var anonymous = "<anonymous>";
	var functionRegex  = /function\s*([\w\-$]+)?\s*\(/i;
	var stack = [];
	var currentFunction = arguments.callee.caller.caller;
	while (currentFunction) {
		var fn = functionRegex.test(currentFunction.toString()) ? RegExp.$1 || anonymous : anonymous;
		var args = stack.slice.call(currentFunction.arguments);
		var i = args.length;
	    while (i--) {
	        switch (typeof args[i]) {
	            case "string":
					args[i] = '"' + args[i].replace(/"/g, '\\"') + '"';
					break;
					
	            case "function":
					args[i] = "function";
					break;
	        }
	    }
		
	    stack[stack.length] = fn + '(' + args.join(", ") + ')';
		currentFunction = currentFunction.caller;
	}
	
	return stack;
};

Logger.format = function format(message, type, time) {
	if (!time)
		time = new Date().toLocaleTimeString();
	
	if (type && type != Logger.debug)
		message = "[" + type + "] - " + message;
	
	message = "[" + time + "] " + message;
	return message;
};

Logger.toString = function toString() {
	var result = "";
	for (i in Logger.entries) {
		var entry = Logger.entries[i];
		result += Logger.format(entry.message, entry.type, entry.time) + "\n";
		if (Logger.logStackTrace) {
			result += "Stack Trace:\n" + entry.stackTrace.join("\n") + "\n";
			result += "--------------------------------------------\n";
		}

	}
	return result;
};

Logger.clear = function clear() {
	Logger.entries = [];
};

Logger.haveEntryOfType = function haveEntryOfType(type) {
	for (i in Logger.entries) {
		if (Logger.entries[i].type == type)
			return true;
	}
	return false;
};

Logger.haveErrorEntries = function haveErrorEntries() {
	return Logger.haveEntryOfType(Logger.error);
};

Logger.addEventListener = function addEventListener(event, fn) {
	if (!Logger.listeners[event])
		Logger.listeners[event] = [];
	
	Logger.listeners[event].push(fn);
};
