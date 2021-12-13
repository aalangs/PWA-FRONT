//Datos clasificación
let ranking = $("#ranking");
let rankingEdit = $("#ranking-edit");
//Components
let rankingList = $('ranking-list')
//Sections
let divRankings = $("#div-rankings");
//Botones
let btnSaveClasifiacion = $("#btnSaveClasifiacion");
let btnEditClasifiacion = $("#btnEditClasifiacion");
let btnCancel = $("#btnCancel");

btnEditClasifiacion.hide();
btnCancel.hide();

let li = '';

function loadRankings() {
    fetch('http://localhost:8080/pwa/clasificacion/getAll')
    .then(res => res.json())
    .then(rankings => {
        rankings.forEach(rank => {
            let rankingItem = createRanking(rank)
            $('#ranking-list').append(rankingItem);
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

loadRankings()

function createRanking(ranking) {
    return $(`
        <li class="list-group-item border border-dark d-flex justify-content-between align-items-center" id="item-rank-${ranking.idClasificacion}">
            <div>
                <h6 id="li-rank-${ranking.idClasificacion}">${ranking.clasificacion}</h6>
            </div>
            <div>
                <button class="btn bg-warning btn-sm" onclick="getRanking(${ranking.idClasificacion})"><i class="bi bi-pencil-square"></i></button>
                <button button class="btn bg-danger btn-sm" onclick="deleteRanking(${ranking.idClasificacion})"><i class="bi bi-x-lg text-white"></i></button>
            </div>
        </li>
    `);
}

function getRanking(rank) {
    li = $(`#li-rank-${rank}`);
    $("#liRanking").addClass("active");
    fetch('http://localhost:8080/pwa/clasificacion/getOne/'+rank)
    .then(res => res.json())
    .then(getRank => {
        ranking.val(getRank.clasificacion)
        rankingEdit.val(getRank.idClasificacion)
        btnSaveClasifiacion.fadeOut(() => {
            btnEditClasifiacion.fadeIn();
            btnCancel.fadeIn();
        })
    })
    .catch(() => {
        Swal.fire({
            title: 'Error al obtener la clasificación...',
            text: 'Favor de intentarlo más tarde',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        })
    });
}

function deleteRanking(i) {
    Swal.fire({
        title: '¿Desea eliminar la clasificación?',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        cancelButtonColor: '#d33',
    }).then((result) => {
        if (result.isConfirmed) {
            fetch('http://localhost:8080/pwa/clasificacion/delete/'+i, {
                method: "DELETE",
            })
            .then((res) => {
                res.json().then((data) => {
                    if (data) {
                        Swal.fire({
                            title: 'Clasficación eliminada',
                            icon: 'success',
                            confirmButtonText: 'Aceptar'
                        }).then(() => {
                            $(`#item-rank-${i}`).remove();
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

btnSaveClasifiacion.on("click", function () {
    if (ranking.val() != '') {
        fetch('http://localhost:8080/pwa/clasificacion/save', {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                'clasificacion': ranking.val() 
            }),
        }).then((res) => {
            res.json().then((data) => {
                if (data.response) {
                    Swal.fire({
                        title: 'Clasficación registrada',
                        icon: 'success',
                        confirmButtonText: 'Aceptar'
                    }).then(() => {
                        ranking.val('')
                        let rankingItem = createRanking(data.clasificacion)
                        $('#ranking-list').append(rankingItem);
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
            title: 'Favor de llenar el campo de texto',
            icon: 'warning',
            confirmButtonText: 'Aceptar'
        })
    }
})

btnEditClasifiacion.on("click", function () {
    if (ranking.val() != '') {
        fetch('http://localhost:8080/pwa/clasificacion/save', {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                'idClasificacion': rankingEdit.val(), 
                'clasificacion': ranking.val()
            }),
        }).then((res) => {
            res.json().then((data) => {
                if (data.response) {
                    Swal.fire({
                        title: 'Clasficación modificada',
                        icon: 'success',
                        confirmButtonText: 'Aceptar'
                    }).then(() => {
                        li.text(ranking.val())
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
    } else {
        Swal.fire(
            'Favor de llenar el campo de texto',
            '',
            'warning'
          )
    }
})

function cancel() {
    $("#liRanking").removeClass("active");
    ranking.val('')
    btnEditClasifiacion.fadeOut(() => {
        btnCancel.fadeOut();
        btnSaveClasifiacion.fadeIn();
    })
}