let pathSw = '/20213-PWA-EF/sw.js';
let url = window.location.href;

if (navigator.serviceWorker) {
    if (url.includes('localhost')) {
        pathSw = '/sw.js';
    }
    navigator.serviceWorker.register(pathSw);
}

//datos noticia 
let idNoticeInput = $('idNotice');
let titleNotice = $('#titleNotice');
let initialNotice = $('#initialNotice');
let bannerNotice = $('#bannerNotice');
let dateNotice = $('#dateNotice');
let hashtagNotice = $('#hashTagNotice');
let descriptionNotice = $('#descriptionNotice');
let comentarios = $('#comentarios');
//Botones
let btnVerMas = $("#btnVerMas");
//Secciones
let principal = $('#principal');
let notice = $('#notice');
let page = 0;
let totalPages = 0;

btnVerMas.on('click', function () {
    if (page < totalPages-1) {
        page++;
        loadNotices(page);
    } else {
        alert('Ya no hay mas noticias')
    }
})

$('#notices').on('click', '.btn-seguir', function (e) {
    e.preventDefault();

    let idNotice = $(this).data('id-notice');
    console.log(idNotice)

    fetch(`http://187.188.90.171:8084/api/notice/${idNotice}`)
        .then(res => res.json())
        .then((resJson) => {
            assignNotice(resJson.result);
            principal.fadeOut(function () {
                notice.fadeIn(1000);
            });
        }).catch(Err => {
            alert("Ocurrió un error..")
        })
});

$('.btn-regresar').on('click', function () {
    console.log('Regresar');
    notice.fadeOut(function () {
        principal.fadeIn(1000);
    });
});

function assignNotice(notice) {
    idNoticeInput.val(notice.id);
    titleNotice.html(notice.title);
    initialNotice.html(notice.initialDescription);
    bannerNotice.attr('src', 'data:image/png;base64,'+notice.attachedNotice.file)
    let date = new Date(notice.datePublic);
    dateNotice.html(date.toLocaleDateString('en-US'));
    hashtagNotice.html(notice.hashTag)
    descriptionNotice.html(notice.description);
    comentarios.html('');
    notice.comments.forEach(comment => {
        comentarios.append(createComment(comment))
    });
}

function createComment(comment) {
    return(`
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">${comment.postPerson}</h5>
                <p class="card-text">${comment.content}</p>
            </div>
        </div>
    `);
}

function loadNotices(page) {

    fetch(`http://187.188.90.171:8084/api/notice/page/${page}`)
        .then(res => res.json())
        .then(resp => {
            totalPages = resp.totalPages;
            resp.content.forEach(notice => {
                let noticeHtml = createNotice(notice)
                $('#notices').append(noticeHtml);
            });
        })
        .catch((err) => {
            alert('Se presento un error cargar las noticias')
        });
}

function createNotice(notice) {
    return $(`
        <div class="col-12 pt-2 pb-2 border-bottom border-success">
            <img src="data:image/jpeg;base64,${notice.attachedNotice.file}" class="img-fluid" alt="">
            <h4>${notice.title}</h4>
            <div class="row">
                <div class="col-6 text-muted text-center">
                    ${notice.datePublic}
                </div>
                <div class="col-6 text-info text-center font-italic ">
                    ${notice.hashTag}
                </div>
            </div>
            <div class="font-italic text-justify">
                ${notice.initialDescription}
            </div>
            <a href="" class="float-right btn btn-sm btn-info btn-seguir" data-id-notice="${notice.id}"  >Seguir leyendo...</a>
        </div>
    `);
}

loadNotices(0);