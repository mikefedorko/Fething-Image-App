const API_KEY = '5837779-ac3ba737206b541ae294f1119'; // При регистрации для доступа к API, дается обязательный ключ
const refs = { // Удобное определения DOM-узлов через объект (не нудно глобально обьявлять querySelector-ы)
  page: document.querySelector('.page'),
  loadMoreBtn: document.querySelector('.load-more'),
  form: document.querySelector('.form'),
  queryInput: document.querySelector('.form .input'),
  grid: document.querySelector('.grid'),
  // displayOfBtn: document.querySelector(".js-display-block")
};
const request = { // Обьект со свойствами и методами для определённых манипуляций ниже в функциях
  page: 1, // Значение для подгрузки картинок в url парметр-значение page=${page}, добавляется туда динамически в зависимости от вызова методов resetPage() или incrementPage()
  query: '', // Это значение нашего инпута, которое автоматически появляется в fetchImages({ query: request.query, и после динамически меняется в url в зависимости от того что ввели в input-e
  resetPage() {
    this.page = 1;
  },
  incrementPage() {
    this.page += 1;
  },
};

refs.form.addEventListener('submit', handleFormSubmit); // Слушатель висящий на форме
refs.loadMoreBtn.addEventListener('click', handleLoadMoreBtnClick); // Слушатель висящий на кнопке

// =====================================================  Функции
 
function handleFormSubmit(e) { // функция слушателя висящего на форме 
  e.preventDefault(); // Метод чтобы не перезагружалась страница при отправке формы

  request.query = refs.queryInput.value; // значение ключа query в объекте request равно значению формы refs.form
  request.resetPage(); // Вызов метода, который говорит что страница в url равна 1

  refs.grid.innerHTML = ''; // изначально сетка в html пустая 
  handleFetch(); // вызывается ф-ция которая делает лоадер (потом его убирает после загрузки картинок), добавляет разметку грузит фотки с серва

  refs.form.reset(); // Очистка формы при Sibmit-e
  refs.loadMoreBtn.classList.add("js-display-block") // добавление кнопки после нажатия на Submit
}

function handleLoadMoreBtnClick() { // функция которая при нажатии кнопки подгружает на странице другие фотки 
  request.incrementPage(); // при каждом нажатии кнопки в поле url в fetchImages в page=${page}, будет добавляться опред кол-во картинокв
  // если значение ${page} увеличивать на 1, то появится другой список фото (такие параметры в API)
  
  // Соответственно этот  метод - incrementPage() увеличивает page, который предается fetchImages и деструктуризируется page: request.page,
  //  после чего меняться в url и догуржаются следующие фотки из списка
  

  handleFetch(); // загрузка всех элементов на странице 
}

function handleFetch() { // Ф-ция реализующая всю страницу (вешающая then из fetch и разметку)
  toggleLoader(); //Вызова ф-ции для показа лоадерра

  fetchImages({ query: request.query, page: request.page }).then(items => { // Чейнится then из промиса в ф-ции fetchImages для:
    toggleLoader(); // -- вызова ф-ции для убирания лоадерра при прогрузке картинок (это делает toggle)

    const markup = createGridItems(items); // задается перменная со значением ф-ции рисующей сетку для картинок которая получает аргументы в виде массива объектов картинок из предыдущего then в ф-ции fetchImages в fetch  
    refs.grid.insertAdjacentHTML('beforeend', markup); // добавляется в Дом-дерево через insertAdjacentHTML сетка
  });
}

function fetchImages({ query = '', page = 1 }) { // Ф-ция которая делает запрос на сервер 
  const url = `https://pixabay.com/api/?image_type=photo&q=${query}&key=${API_KEY}&per_page=9&page=${page}`; // путь Web API с опред. параметрами

  return fetch(url) // запрос GET на сервеер
    .then(response => {
      if (response.ok) return response.json(); // если запрос ОК, верни данные в формате json

      throw new Error(`Error while fetching: ${response.statusText}`); // если запрос не ОК, верни ошибку с её текстом
    })
    .then(data => {
      console.log(data);
      return data.hits; // Верни только массив объектов картинкок (с разными полями) с бэк-энда
    })
    .catch(error => {
      console.log('ERROR: ', error); // Если будет ошибка и ничего не ответит сервер, то .catch её покажет 
    });
}

function createGridItems(items) { // Соответственно если аргументом является массив картинок то:
  return items.reduce( // возвращает функц. методо массива обьъектов который пребирает картинки 
    (markup, item) => // markup - акк или пустая строка; item - каждый элемент массива 
      markup +
      `<div class="grid-item"><img src="${item.webformatURL}" alt=""></div>`, // возвращает пустая строка (markup) + разметка где путь это поле в массиве обьектов с картинков такого размера (item.webformatURL) ...там много полей разных
    '', // markup в виде пустой строки 
  );
}

function toggleLoader() { // Функция для показывания Лоадера  
  refs.page.classList.toggle('show-loader'); // если класса show-loader в тегe body нет, добавляет его, если есть - удаляет.  
}
