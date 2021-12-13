let url = window.location.href;
let swDirect = "/PWA-FRONT/sw.js"

if (navigator.serviceWorker) {
    console.log("Service Worker disponible")
    if (url.includes("localhost")) {
        swDirect = "/sw.js"
    }
    navigator.serviceWorker.register(swDirect)
} else {
    console.log("Service Worker NO disponible")
}

//Datos nota
let noteTxt = $("#note");
let categorie = $("#categorie");
let dateEnd = $("#dateEnd");
let imgNote = $('#imgNote');

//Modal
let noteEdit = $("#noteEdit");
let categorieEdit = $("#categorieEdit");
let dateEndEdit = $("#dateEndEdit");
let imgNoteEdit = $('#imgNoteEdit');
let showImage = $('#showImage');
let showImage64 = $('#showImage64');

let btnOpenEditPhoto = $('#btnOpenEditPhoto')
let btnTakeEditPhoto = $('#btnTakeEditPhoto')
let btnCancelEditPhoto = $('#btnCancelEditPhoto')
btnTakeEditPhoto.hide()
btnCancelEditPhoto.hide()

//Componentes
let divNotes = $('#divNotes')
let divNewNote = $('#divNewNote')
divNewNote.hide()

//Buttons
let btnSaveNote = $('#btnSaveNote');
let btnEditNote = $('#btnEditNote');
let btnOpenCamera = $('#btnOpenCamera')
let btnTakePhoto = $('#btnTakePhoto')
let btnCancelPhoto = $('#btnCancelPhoto')
let btnNewNote = $('#btnNewNote')
btnTakePhoto.hide()
btnCancelPhoto.hide()

//Crear camara
const camera = new Camera(imgNote[0]);
const cameraEdit = new Camera(imgNoteEdit[0]);

let blobImage = '/PWA-FRONT/images/noimage.png';
let blobImageEdit = '/PWA-FRONT/images/noimage.png';
let allCategories = [];
let noteSelected = {};

function loadNotes() {
    fetch('http://localhost:8080/pwa/nota/getAll')
    .then(res => res.json())
    .then(notes => {
        notes.forEach(note => {
            if (note.categoria == null) {
                note.categoria = {}
                note.categoria.categoria = 'Sin categoría';
            }

            if (note.image === '') {
                note.image = '/PWA-FRONT/images/noimage.png'
            }
            let noteItem = createNote(note)
            $('#list-notes').append(noteItem);
        });
        
    })
    .catch(() => {
        Swal.fire({
            title: 'Error al mostrar las notas...',
            text: 'Favor de intentarlo más tarde',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        })
    });
}

loadNotes()

function loadCategories() {
    fetch('http://localhost:8080/pwa/categoria/getAll')
    .then(res => res.json())
    .then(categories => {
        allCategories = categories;
        categories.forEach(categorie => {
            $('#categorie').append(`<option value="${categorie.idCategoria}">${categorie.categoria}</option>`);
        });
    })
    .catch(() => {
        Swal.fire({
            title: 'Error al mostrar las categorias...',
            text: 'Favor de intentarlo más tarde',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        })
    });
}

loadCategories()

function createNote(note) {
    let categoria = '';
    if (note.categoria != null) {
        categoria = note.categoria.categoria
    } else {
        categoria = 'Sin categoría';
    }
    return $(`
        <li class="list-group-item mb-2" aria-current="true" id="item-note-${note.idNota}">
            <div class="d-flex w-100 justify-content-between">
                <div>
                    <h5 class="mb-1">${categoria}</h5>
                    <small class="text-sm-start fw-bolder fst-italic">${note.fechaVencimiento}</small>
                    <br>
                    <small class="text-sm-start text-break">${note.nota}</small>
                </div>
                <img src="${note.image}" width="100" height="100" class="img-fluid"></img>
                <div>
                    <button type="button" class="btn bg-warning btn-sm" onclick="getNote(${note.idNota})" data-bs-toggle="modal" data-bs-target="#modifyModal">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button type="button" class="btn bg-danger btn-sm" onclick="deleteNote(${note.idNota})">
                        <i class="bi bi-x-lg text-white"></i>
                    </button>
                </div>
            </div>
        </li>
    `);
}

function getNote(note) {
    fetch('http://localhost:8080/pwa/nota/getOne/'+note)
    .then(res => res.json())
    .then(note => {
        noteSelected = note
        noteEdit.val(note.nota)
        dateEndEdit.val(note.fechaVencimiento)
        showImage64.attr("src", note.image);
        $('#categorieEdit').empty()
        if (note.categoria != null) {
            $('#categorieEdit').append(`<option value="0">Seleccionar opción...</option>`);
            allCategories.forEach(categorie => {
                if (categorie.idCategoria == note.categoria.idCategoria) {
                    $('#categorieEdit').append(`<option value="${categorie.idCategoria}" selected>${categorie.categoria}</option>`);
                } else {
                    $('#categorieEdit').append(`<option value="${categorie.idCategoria}">${categorie.categoria}</option>`);
                }
                
            });
        } else {
            $('#categorieEdit').append(`<option value="0" selected>Seleccionar opción...</option>`);
            allCategories.forEach(categorie => {
                $('#categorieEdit').append(`<option value="${categorie.idCategoria}">${categorie.categoria}</option>`);
                
            });
        }
    })
    .catch(() => {
        Swal.fire({
            title: 'Error al obtener la nota...',
            text: 'Favor de intentarlo más tarde',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        })
    });
}

function deleteNote(note) {
    Swal.fire({
        title: '¿Desea eliminar la nota?',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        cancelButtonColor: '#d33',
    }).then((result) => {
        if (result.isConfirmed) {
            fetch('http://localhost:8080/pwa/nota/delete/'+note, {
                method: "DELETE",
            })
            .then((res) => {
                res.json().then((data) => {
                    if (data) {
                        Swal.fire({
                            title: 'Nota eliminada',
                            icon: 'success',
                            confirmButtonText: 'Aceptar'
                        }).then(() => {
                            $(`#item-note-${note}`).remove();
                        })
                    } else {
                        Swal.fire({
                            title: 'Ocurrió un error...',
                            text: 'Favor de intentarlo más tarde',
                            icon: 'error',
                            confirmButtonText: 'Aceptar'
                        })
                    }
                })
            })
        }
    })
}

btnNewNote.on('click', () => {
    divNotes.fadeOut(() => {
        divNewNote.fadeIn()
    })
})

btnOpenCamera.on('click', () => {
    btnOpenCamera.fadeOut(() => {
        btnCancelPhoto.fadeIn()
        btnTakePhoto.fadeIn()
    })
    camera.on()
    .then( res => {
        if (!res) {
            alert('Error al iniciar la cámara');
        }
    })
})

btnCancelPhoto.on('click', () => {
    btnCancelPhoto.fadeOut(() => {
        btnTakePhoto.fadeOut()
        btnOpenCamera.fadeIn()
        camera.deletePhoto()
        camera.off()
    })
})

btnTakePhoto.on('click', () => {
    camera.off()
    blobImage = camera.take_photo();
})

function cancel() {
    btnCancelPhoto.click()
    divNewNote.fadeOut(() => {
        divNotes.fadeIn()
    })
}

btnOpenEditPhoto.on('click', () => {
    btnOpenEditPhoto.fadeOut(() => {
        btnCancelEditPhoto.fadeIn()
        btnTakeEditPhoto.fadeIn()
    })
    cameraEdit.on()
    .then( res => {
        if (!res) {
            alert('Error al iniciar la cámara');
        }
    })
})

btnCancelEditPhoto.on('click', () => {
    btnCancelEditPhoto.fadeOut(() => {
        btnTakeEditPhoto.fadeOut()
        btnOpenEditPhoto.fadeIn()
        cameraEdit.deletePhoto()
        cameraEdit.off()
    })
})

btnTakeEditPhoto.on('click', () => {
    cameraEdit.off()
    blobImageEdit = cameraEdit.take_photo();
})

function cancelEdit() {
    btnCancelEditPhoto.click()
    divNewNote.fadeOut(() => {
        divNotes.fadeIn()
    })
}

btnSaveNote.on("click", function () {
    let categorieTxt = $("#categorie option:selected").text()
    let newNote;
    let today = new Date();
    let dateToday = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    if (blobImageEdit != '/PWA-FRONT/images/noimage.png') {
        noteSelected.image = blobImageEdit
    }
    if (parseInt(categorie.val(), 10) != 0) {   
        newNote = { 
            'nota': noteTxt.val(),
            'image': blobImage,
            'fechaCreacion': dateToday,
            'fechaVencimiento': dateEnd.val(),
            'categoria': {
                'idCategoria': parseInt(categorie.val(), 10),
                'categoria': categorieTxt
            }
        }
    } else {
        newNote = { 
            'nota': noteTxt.val(),
            'image': blobImage,
            'fechaCreacion': dateToday,
            'fechaVencimiento': dateEnd.val(),
            'categoria': null
        }
    }
    
    fetch('http://localhost:8080/pwa/nota/save', {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNote),
    }).then((res) => {
        res.json().then((data) => {
            if (data) {
                Swal.fire({
                    title: 'Nota registrada',
                    icon: 'success',
                    confirmButtonText: 'Aceptar'
                }).then(() => {
                    noteTxt.val('')
                    dateEnd.val('')
                    categorie.val('0')
                    blobImage = '/PWA-FRONT/images/noimage.png'
                    data.result.idNota = 1
                    let noteItem = createNote(data.result)
                    $('#list-notes').append(noteItem);
                    btnCancelPhoto.click()
                    cancel()
                })
            } else {
                Swal.fire({
                    title: 'Ocurrió un error...',
                    text: 'Favor de intentarlo más tarde',
                    icon: 'error',
                    confirmButtonText: 'Aceptar'
                })
            }
        });
    });
});

btnEditNote.on("click", function () {
    if (parseInt(categorieEdit.val(), 10) != 0) {   
        if (noteSelected.categoria == null) {
            noteSelected.categoria = {}
            noteSelected.categoria.idCategoria = parseInt(categorieEdit.val(), 10)
        }
    } else {
        noteSelected.categoria = null
    }
    const date = new Date(dateEndEdit.val());
    date.setDate(date.getDate() + 1);
    noteSelected.nota = noteEdit.val()
    if (blobImageEdit != '/PWA-FRONT/images/noimage.png') {
        noteSelected.image = blobImageEdit
    }
    noteSelected.fechaVencimiento = date;
    

    fetch('http://localhost:8080/pwa/nota/save', {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteSelected),
    }).then((res) => {
        res.json().then((data) => {
            if (data) {
                Swal.fire({
                    title: 'Nota modificada',
                    icon: 'success',
                    confirmButtonText: 'Aceptar'
                }).then(() => {
                    noteEdit.val('')
                    dateEndEdit.val('')
                    blobImageEdit = '/PWA-FRONT/images/noimage.png'
                    btnCancelEditPhoto.click()
                    cancel()
                    $('#list-notes').empty()
                    loadNotes()
                })
            } else {
                Swal.fire({
                    title: 'Ocurrió un error...',
                    text: 'Favor de intentarlo más tarde',
                    icon: 'error',
                    confirmButtonText: 'Aceptar'
                })
            }
        });
    });
});
