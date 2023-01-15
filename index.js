import MediaWiki from '/mediaWiki.js';

const SEARCH_DELAY = 300;

const searchEl = document.getElementById('search');
const suggestionListEl = document.getElementById('suggestions');

function getSuggestions(searchResult) {
    if (!searchResult) {
        return [];
    }

    const titles = searchResult[1];
    const urls = searchResult[3];

    return titles.reduce((result, value, index) => {
        result[value] = urls[index];
        return result;
    }, {});
}

function getSuggestionElements(suggestions) {
    const result = [];

    for (const [title, url] of Object.entries(suggestions)) {
        const suggestionEl = document.createElement('li');
        suggestionEl.className = 'suggestion';

        const linkEl = document.createElement('a');
        linkEl.className = 'suggestion__link';
        linkEl.href = url;
        linkEl.append(title);
        suggestionEl.append(linkEl);

        result.push(suggestionEl);
    }

    return result;
}

function clearSuggestions() {
    suggestionListEl.innerHTML = '';
}

let searchTimer;

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
