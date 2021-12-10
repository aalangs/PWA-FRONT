//Categorie data
let categorieName = $('#categorieName');
let categorieEditName = $('#categorieEditName');
let rankingSelected = $('#ranking');
let rankingEditSelected = $('#modifyRanking');

//Components
let listCategories = $('#list-categories');
let newCategorie = $('#newCategorie');
newCategorie.hide();

//Buttons
let btnSaveCategorie = $('#btnSaveCategorie');
let btnEditCategorie = $('#btnEditCategorie');
let btnShowForm = $('#btnShowForm');
let btnCancel = $('#btnCancel');

let categorieSelected = {}
let allRankings = []

function loadCategories() {
    fetch('http://localhost:8080/pwa/categoria/getAll')
    .then(res => res.json())
    .then(categories => {
        categories.forEach(categorie => {
            let categorieItem = createCategorie(categorie)
            $('#li-categories').append(categorieItem);
        });
    })
    .catch(() => {
        Swal.fire({
            title: 'Error al mostrar las clasificaciones...',
            text: 'Favor de intentarlo más tarde',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        })
    });
}

function loadRankings() {
    fetch('http://localhost:8080/pwa/clasificacion/getAll')
    .then(res => res.json())
    .then(rankings => {
        allRankings = rankings
        rankings.forEach(rank => {
            $('#ranking').append(`<option value="${rank.idClasificacion}">${rank.clasificacion}</option>`);
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
loadRankings()

function createCategorie(categorie) {
    return $(`
        <li class="list-group-item d-flex justify-content-between align-items-start" id="item-categorie-${categorie.idCategoria}">
            <div class="ms-2 me-auto">
                <div class="fw-bold">${categorie.clasificacion.clasificacion}</div>
                ${categorie.categoria}
            </div>
            <div>
                <button class="btn bg-warning btn-sm" onclick="getCategorie(${categorie.idCategoria})" 
                data-bs-toggle="modal" data-bs-target="#modifyModal"><i class="bi bi-pencil-square"></i></button>
                <button button class="btn bg-danger btn-sm" onclick="deleteCategorie(${categorie.idCategoria})"><i class="bi bi-x-lg text-white"></i></button>
            </div>
        </li>
    `);
}

function getCategorie(categorie) {
    fetch('http://localhost:8080/pwa/categoria/getOne/'+categorie)
    .then(res => res.json())
    .then(categorie => {
        categorieSelected = categorie
        categorieEditName.val(categorie.categoria)
        $('#modifyRanking').empty()
        allRankings.forEach(rank => {
            if (rank.idClasificacion == categorie.clasificacion.idClasificacion) {
                $('#modifyRanking').append(`<option value="${rank.idClasificacion}" selected>${rank.clasificacion}</option>`);
            } else {
                $('#modifyRanking').append(`<option value="${rank.idClasificacion}">${rank.clasificacion}</option>`);
            }
        });
    })
    .catch(() => {
        Swal.fire({
            title: 'Error al obtener la categoría...',
            text: 'Favor de intentarlo más tarde',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        })
    });
}

function deleteCategorie(categorie) {
    Swal.fire({
        title: '¿Desea eliminar la categoría?',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        cancelButtonColor: '#d33',
    }).then((result) => {
        if (result.isConfirmed) {
            fetch('http://localhost:8080/pwa/categoria/delete/'+categorie, {
                method: "DELETE",
            })
            .then((res) => {
                res.json().then((data) => {
                    if (data) {
                        Swal.fire({
                            title: 'Categoría eliminada',
                            icon: 'success',
                            confirmButtonText: 'Aceptar'
                        }).then(() => {
                            $(`#item-categorie-${categorie}`).remove();
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

btnShowForm.on("click", function () {
    listCategories.fadeOut(()=>{
        newCategorie.show(1000);
    })
});

btnCancel.on("click", function () {
    newCategorie.fadeOut(()=>{
        listCategories.show(1000);
    })
});

btnSaveCategorie.on("click", function () {
    let newObject = { 
        'categoria': categorieName.val(),
        'clasificacion': {
            'idClasificacion': parseInt(rankingSelected.val(), 10)
        }
    }

    if (rankingSelected.val() >= 0) {
        fetch('http://localhost:8080/pwa/categoria/save', {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newObject),
        }).then((res) => {
            res.json().then((data) => {
                console.log(data);
                if (data.response) {
                    Swal.fire({
                        title: 'Categoría registrada',
                        icon: 'success',
                        confirmButtonText: 'Aceptar'
                    }).then(() => {
                        categorieName.val('')
                        $('#li-categories').empty()
                        loadCategories()
                        btnCancel.click()
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
            title: 'Error al seleccionar la clasificación...',
            icon: 'warning',
            confirmButtonText: 'Aceptar'
        })
    }
});

btnEditCategorie.on("click", function () {
    categorieSelected.categoria = categorieEditName.val()
    categorieSelected.clasificacion.idClasificacion = rankingEditSelected.val()
    if (rankingSelected.val() >= 0) {
        fetch('http://localhost:8080/pwa/categoria/save', {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(categorieSelected)
        }).then((res) => {
            res.json().then((data) => {
                console.log(data);
                if (data.response) {
                    Swal.fire({
                        title: 'Categoría modificada',
                        icon: 'success',
                        confirmButtonText: 'Aceptar'
                    }).then(() => {
                        categorieEditName.val('')
                        $('#li-categories').empty()
                        loadCategories()
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
            title: 'Error al seleccionar la clasificación...',
            icon: 'warning',
            confirmButtonText: 'Aceptar'
        })
    }
});