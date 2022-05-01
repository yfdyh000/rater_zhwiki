import API, { makeErrorMsg } from "./api";
import { isAfterDate } from "./util";
import * as cache from "./cache";
// <nowiki>

var cacheBanners = function(banners) {
	cache.write("banners", banners, 2, 60);
};

// The code snippet from https://zh.wikipedia.org/wiki/User:Chiefwei/rater/rater.js
var raterData = {};
var dataurl = "";
function getRaterData(kind) {
	if (kind === "default") {
		dataurl = mw.config.get("wgScript") + "?action=raw&ctype=application/json&maxage=86400&title=User:Chiefwei/rater/" + kind + ".js";
	} else {
		dataurl = mw.config.get("wgScript") + "?action=raw&ctype=application/json&maxage=86400&title=User:Sz-iwbot/rater/" + kind + ".json";
	}
	if (raterData[kind] === void(null)) {
		try {
			$.ajax({
				"url": dataurl,
				"dataType": "json",
				"async": false,
				"success": function (data) {
					raterData[kind] = data;
				},
				"error": function (xhr, message) {
					mw.log.error(new Error(message));
				}
			});
		}  catch (e) {
			alert("获取评级工具“" + kind + "”数据错误：" + e.message + "。评级工具可能无法正常工作。");
			raterData[kind] = null;
		}
	}
	return raterData[kind];
}

/**
 * Gets banners/options from the Api
 * 
 * @returns {Promise} Resolved with: banners object, bannerOptions array
 */
var getListOfBannersFromApi = function() {

	var finishedPromise = $.Deferred();

	var querySkeleton = {
		action: "query",
		format: "json",
		list: "categorymembers",
		cmprop: "title",
		cmnamespace: "10",
		cmlimit: "500"
	};

	var categories = [ // i18n configure
		{
			title: "Category:含质量评级的专题横幅",
			abbreviation: "withRatings",
			banners: [],
			processed: $.Deferred()
		},
		{
			title: "Category:不含质量评级的专题横幅",
			abbreviation: "withoutRatings",
			banners: [],
			processed: $.Deferred()
		}/*,
		{
			title: "Category:WikiProject banner wrapper templates", // TODO: missing and review is needed
			abbreviation: "wrappers",
			banners: [],
			processed: $.Deferred()
		},
		{
			title: "Category:WikiProject banner templates not based on WPBannerMeta", // TODO: same as above
			abbreviation: "notWPBM",
			banners: [],
			processed: $.Deferred()
		},
		{
			title: "Category:Inactive WikiProject banners", // TODO: same as above
			abbreviation: "inactive",
			banners: [],
			processed: $.Deferred()
		}*/
	];

	var processQuery = function(result, catIndex) {
		if ( !result.query || !result.query.categorymembers ) {
			// No results
			// TODO: error or warning ********
			finishedPromise.reject();
			return;
		}
		
		// Gather titles into array - excluding "Template:" prefix
		var resultTitles = result.query.categorymembers.map(function(info) {
			return info.title.slice(9);
		});
		Array.prototype.push.apply(categories[catIndex].banners, resultTitles);
		
		// Continue query if needed
		if ( result.continue ) {
			doApiQuery($.extend(categories[catIndex].query, result.continue), catIndex);
			return;
		}
		
		categories[catIndex].processed.resolve();
	};

	var doApiQuery = function(q, catIndex) {
		API.get( q )
			.done( function(result) {
				processQuery(result, catIndex);
			} )
			.fail( function(code, jqxhr) {
				console.warn("[Rater] " + makeErrorMsg(code, jqxhr, "Could not retrieve pages from [[:" + q.cmtitle + "]]"));
				finishedPromise.reject();
			} );
	};
	
	categories.forEach(function(cat, index, arr) {
		cat.query = $.extend( { "cmtitle":cat.title }, querySkeleton );
		$.when( arr[index-1] && arr[index-1].processed || true ).then(function(){
			doApiQuery(cat.query, index);
		});
	});
	
	categories[categories.length-1].processed.then(function(){
		let banners = {};
		categories.forEach(catObject => {
			banners[catObject.abbreviation] = catObject.banners;
		});

		banners["projectsJSON"] = getRaterData("projects");

		finishedPromise.resolve(banners);
	});
	
	return finishedPromise;
};

/**
 * Gets banners from cache, if there and not too old
 * 
 * @returns {Promise} Resolved with banners object
 */
var getBannersFromCache = function() {
	var cachedBanners = cache.read("banners"); //TODO
	if (
		!cachedBanners ||
		!cachedBanners.value ||
		!cachedBanners.staleDate
	) {
		return $.Deferred().reject();
	}
	if ( isAfterDate(cachedBanners.staleDate) ) {
		// Update in the background; still use old list until then  
		getListOfBannersFromApi().then(cacheBanners);
	}
	return $.Deferred().resolve(cachedBanners.value);
};

/**
 * Gets banner names, grouped by type (withRatings, withoutRatings, wrappers, notWPBM)
 * @returns {Promise<Object>} Object of string arrays keyed by type (withRatings, withoutRatings, wrappers, notWPBM)
 */
var getBannerNames = () => getBannersFromCache()
	.then( banners => {
		// Ensure all keys exist
		if (!banners.withRatings || !banners.withoutRatings || !banners.projectsJSON /* || !banners.wrappers || !banners.notWPBM || !banners.inactive || !banners.wir*/ ) {
			getListOfBannersFromApi().then(cacheBanners);
			return $.extend(
				{ withRatings: [], withoutRatings: [], projectsJSON : [] /* , wrappers: [], notWPBM: [], inactive: [], wir: []*/ },
				banners
			);
		}
		// Success: pass through
		return banners;
	} )
	.catch( () => {
		// Failure: get from Api, then cache them
		let bannersPromise = getListOfBannersFromApi();
		bannersPromise.then(cacheBanners);
		return bannersPromise;
	} );

export { getBannerNames };
// </nowiki>