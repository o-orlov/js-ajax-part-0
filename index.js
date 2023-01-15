import MediaWiki from '/mediaWiki.js';

const response = await MediaWiki.searchWikiPagesByTitle('javascript');
console.log(response);
