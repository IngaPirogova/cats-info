import Notiflix from "notiflix";
import SlimSelect from "slim-select";
import 'slim-select/dist/slimselect.css';

const BASE_URL = 'https://api.thecatapi.com/v1/';
const catInfo = document.querySelector('.cat-info')
const breedSelect = document.querySelector('.breed-select')
const loader = document.querySelector('.loader');
const errorMsg = document.querySelector('.error');

const headers = new Headers({
    "Content-Type": "application/json",
    "x-api-key": 'live_fNgAOu4qBR18Dn7Bp0Ukw7MuIC3xR6zUr3nPlZFIs0mkS8n9MMVrxRhFmGAehltw',
});

let slimSelect;

const requestOptions = {
    method: 'GET',
    headers: headers,
    redirect: 'follow'
};

// Показ/скрытие
function showLoaderWhileFetchingBreeds() {
    loader.classList.remove('hidden');
    errorMsg.classList.add('hidden'); // Скрываем ошибку при новом запросе
    catInfo.classList.add('hidden');
    breedSelect.classList.add('hidden');
}

function showLoaderWhileFetchingCat() {
    loader.classList.remove('hidden');
    errorMsg.classList.add('hidden'); // Скрываем ошибку при новом запросе
    catInfo.classList.add('hidden');
    breedSelect.classList.remove('hidden');
}

function showError() {
    loader.classList.add('hidden');
    // errorMsg.classList.remove('hidden'); // Показываем ошибку
    catInfo.classList.add('hidden');
    breedSelect.classList.remove('hidden');

    Notiflix.Notify.failure('Oops! Something went wrong! Try reloading the page!');
}

function showSelect() {
    loader.classList.add('hidden');
    errorMsg.classList.add('hidden');
    breedSelect.classList.remove('hidden');
}

function showCatInfo() {
    loader.classList.add('hidden');
    errorMsg.classList.add('hidden');
    catInfo.classList.remove('hidden');
    breedSelect.classList.remove('hidden');
}


// Получаем список пород
function fetchBreeds() {
    showLoaderWhileFetchingBreeds();
    fetch(`${BASE_URL}breeds`, requestOptions)
        .then(res => {
            if (!res.ok) throw new Error('Failed to fetch breeds');
            return res.json();
        })
        .then(data => {
            const options = data.map(breed =>
                `<option value="${breed.id}">${breed.name}</option>`
            ).join('');
            breedSelect.innerHTML += options;

            // Уничтожим предыдущий экземпляр (если есть)
            if (slimSelect) {
                slimSelect.destroy();
            }

            // Инициализируем SlimSelect
            slimSelect = new SlimSelect({
                select: '.breed-select',
                placeholder: 'Выберите породу кошки',
                allowDeselect: true, 
                showSearch: true,
                searchPlaceholder: 'Поиск породы...',
            });
            showSelect();
        })
        .catch(() => {
            showError();
        });
}

function fetchCatByBreed(breedId) {
    showLoaderWhileFetchingCat();
    fetch(`${BASE_URL}images/search?breed_ids=${breedId}&include_breeds=true`, requestOptions)
        .then(res => {
            if (!res.ok) throw new Error('Failed to fetch cat');
            return res.json();
        })
        .then(data => {
            if (!data.length) throw new Error('No cat found');
            const item = data[0];
            const breed = item.breeds[0];

            const html = `
            <div class="cat-info__img">
        <img src="${item.url}" alt="${breed.name}">
         </div>
          <div class="cat-info__descr">
        <h2>${breed.name}</h2>
        <p>${breed.description}</p>
        <p><strong>Temperament:</strong> ${breed.temperament}</p>
         </div>
      `;
            catInfo.innerHTML = html;
            showCatInfo();
        })
        .catch(() => {
            showError();
        });
}

breedSelect.addEventListener('change', (event) => {
    const selectedBreedId = event.target.value;
    if (selectedBreedId) {
        fetchCatByBreed(selectedBreedId);
    } else {
        catInfo.innerHTML = '';
        catInfo.classList.add('hidden');
    }
});

fetchBreeds();