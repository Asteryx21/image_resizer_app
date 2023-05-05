const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');


img.addEventListener('change',loadImage);
form.addEventListener('submit', sendImage);

//load image on app 
function loadImage(e){
    const file = e.target.files[0];

    if (!checkExtension(file)){
        alertError('Wrong file extension');
        return;
    }

    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = () => {
        widthInput.value = image.width;
        heightInput.value = image.height;
    };

    form.style.display = 'block';
    filename.innerHTML = file.name;
    outputPath.innerHTML = path.join(os.homedir(), 'OneDrive', 'Desktop', 'imageresizer');

}

//send img to main (backend) using ipcRenderer
function sendImage(e){
    e.preventDefault();
    const height = heightInput.value;
    const width = widthInput.value;
    const imgPath = img.files[0].path;

    if (!img.files[0]){
        alertError('Please select an image');
        return;
    }

    if (width==='' || height===''){
        alertError('Please fill height & width values')
        return;
    }

    ipcRenderer.send('image:resize',{
        imgPath,
        width,
        height,
    })
}

//get the response from main (backend)
ipcRenderer.on('done', ()=>{
    alertSuccess(`Image resized`);
})

function checkExtension(file){
    const acceptedTypes = ['image/gif','image/png','image/jpeg','image/jpg']
    return file && acceptedTypes.includes(file['type'])
}

function alertError(msg){
    Toastify.toast({
        text: msg,
        duration: 5000,
        close:false,
        style:{
            background: 'red',
            color: 'white',
            textAlign: 'center'
        }
    })
}

function alertSuccess(msg){
    Toastify.toast({
        text: msg,
        duration: 5000,
        close:false,
        style:{
            background: 'green',
            color: 'white',
            textAlign: 'center'
        }
    })
}