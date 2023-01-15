const MEDIA_WIKI_API_URL = 'https://en.wikipedia.org/w/api.php?origin=*';

const module = {};

function getUrl(searchParams) {
    const url = new URL(MEDIA_WIKI_API_URL);
    for (const [key, value] of Object.entries(searchParams)) {
        url.searchParams.append(key, value);
    }
    return url;
}

async function get(searchParams) {
    const url = getUrl(searchParams);

    let response;
    try {
        response = await fetch(url);
    } catch (e) {
        console.error(`Error while fetching data from ${url.href}: ${e.message}`);
        return null;
    }

    if (!response.ok) {
        console.error(`HTTP-Error while fetching data from ${url.href}: ${response.status}`);
        return null;
    }

    let data;
    try {
        data = await response.json();
    } catch (e) {
        console.error(`Error while parsing response from ${url.href}: ${e.message}`);
        return null;
    }

    return data;
}

module.searchWikiPagesByTitle = async function searchWikiPagesByTitle(title, limit = 10) {
    // https://www.mediawiki.org/wiki/API:Opensearch
    if (!title || !(limit > 0)) {
        return null;
    }

    const searchParams = {
        action: 'opensearch',
        search: title,
        limit,
        format: 'json',
    };

    return get(searchParams);
};

export default module;
