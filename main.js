const app = document.getElementById("app");

// Функция для создания элементов (теги и классы)
function createElementsApp(elementTag, ...elementClass) {
  const element = document.createElement(elementTag);
  if (elementClass) {
    element.classList.add(...elementClass);
  }
  return element;
}

// Создаем функцию дебаунц
const debounce = (fn, debounceTime) => {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, debounceTime);
  };
};

// Создаем приложение
function application() {
  const titleApp = createElementsApp("h1", "title-app");
  titleApp.textContent = "Поиск репозиториев.";

  const searchLine = createElementsApp("div", "search-line");
  const searchInput = createElementsApp("input", "search-input");
  searchInput.setAttribute("placeholder", "Введите название репозитория");

  const searchCounter = createElementsApp("span", "counter");

  // Здесь создаем функцию, которую мы будем дебаунсировать
  const debouncedFetchRepos = debounce(async () => {
    const repos = await fetchRepos(searchInput.value);
    updateRepositoryList(repos);

    repositoryList.style.display = "block";
  }, 1000);

  searchInput.addEventListener("input", debouncedFetchRepos);

  const main = createElementsApp("div", "main");
  const repositoryWrapper = createElementsApp("div", "repos-wrapper");
  const repositoryList = createElementsApp("ul", "list-repos", "list-reset");
  const repositoryCildrenList = createElementsApp(
    "ul",
    "list-children",
    "list-repos",
    "list-reset"
  );

  repositoryWrapper.append(repositoryList, repositoryCildrenList);
  searchLine.append(searchInput, searchCounter);
  main.append(repositoryWrapper);
  app.append(titleApp, searchLine, main);
}

let storage = [];

async function fetchRepos(repoName) {
  try {
    const response = await fetch(
      `https://api.github.com/search/repositories?q=${repoName}&per_page=5`
    );

    // Проверка, успешен ли ответ
    if (!response.ok) {
      throw new Error(`Ошибка по сети: ${response.status}`);
    }
    // Ждём, пока данные будут получены
    const data = await response.json();
    // Добавляем массив репозиториев в переменную для хранения и дальнейшей работы
    storage = data.items;

    return data.items;
  } catch (error) {
    console.error("Ошибка:", error);
    return [];
  }
}

function updateRepositoryList(repos) {
  const repositoryList = document.querySelector(".list-repos");
  // Очищаем список перед добавлением новых элементов
  repositoryList.innerHTML = "";
  repos.forEach((repo) => {
    const itemRepository = createElementsApp("li", "search-item");
    const linkRepository = createElementsApp("a", "search-link");
    // Добавляем название репозитория
    linkRepository.textContent = repo.name;

    linkRepository.addEventListener("click", () => {
      updateChildrenRepositoryList(repo);
      const searchInput = document.querySelector(".search-input");
      searchInput.value = "";
      if (repositoryList) {
        repositoryList.style.display = "none";
      }
    });
    itemRepository.append(linkRepository);
    repositoryList.append(itemRepository);
  });
}

function updateChildrenRepositoryList(repo) {
  const repositoryCildrenList = document.querySelector(".list-children");

  const itemChildrenRepository = createElementsApp("li", "children-repos");
  const wrapperChildrenRepository = createElementsApp(
    "div",
    "wrapper-children"
  );

  const nameChildrenRepository = createElementsApp(
    "span",
    "name-repos",
    "child-field"
  );
  nameChildrenRepository.innerHTML = `Name: ${repo.name}`;

  const ownerChildrenRepository = createElementsApp(
    "span",
    "owner-repos",
    "child-field"
  );
  ownerChildrenRepository.innerHTML = `Owner: ${repo.owner.login}`;

  const starChildrenRepository = createElementsApp(
    "span",
    "star-repos",
    "child-field"
  );
  starChildrenRepository.innerHTML = `Star: ${repo.stargazers_count}`;

  const closeBtn = createElementsApp("button", "btn", "btn-reset");
  closeBtn.textContent = "+";

  closeBtn.addEventListener("click", () => {
    itemChildrenRepository.remove();
  });

  wrapperChildrenRepository.append(
    nameChildrenRepository,
    ownerChildrenRepository,
    starChildrenRepository
  );

  itemChildrenRepository.append(wrapperChildrenRepository, closeBtn);
  repositoryCildrenList.append(itemChildrenRepository);
}

application();
