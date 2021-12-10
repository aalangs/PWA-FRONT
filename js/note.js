//Datos nota
let noteTxt = $("#note");
let categorie = $("#categorie");
let dateEnd = $("#dateEnd");
//Datos nota editar
let noteEdit = $("#noteEdit");
let categorieEdit = $("#categorieEdit");
let dateEndEdit = $("#dateEndEdit");

//Buttons
let btnSaveNote = $('#btnSaveNote');
let btnEditNote = $('#btnEditNote');

let allCategories = []
let noteSelected = {}

function loadNotes() {
    fetch('http://localhost:8080/pwa/nota/getAll')
    .then(res => res.json())
    .then(notes => {
        notes.forEach(note => {
            let noteItem = createNote(note)
            $('#list-notes').append(noteItem);
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
    return $(`
        <li class="list-group-item" aria-current="true" id="item-note-${note.idNota}">
            <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1">${note.categoria.categoria}</h5>
                <div>
                    <button type="button" class="btn bg-warning btn-sm" onclick="getNote(${note.idNota})" data-bs-toggle="modal" data-bs-target="#modifyModal">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button type="button" class="btn bg-danger btn-sm" onclick="deleteNote(${note.idNota})">
                        <i class="bi bi-x-lg text-white"></i>
                    </button>
                </div>
            </div>
            <small class="text-sm-start fw-bolder fst-italic">${note.fechaVencimiento}</small>
            <br>
            <small class="text-sm-start text-break">${note.nota}</small>
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
        $('#categorieEdit').empty()
        allCategories.forEach(categorie => {
            if (categorie.idCategoria == note.categoria.idCategoria) {
                $('#categorieEdit').append(`<option value="${categorie.idCategoria}" selected>${categorie.categoria}</option>`);
            } else {
                $('#categorieEdit').append(`<option value="${categorie.idCategoria}">${categorie.categoria}</option>`);
            }
        });
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

btnSaveNote.on("click", function () {
    let newNote = { 
        'nota': noteTxt.val(),
        'fechaCreacion': dateEnd.val(),
        'fechaVencimiento': dateEnd.val(),
        'categoria': {
            'idCategoria': parseInt(categorie.val(), 10)
        }
    }

    if (noteTxt.val() != '' && dateEnd.val() != '' && categorie.val() > 0) {
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
                        categorie.val('')
                        loadNotes()
                        window.location.href = "http://localhost:8081/";
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
    } else {
        Swal.fire({
            title: 'Favor de llenar todos los campos...',
            icon: 'warning',
            confirmButtonText: 'Aceptar'
        })
    }
});

btnEditNote.on("click", function () {
    noteSelected.nota = noteEdit.val()
    noteSelected.fechaVencimiento = dateEndEdit.val()
    noteSelected.categoria.idCategoria = parseInt(categorieEdit.val(), 10)

    if (noteEdit.val() != '' && dateEndEdit.val() != '' && categorieEdit.val() > 0) {
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
    } else {
        Swal.fire({
            title: 'Favor de llenar todos los campos...',
            icon: 'warning',
            confirmButtonText: 'Aceptar'
        })
    }
});
