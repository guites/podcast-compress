var isAdvancedUpload = function() {
    var div = document.createElement('div');
    return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
  }();

/**
 * SELETORES - elementos HTML
 */

var form = document.getElementsByClassName('box')[0];
var boxClick = document.getElementsByClassName('box__click')[0];
var filesList = document.getElementById('list-files');
var fileInput = document.getElementById('file');


/**
 * Funções utilizadas pelo DROP && INPUT
 */

function insertFilesToList(file){
    var li = document.createElement('LI');
    
    var upperDiv = document.createElement('DIV');
    var lowerDiv = document.createElement('DIV');

    upperDiv.innerHTML = "<span class='file-name'>" + file.name + "</span><span class='file-type'>" + formatType(file.type) + "</span></span class='file-size'>" + formatSize(file.size) + "</span>";
    upperDiv.classList.add('upper');

    lowerDiv.innerHTML = "<div class='progress-bar-fill'>Enviando: <span class='progress-bar-text'>0%</span></div><div class='progress-processando'><span>Processando: </span></div>";
    lowerDiv.classList.add('lower');
    
    li.appendChild(upperDiv);
    li.appendChild(lowerDiv);

    li.id = "file_" + (filesList.childElementCount); 

    filesList.appendChild(li);

    return li.id;
}


function filesHandler(e){
    droppedFiles = e.target.files ? e.target.files : e.dataTransfer.files;
    boxClick.innerText = 'Realizando a compressão...';
    for(var i = 0; i < droppedFiles.length; i++){
        var liId = insertFilesToList(droppedFiles[i]);
        if(verifyFile(droppedFiles[i])){
            uploadFile(droppedFiles[i],liId);
        }
        
    }
}

function formatSize(size){
    var truncRegex = /(\d*\.\d{2})/;
    var humanSize = parseInt(size) / 1000;
    var unit = 'kb';
    if(humanSize > 1000){
        humanSize = humanSize / 1000;
        unit = 'mb';
    }
    if(humanSize > 1000){
        humanSize = humanSize / 1000;
        unit = 'gb';
    }
    var formatted = String(humanSize).match(truncRegex);
    return  formatted ? formatted[1] + unit : size + unit;
}

function formatType(type){
    var returnType;
    switch (type){
        case 'audio/mpeg':
            returnType = 'Áudio';
            break;
        case 'text/plain':
            returnType = 'Arquivo de Texto';
            break;
        default:
            returnType = type;
    }
    return returnType;
}

function verifyFile(file){
    return true;
}

function formSubmitPreventDefault(e){
    e.preventDefault();
}

function uploadComplete(e){
    console.log(e);
}

function uploadFile(file,liId){
    console.log(file,liId);

    var LI = document.getElementById(liId);
    var xhr = new XMLHttpRequest();
    var formData = new FormData();

    var processandoDiv = document.createElement("DIV");
    LI.querySelector('.progress-processando').appendChild(processandoDiv);

    xhr.open("POST", "http://localhost:5000/api/v1/compress");
    xhr.responseType = "arraybuffer";
    xhr.upload.addEventListener("progress", function (e){
        var percent = e.lengthComputable ? (e.loaded / e.total) * 100 : 0;
        LI.querySelector('.progress-bar-fill').style.width = percent + '%';
        LI.querySelector('.progress-bar-text').textContent = percent + '%';
    });

    xhr.onload = function () {
        if(this.status == 200) {
            processandoDiv.className = 'done';
            var blob = new Blob([xhr.response], {type: "audio/mpeg"});
            var objectUrl = URL.createObjectURL(blob);
            var downloadButton = document.createElement("A");
            downloadButton.href = objectUrl;
            downloadButton.className = 'downloadButton';
            downloadButton.textContent = 'Download';
            LI.querySelector('.lower').appendChild(downloadButton);
        }
    }

    formData.append("audio",file);
    xhr.send(formData);
}

/**
 * Browsers que suportam o drag and drop.
 */

if (isAdvancedUpload) {
    form.classList.add('has-advanced-upload');
    let droppedFiles = false;
    const listeners = ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'];
    listeners.forEach(listener => {
        form.addEventListener(listener,(e) => {
            e.preventDefault();
            e.stopPropagation();
        })
    })
    function isDragover(){
        form.classList.add('is-dragover');
        boxClick.classList.add('is-dragover');
        boxClick.innerText = 'Solte os arquivos!';
    }
    function isntDragover(){
        form.classList.remove('is-dragover');
        boxClick.classList.add('is-dragover');
        boxClick.innerText = 'Escolha os arquivos';

    }
    form.addEventListener('dragover',isDragover);
    form.addEventListener('dragenter',isDragover);
    form.addEventListener('dragleave',isntDragover);
    form.addEventListener('dragend',isntDragover);
    form.addEventListener('drop',isntDragover);
    form.addEventListener('drop',filesHandler);
}

/**
 * FALLBACK - mesma funcionalidade no input
 */

fileInput.addEventListener('change', function (e) {
    filesHandler(e);
})

form.addEventListener("submit", formSubmitPreventDefault);