import MediaWiki from '/mediaWiki.js';

const USER_INPUT_DELAY = 500;

const searchEl = document.getElementById('search');

let searchTimer;

searchEl.oninput = () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(
        (title) => {
            MediaWiki.searchWikiPagesByTitle(title)
                .then((result) => console.log(result))
                .catch((e) => console.log(e.message));
        },
        USER_INPUT_DELAY,
        searchEl.value
    );
};
