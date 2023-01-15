import MediaWiki from '/mediaWiki.js';

const SEARCH_DELAY = 300;
const SEARCHES_KEY = 'searches';
const LOCAL_SUGGESTIONS_COUNT = 5;
const TOTAL_SUGGESTIONS_COUNT = 10;
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

    const searchString = searchResult[0];
    const titles = searchResult[1];
    const urls = searchResult[3];

    return titles.reduce((result, title, index) => {
        result.push([searchString, title, urls[index]]);
        return result;
    }, []);
}

function getSuggestionElements(suggestions, local = false) {
    const result = [];

    for (const [searchString, title, url] of suggestions) {
        const suggestionEl = document.createElement('li');
        suggestionEl.className = 'suggestion';

        const linkEl = document.createElement('a');
        linkEl.className = 'suggestion__link';
        linkEl.className += local ? ' suggestion__link_local' : ' suggestion__link_remote';
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
    storeSearch(searchEl.value, this.innerHTML, this.href);
}

function storeSearch(searchString, title, url) {
    const searches = getStoredSearches() || [];
    searches.push([searchString, title, url]);

    try {
        localStorage.setItem(SEARCHES_KEY, JSON.stringify(searches));
    } catch (e) {
        console.error(`Error while saving searches to storage: ${e.message}`);
        return;
    }

    showLastSearches(searches);
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

function searchInStorage(searchString, limit = LOCAL_SUGGESTIONS_COUNT) {
    const searches = getStoredSearches();
    if (!searches) {
        return null;
    }

    const result = searches.filter(([searchString_, title, url]) => searchString_ === searchString);
    if (!result) {
        return null;
    }

    return result.slice(-limit);
}

function showLastSearches(searches = null) {
    searches = searches || getStoredSearches();
    if (!searches) {
        return;
    }

    const lastSearches = searches.slice(-LAST_SEARCHES_COUNT);
    lastSearches.reverse();
    lastSearchListEl.innerHTML = '';
    lastSearchListEl.append(...getSuggestionElements(lastSearches));
}

function clearSuggestions() {
    suggestionListEl.innerHTML = '';
}

showLastSearches();

searchEl.oninput = () => {
    clearTimeout(searchTimer);

    if (!searchEl.value) {
        // Clear suggestions immediately
        clearSuggestions();
        return;
    }

    searchTimer = setTimeout(
        (searchString) => {
            const localSuggestions = searchInStorage(searchString, LOCAL_SUGGESTIONS_COUNT) || [];
            const limit = TOTAL_SUGGESTIONS_COUNT - localSuggestions.length;

            MediaWiki.searchWikiPagesByTitle(searchString, limit)
                .then((searchResult) => {
                    const remoteSuggestions = getSuggestions(searchResult);
                    clearSuggestions();
                    suggestionListEl.append(...getSuggestionElements(localSuggestions, true));
                    suggestionListEl.append(...getSuggestionElements(remoteSuggestions));
                })
                .catch((e) => console.log(e.message));
        },
        SEARCH_DELAY,
        searchEl.value
    );
};

window.onstorage = () => showLastSearches();
