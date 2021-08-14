// Next function checks browser support WEBP format ********************************************************************************************************
function testWebP(callback) {
    let webP = new Image();
    webP.onload = webP.onerror = function () {
        callback(webP.height == 2);
    };
    webP.src =
        'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
}
testWebP(function (support) {
    if (support == true) {
        document.querySelector('body').classList.add('webp');
        console.log('use webp');
    } else {
        document.querySelector('body').classList.add('no-webp');
        console.log('not use webp');
    }
});



window.addEventListener('DOMContentLoaded', () => {
  function req() {
    const request = new XMLHttpRequest();
    request.open('GET', 'http://localhost:3000/people');
    request.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    request.send();
    request.addEventListener('load', function () {
      if (request.status == 200) {
        let data = JSON.parse(request.response);
        console.log(data);

        data.forEach(item => {
          let card = document.createElement('div');

          card.classList.add('card');

          let icon;
          if (item.sex === 'male') {
            if (document.querySelector('body').classList == 'webp') {
              icon = 'img/mars.webp';
            } else {
              icon = 'img/mars.png';
            }
          } else {
            if (document.querySelector('body').classList == 'webp') {
              icon = 'img/female.webp';
            } else {
              icon = 'img/female.png';
            }
          }

          card.innerHTML = `
                        <img src="${item.photo}" alt="${item.name}">
                        <div class="name">${item.name} ${item.surname}</div>
                        <div class="sex">
                            <img src=${icon} alt="${item.sex}">
                        </div>
                        <div class="age">${item.age}</div>
                    `;
          document.querySelector('.app').appendChild(card);
        });
      } else {
        console.error('Что-то пошло не так!');
      }
    });
    this.remove();
  }
  document.querySelector('button').addEventListener('click', req, { once: true });
});
