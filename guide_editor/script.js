var flipAudio = new Audio('flip.ogg');
var inputBox = document.getElementById('input');
var caretOn = false;
var caretTime = 0;
var currentPage = 0;

// ONLOAD AND LOOP
window.onload = function() {
	// Load input from cookies
	inputBox.value = atob(UrlDecodeBase64(getCookie('text')));
	
	function update() {
		updateInOut(document.getElementById('page1'));
		currentPage++;
		updateInOut(document.getElementById('page2'));
		currentPage--;
		
		// Remove useless images
		let imgList = document.getElementById('images').childNodes;
		for (let k = 0; k < imgList.length; k++) {
			let imgId = imgList[k].id.substring(3).padStart(2, '0');
			if (!inputBox.value.includes('\\x' + imgId)) {
				document.getElementById('images').removeChild(imgList[k]);
			}
		}
		
		// Save input to cookies
		document.cookie = 'text=' + btoa(UrlEncodeBase64(inputBox.value));
		
		caretTime++;
		if (caretTime % 10 == 0) {
			caretTime = 0;
			caretOn = !caretOn;
		}
	}
	setInterval(update, 50);
}

function getCookie(name) {
    var nameEQ = name + '=';
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return '';
}

function UrlEncodeBase64(base64Input) {
	return base64Input.replaceAll('+', '.').replaceAll('/', '_').replaceAll('=', '-');
}

function UrlDecodeBase64(encodedBase64Input) {
	return encodedBase64Input.replaceAll('.', '+').replaceAll('_', '/').replaceAll('-', '=');
}

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
				displayedTxt += '</br>';
				i++;
			} else if (bookCode[i + 1] == 'r') {
				formattingCodes = [];
				currentColor = 0;
				displayedTxt = changeFormatting(displayedTxt, currentColor, formattingCodes);
				i++;
			} else if (bookCode[i + 1] == 'x') {
				i += 2;
				let imgId = parseInt(bookCode.substring(i, i + 2));
				let imgList = document.getElementById('images').childNodes;
				let imgElem;
				for (let k = 0; k < imgList.length; k++) {
					if (imgId == parseInt(imgList[k].id.substring(3))) {
						imgElem = imgList[k];
					}
				}
				if (imgElem === undefined) {
					i += 7;
				} else {
					imgElem.style.display = 'block';
					i += 2;
					let newXimg = parseInt(bookCode.substring(i, i + 3));
					if (newXimg < 0) newXimg = 0;
					if (newXimg > 159) newXimg = 159;
					if (currentPage % 2 == 1) newXimg += 160;
					imgElem.style.left = newXimg.toString() + 'px';
					i += 3;
					let newYimg = parseInt(bookCode.substring(i, i + 3));
					if (newYimg < 0) newYimg = 0;
					if (newYimg > 233) newYimg = 233;
					imgElem.style.top = newYimg.toString() + 'px';
					i += 2;
				}
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
				displayedTxt += '</br>';
			} else if (bookCode.charCodeAt(i) == 32) {
				displayedTxt += '&nbsp;';
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

// ARROWS
document.getElementById('leftarrow').onclick = function() {
	if (currentPage > 1) currentPage -= 2;
	let imgList = document.getElementById('images').childNodes;
	for (let k = 0; k < imgList.length; k++) {
		imgList[k].style.display = 'none';
	}
	document.getElementById('pagenum').innerHTML = currentPage.toString() + '-' + (currentPage + 1).toString();
	flipAudio.play();
};
document.getElementById('rightarrow').onclick = function() {
	currentPage += 2;
	let imgList = document.getElementById('images').childNodes;
	for (let k = 0; k < imgList.length; k++) {
		imgList[k].style.display = 'none';
	}
	document.getElementById('pagenum').innerHTML = currentPage.toString() + '-' + (currentPage + 1).toString();
	flipAudio.play();
};

// OTHER BUTTONS
function changeImagePos(elmnt, newPosX, newPosY) {
	let bookCode = inputBox.value;
	for (let i = 0; i < bookCode.length; i++) {
		if ((i == 0 || bookCode[i - 1] != '\\') && i != bookCode.length - 1
			&& bookCode[i] == '\\' && bookCode[i + 1] == 'x') {
			i += 2;
			if (parseInt(bookCode.substring(i, i + 2)) == parseInt(elmnt.id.substring(3))) {
				i += 2;
				if ((elmnt.offsetLeft < 160 && newPosX >= 0 && newPosX < 160) ||
					(elmnt.offsetLeft >= 160 && newPosX >= 160 && newPosX <= 319)) {
					elmnt.style.left = newPosX + 'px';
					bookCode = bookCode.substring(0, i) + (newPosX >= 160 ? newPosX - 160 : newPosX).toString().padStart(3, '0') + bookCode.substring(i + 3);
				}
				i += 3;
				if (newPosY >= 0 && newPosY <= 233) {
					elmnt.style.top = newPosY + 'px';
					bookCode = bookCode.substring(0, i) + newPosY.toString().padStart(3, '0') + bookCode.substring(i + 3);
				}
				break;
			}
		}
	}
	inputBox.value = bookCode;
}
function alignClickH(e) {
	if (e.target.id == 'alignH') return;
	document.querySelectorAll('*').forEach(function(node) {
		node.classList.remove('crosscursor');
		node.removeEventListener('click', alignClickH);
	});
	if (e.target.id.startsWith('img')) {
		if (e.target.offsetLeft < 160) {
			changeImagePos(e.target, 79 + 16 - e.target.naturalWidth / 2, e.target.offsetTop);
		} else {
			changeImagePos(e.target, 255 - e.target.naturalWidth / 2, e.target.offsetTop);
		}
	}
}
function alignClickV(e) {
	if (e.target.id == 'alignV') return;
	document.querySelectorAll('*').forEach(function(node) {
		node.classList.remove('crosscursor');
		node.removeEventListener('click', alignClickV);
	});
	if (e.target.id.startsWith('img')) {
		changeImagePos(e.target, e.target.offsetLeft, 116 - e.target.naturalHeight / 2);
	}
}
document.getElementById('alignH').onclick = function() {
	document.querySelectorAll('*').forEach(function(node) {
		node.classList.add('crosscursor');
		node.addEventListener('click', alignClickH);
	});
};
document.getElementById('alignV').onclick = function() {
	document.querySelectorAll('*').forEach(function(node) {
		node.classList.add('crosscursor');
		node.addEventListener('click', alignClickV);
	});
};

document.getElementById('jsonLoader').onclick = function() {
	let input = document.createElement('input');
	input.type = 'file';

	input.onchange = e => {
		var file = e.target.files[0]; 

		var reader = new FileReader();
		reader.readAsText(file,'UTF-8');

		reader.onload = readerEvent => {
			var jsonImgs = JSON.parse(readerEvent.target.result);
			for (let i = 0; i < jsonImgs.length; i++) {
				let newImg = document.createElement('img');
				newImg.id = 'img' + jsonImgs[i].id;
				newImg.src = 'data:image/png;base64,' + UrlDecodeBase64(jsonImgs[i].data);
				newImg.style.display = 'none';
				newImg.classList.add('movable');
				document.getElementById('images').appendChild(newImg);
			}
		}
	}

	input.click();
};
var saveData = (function () {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    return function (data, fileName) {
        var json = JSON.stringify(data),
            blob = new Blob([json], {type: "octet/stream"}),
            url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
		document.body.removeChild(a);
    };
}());
document.getElementById('jsonSaver').onclick = function() {
	let jsonImgs = [];
	let imgList = document.getElementById('images').childNodes;
	for (let k = 0; k < imgList.length; k++) {
		jsonImgs.push({id:parseInt(imgList[k].id.substring(3)),data:UrlEncodeBase64(imgList[k].src.replace('data:image/png;base64,', ''))});
	}
	saveData(jsonImgs, 'images.json');
};

// DRAG&DROP FEATURE
document.getElementById('book').addEventListener('dragover', (event) => {
	event.stopPropagation();
	event.preventDefault();
	event.dataTransfer.dropEffect = 'copy';
});
document.getElementById('book').addEventListener('drop', (event) => {
	event.stopPropagation();
	event.preventDefault();
	const fileList = event.dataTransfer.files;
	const reader = new FileReader();
	reader.addEventListener('load', (loadEvent) => {
		let newImg = document.createElement('img');
		newImg.id = 'img' + document.getElementById('images').childElementCount;
		newImg.src = loadEvent.target.result;
		
		// Divide by 2 to apply page zoom
		let xPos = Math.floor(Math.min(Math.max(event.pageX / 2, 0), 319));
		let yPos = Math.floor(Math.min(Math.max(event.pageY / 2, 0), 233));
		newImg.style.left = xPos.toString() + 'px';
		newImg.style.top = yPos.toString() + 'px';
		newImg.classList.add('movable');
		document.getElementById('images').appendChild(newImg);
		
		let imgPage = currentPage;
		if (xPos >= 160) imgPage++;
		
		let bookCode = inputBox.value;
		let bookCodePageOffset = 0;
		let offsetPageCheck = 0;
		for (let i = 0; offsetPageCheck < imgPage; i++) {
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
		while(offsetPageCheck < imgPage) {
			bookCode += '\n\\p';
			bookCodePageOffset = bookCode.length;
			offsetPageCheck++;
		}
		
		inputBox.value = bookCode.substring(0, bookCodePageOffset)
			+ '\\x' + newImg.id.substring(3).toString().padStart(2, '0')
			+ (xPos >= 160 ? xPos - 160 : xPos).toString().padStart(3, '0')
			+ yPos.toString().padStart(3, '0') + bookCode.substring(bookCodePageOffset, bookCode.length);
		makeDraggable(newImg);
	});
	reader.readAsDataURL(fileList[0]);
});
function makeDraggable(elmnt) {
	var startMousePosX = 0, startMousePosY = 0;
	elmnt.onmousedown = dragMouseDown;

	function dragMouseDown(e) {
		e.preventDefault();
		startMousePosX = e.clientX / 2 - elmnt.offsetLeft;
		startMousePosY = e.clientY / 2 - elmnt.offsetTop;
		document.onmouseup = closeDragElement;
		document.onmousemove = elementDrag;
	}

	function elementDrag(e) {
		e.preventDefault();
		let newPosX = Math.floor(e.clientX / 2 - startMousePosX);
		let newPosY = Math.floor(e.clientY / 2 - startMousePosY);
		changeImagePos(elmnt, newPosX, newPosY);
	}

	function closeDragElement() {
		// stop moving when mouse button is released
		document.onmouseup = null;
		document.onmousemove = null;
	}
}