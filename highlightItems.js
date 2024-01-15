// ==UserScript==
// @name         Amazon Vine Recommendation Tracking
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Track seen recommendations on Amazon Vine page
// @match        https://www.amazon.de/vine/vine-items*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    const SEEN_RECOMMENDATIONS_KEY = 'seen_recommendations';
    const MAX_ITEMS = 200000;

    const trimOldEntries = (obj) => {
        const keys = Object.keys(obj);
        if (keys.length > MAX_ITEMS) {
            keys.sort((a, b) => obj[a] - obj[b]); 
            for (let i = 0; i < keys.length - MAX_ITEMS; i++) {
                delete obj[keys[i]];
            }
        }
    };

    const applyNotSeenRecommendationsStyle = (items) => {
        const seenRecommendations = GM_getValue(SEEN_RECOMMENDATIONS_KEY, {});
        let notSeenItems = [];

        items.forEach(item => {
            const recommendationId = item.getAttribute('data-recommendation-id');
            if (!seenRecommendations[recommendationId]) {
                notSeenItems.push(recommendationId);
            }
        });

        const selectors = notSeenItems.map(id => `div.vvp-item-tile[data-recommendation-id*="${id}"]`).join(',');
        const css = `${selectors} { background-color: var(--cutoff-background-color, #D1D1D1); }`;
        GM_addStyle(css);
    };

    const addItemsToSeenRecommendations = (items) => {
        const seenRecommendations = GM_getValue(SEEN_RECOMMENDATIONS_KEY, {});
        items.forEach(item => {
            const recommendationId = item.getAttribute('data-recommendation-id');
            seenRecommendations[recommendationId] = Date.now(); 
        });
        trimOldEntries(seenRecommendations); 
        GM_setValue(SEEN_RECOMMENDATIONS_KEY, seenRecommendations);
    };
  
    const firstPageItems = document.querySelectorAll('#vvp-items-grid .vvp-item-tile');
    applyNotSeenRecommendationsStyle(firstPageItems);
    addItemsToSeenRecommendations(firstPageItems);

})();