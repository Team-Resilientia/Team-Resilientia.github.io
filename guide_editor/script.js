var flipAudio = new Audio('flip.ogg');
var inputBox = document.getElementById('input');
var caretOn = false;
var caretTime = 0;
var currentPage = 0;

function updateInOut(outDisplay) {
	let bookCode = inputBox.value;
	let displayedTxt = '<a>';
	let bookCodePageOffset = 0;
	
	let offsetPageCheck = 0;
	for (let i = 0; offsetPageCheck < currentPage; i++) {
		if (i == bookCode.length) {
			bookCodePageOffset = bookCode.length;
			break;
		}
		if ((i == 0 || bookCode[i - 1] != '\\') && i != bookCode.length - 1
			&& bookCode[i] == '\\' && bookCode[i + 1] == 'p') {
			bookCodePageOffset = i + 2;
			offsetPageCheck++;
		}
	}
	
	let currentColor = 0;
	let formattingCodes = [];
	for (let i = bookCodePageOffset; i < bookCode.length; i++) {
		if ((i == 0 || bookCode[i - 1] != '\\') && i != bookCode.length - 1 && bookCode[i] == '\\') {
			if (bookCode[i + 1] == 'p') break;
			if (bookCode[i + 1] == 'q') {
				displayedTxt += "</br>";
				i++;
			} else if (bookCode[i + 1] == 'r') {
				formattingCodes = [];
				currentColor = 0;
				displayedTxt = changeFormatting(displayedTxt, currentColor, formattingCodes);
				i++;
			} else if (bookCode.charCodeAt(i + 1) >= 107 && bookCode.charCodeAt(i + 1) <= 111) {
				if (!formattingCodes.includes(bookCode[i + 1])) {
					formattingCodes.push(bookCode[i + 1]);
					displayedTxt = changeFormatting(displayedTxt, currentColor, formattingCodes);
				}
				i++;
			} else if (!isNaN(bookCode[i + 1])) {
				currentColor = parseInt(bookCode[i + 1]);
				displayedTxt = changeFormatting(displayedTxt, currentColor, formattingCodes);
				i++;
			} else if (bookCode.charCodeAt(i + 1) >= 97 && bookCode.charCodeAt(i + 1) <= 101) {
				currentColor = bookCode.charCodeAt(i + 1) - 97 + 10;
				displayedTxt = changeFormatting(displayedTxt, currentColor, formattingCodes);
				i++;
			} else {
				displayedTxt += bookCode[i + 1];
				i++;
			}
		} else {
			if (bookCode.charCodeAt(i) == 10) {
				displayedTxt += "</br>";
			} else if (bookCode.charCodeAt(i) == 32) {
				displayedTxt += "&nbsp;";
			} else {
				if (formattingCodes.includes('k')) {
					displayedTxt += String.fromCharCode(Math.floor(Math.random() * 94) + 33);
				} else {
					displayedTxt += bookCode[i];
				}
			}
		}
		if (inputBox === document.activeElement) {
			if (inputBox.selectionStart == inputBox.selectionEnd) {
				if (caretOn && i >= bookCodePageOffset && i == inputBox.selectionStart - 1) {
					displayedTxt += '&#x007C;';
				}
			}
		}
	}
	
	displayedTxt += '</a>';
	outDisplay.innerHTML = displayedTxt;
}

var colors = ['000000', '0000AA', '00AA00', '00AAAA', 'AA0000', 'AA00AA', 'FFAA00', 'AAAAAA', '555555', '5555FF', '55FF55', '55FFFF', 'FF5555', 'FF55FF', 'FFFF55', 'FFFFFF'];
function changeFormatting(str, color, formats) {
	str += "</a><a style='";
	str += 'color: #' + colors[color];
	if (formats.length != 0) {
		if (formats.includes('l')) {
			str += '; font-family: "MinecraftBold"';
		} else if (formats.includes('o')) {
			str += '; font-style: italic';
		} else if (formats.includes('m') || formats.includes('n')) {
			str += '; text-decoration:';
			if (formats.includes('m')) str += ' line-through';
			if (formats.includes('n')) str += ' underline';
		}
	}
	return str + "'>";
}

document.getElementById('leftarrow').onclick = function() {
	if (currentPage > 1) currentPage -= 2;
	document.getElementById('pagenum').innerHTML = currentPage.toString() + '-' + (currentPage + 1).toString();
	flipAudio.play();
}
document.getElementById('rightarrow').onclick = function() {
	currentPage += 2;
	document.getElementById('pagenum').innerHTML = currentPage.toString() + '-' + (currentPage + 1).toString();
	flipAudio.play();
}

window.onload = function() {
	inputBox.value = document.cookie.substring(5).slice(0, -1);
	function update() {
		updateInOut(document.getElementById('page1'));
		currentPage++;
		updateInOut(document.getElementById('page2'));
		currentPage--;
		
		document.cookie = "text=" + inputBox.value + ";";
		
		caretTime++;
		if (caretTime % 25 == 0) {
			caretTime = 0;
			caretOn = !caretOn;
		}
	}
	setInterval(update, 20);
 }