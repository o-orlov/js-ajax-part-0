import MediaWiki from '/mediaWiki.js';

const SEARCH_DELAY = 300;
const SEARCHES_KEY = 'searches';
const LAST_SEARCHES_COUNT = 3;

const searchEl = document.getElementById('search');
const suggestionListEl = document.getElementById('suggestions');
const lastSearchListEl = document.getElementById('last-searches');
const contentEl = document.getElementById('content');

let searchTimer;

function getSuggestions(searchResult) {
    if (!searchResult) {
        return [];
    }

    const titles = searchResult[1];
    const urls = searchResult[3];

    return titles.reduce((result, value, index) => {
        result.push([value, urls[index]]);
        return result;
    }, []);
}

function getSuggestionElements(suggestions) {
    const result = [];

    for (const [title, url] of suggestions) {
        const suggestionEl = document.createElement('li');
        suggestionEl.className = 'suggestion';

        const linkEl = document.createElement('a');
        linkEl.className = 'suggestion__link';
        linkEl.href = url;
        linkEl.append(title);
        linkEl.onclick = onSuggestionClicked;
        suggestionEl.append(linkEl);

        result.push(suggestionEl);
    }

    return result;
}

function onSuggestionClicked(event) {
    event.preventDefault();
    contentEl.src = this.href;
    storeSearch(this.innerHTML, this.href);
}

function storeSearch(title, url) {
    const searches = getStoredSearches() ?? [];
    searches.push([title, url]);

    try {
        localStorage.setItem(SEARCHES_KEY, JSON.stringify(searches));
    } catch (e) {
        console.error(`Error while saving searches to storage: ${e.message}`);
        return;
    }

    const lastSearches = searches.slice(-LAST_SEARCHES_COUNT);
    lastSearches.reverse();
    lastSearchListEl.innerHTML = '';
    lastSearchListEl.append(...getSuggestionElements(lastSearches));
}

function getStoredSearches() {
    const searches = localStorage.getItem(SEARCHES_KEY);
    try {
        return JSON.parse(searches);
    } catch (e) {
        console.error(`Error while parsing searches from storage: ${e.message}`);
    }
    return null;
}

function clearSuggestions() {
    suggestionListEl.innerHTML = '';
}

searchEl.oninput = () => {
    clearTimeout(searchTimer);

    if (!searchEl.value) {
        // Clear suggestions immediately
        clearSuggestions();
        return;
    }

    searchTimer = setTimeout(
        (title) => {
            MediaWiki.searchWikiPagesByTitle(title)
                .then((searchResult) => {
                    const suggestions = getSuggestions(searchResult);
                    clearSuggestions();
                    suggestionListEl.append(...getSuggestionElements(suggestions));
                })
                .catch((e) => console.log(e.message));
        },
        SEARCH_DELAY,
        searchEl.value
    );
};

window.onstorage = () => {
    const searches = getStoredSearches();
    if (!searches) {
        return;
    }

    const lastSearches = searches.slice(-LAST_SEARCHES_COUNT);
    lastSearches.reverse();
    lastSearchListEl.innerHTML = '';
    lastSearchListEl.append(...getSuggestionElements(lastSearches));
};
