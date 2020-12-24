var isAdvancedUpload = function() {
    var div = document.createElement('div');
    return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
  }();

/**
 * SELETORES - elementos HTML
 */

var form = document.getElementsByClassName('box')[0];
var boxClick = document.getElementsByClassName('box__click')[0];
// var filesList = document.getElementById('list-files');
var filesList = document.getElementsByClassName('buttons')[0];
var fileInput = document.getElementById('file');


/**
 * Funções utilizadas pelo DROP && INPUT
 */

function insertFilesToList(file){
    console.log(file);
    var wrapper = document.createElement('DIV');
    wrapper.className = 'wrapper';

    wrapper.innerHTML = `
    <div class="button">
        <img class="loading innactive" src="assets/loader.png" alt="Carregando...">
        <div class="progress-bar">0%</div>
        Enviando...
        <img src="assets/button11.png" alt="Ícone">
    </div>
    <div class="content">
        <p class="title">${file.name}</p>
        <p class="duration">Duração: - </p>
        <div class="results">
            <p class="before">${formatSize(file.size)}</p>
            <img src="assets/right-arrow.png" alt="De para" class="arrow">
            <p class="after">...</p>
        </div>
        <a href="" class="download loading" role="button" title="Aguarde o download ficar pronto">Aguarde<img src="assets/loader.png" alt="Botão de aguarde, download ainda não está pronto"></a>
    </div>
    `;

    wrapper.id = "file_" + (filesList.childElementCount); 

    filesList.appendChild(wrapper);

    return wrapper.id;
}


function filesHandler(e){
    droppedFiles = e.target.files ? e.target.files : e.dataTransfer.files;

    //verifica se já foi subido o limite de arquivos

    var currFiles = document.querySelector('.buttons').childElementCount;
    var maxFiles = 6;
    var allowedRuns = maxFiles - currFiles;
    if(droppedFiles.length < allowedRuns){
        allowedRuns = droppedFiles.length;
    }

    if(currFiles >= maxFiles){
        document.querySelector('.box__input').classList.add('limit');
    } else {
        for(var i = 0; i < allowedRuns; i++){
            if (i > 5) return;
            var wrapperId = insertFilesToList(droppedFiles[i]);
            if(verifyFile(droppedFiles[i])){
                uploadFile(droppedFiles[i],wrapperId);
            }
            
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

function uploadFile(file,wrapperId){
    console.log(file,wrapperId);

    var wrapper = document.getElementById(wrapperId);
    var xhr = new XMLHttpRequest();
    var formData = new FormData();


    var loadingBar = wrapper.querySelector('.button > .progress-bar');
    var downloadButton = wrapper.querySelector('a.download');
    var finalSize = wrapper.querySelector('p.after');
    var image = wrapper.querySelector('.button > img');
    xhr.open("POST", "https://compress-audio.herokuapp.com/api/v1/compress");
   // xhr.open("POST", "http://localhost:5000/api/v1/compress");
    xhr.responseType = "arraybuffer";
    xhr.upload.addEventListener("progress", function (e){
        var percent = e.lengthComputable ? (e.loaded / e.total) * 100 : 0;
        wrapper.querySelector('.progress-bar').style.width = percent + '%';
        wrapper.querySelector('.progress-bar').textContent = percent.toFixed(2) + '%';
        if(e.loaded == e.total){

            loadingBar.classList.add('done');
            loadingBar.nextSibling.textContent = 'Processando...';
            image.className = 'loading';

        }
    });

    let fileName;
    xhr.onreadystatechange = function(){
        if(this.readyState == this.HEADERS_RECEIVED){
            const contentDisposition = xhr.getResponseHeader("Content-Disposition");
            const reg = /filename=\"(.*)\"/;
            fileName = contentDisposition.match(reg)[1];
        }
    }
    

    xhr.onload = function () {
        console.log();
        if(this.status == 200) {
            // console.log(xhr.response);
            // verificar o erro que o arquivo retorna com ~7kb
            
            var blob = new Blob([xhr.response]);
            var objectUrl = URL.createObjectURL(blob);
            //imagem à esquerda
            image.className = "complete";
            image.src = "assets/complete.png";
            loadingBar.nextSibling.textContent = 'Concluído!';

            //tamanho pós compressão
            finalSize.innerText = formatSize(blob.size);

            downloadButton.href = objectUrl;
            downloadButton.download = fileName;
            downloadButton.target = "_blank"; 
            downloadButton.title = "Clique para baixar";
            downloadButton.className = 'download';
            downloadButton.childNodes[0].textContent = 'Download';
            downloadButton.childNodes[1].src = "assets/reduce1.png";

        } else if(this.status == 415) {
            console.log('unsupported media type');
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
