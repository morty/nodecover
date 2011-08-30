// General utility Javascript code cleaner.
//
var fsutils = require('./fsutils.js');
var for_regex = /\bfor\b/;
var if_regex = /\bif\b/;
var else_regex =/\belse\b/;
var findLinesWithFor = function(docLines) {
	var i = 0;
	var linesWithFor=[];
	for (i = 0; i < docLines.length ; i++) {
		if (for_regex.test(docLines[i]) && (docLines[i].indexOf('//') < 0 || ( docLines[i].indexOf(' for') < docLines[i].indexOf('//') )))	{
			linesWithFor.push(i);
		}
	}
	console.log('lines with For:' + JSON.stringify(linesWithFor));
	return linesWithFor;
};

var cleanForLoopForLine = function(currentLine, currentLineNum, docLines) {
	var nestingLevel = 0;
	if (currentLine.indexOf('{') < 0 && fsutils.trimString(docLines[currentLineNum + 1]).charAt(0) !== '{') {
		if(for_regex.test(docLines[currentLineNum + 1])) {
		    console.log('found nested for');	
			nestingLevel ++;
			cleanForLoopForLine(docLines[currentLineNum+1], currentLineNum + 1,docLines);
		}
		if (if_regex.test(docLines[currentLineNum + nestingLevel + 1]) && else_regex.test(docLines[currentLineNum + nestingLevel + 2])) {
			docLines[currentLineNum+nestingLevel+2] += '}'; 
		} else {
			docLines[currentLineNum+nestingLevel+1] += '}';
		}
		if (currentLine.indexOf('//') < 0) {
			docLines[currentLineNum] = currentLine + ' {';
		} else  {
			docLines[currentLineNum] = currentLine.substring(0,currentLine.indexOf('//')) + ' { ';
		}
	}
	return nestingLevel;
};

var cleanForLoops = function(docLines) {
	var i = 0, currentLineNum = 0, currentLine = '', nestedFor = 0;
	linesWithFor = findLinesWithFor(docLines);
	for (i = 0; i < linesWithFor.length; i++) {
		if (nestedFor >  0) {
			nestedFor --;
		} else {
			currentLineNum = linesWithFor[i];
			currentLine = docLines[currentLineNum];
			nestedFor = cleanForLoopForLine(currentLine, currentLineNum, docLines);
		}
	}
	return docLines;
};
var closingBracket = function(line) {
	var open = 0, index=0, has_opened = false;
	var i = 0, c;
	for (i = 0; i < line.length; i++) {
		c = line.charAt(i);	
		if (c === '('){
			open++;
			has_opened = true;
		}
		if (c === ')') {
			open--;
		}
		if (has_opened && open === 0) {
			return index;
		}	
		index++;
	}
	return -1;
};
exports.closingBracket = closingBracket;

exports.wrapIfStatement = function(line) {
	console.log('wrapIfStatement(\''+line+'\')');
	if (line.indexOf('{') < 0) {
		var endCondition = closingBracket(line);
		return line.substring(0,endCondition+1)+' { ' + line.substring(endCondition+1) + ' } ';		
	} 
};
exports.findLinesWithFor = findLinesWithFor;
exports.cleanForLoops = cleanForLoops;