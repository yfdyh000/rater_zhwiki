// <nowiki>
const packagejson = require("../package.json");
var version = packagejson.version;

// A global object that stores all the page and user configuration and settings
var config = {
	// Script info
	script: {
		// Advert to append to edit summaries
		advert:  `（[[WP:RATER#${version}|Rater]]）`,
		version: version
	},
	// Default preferences, if user subpage raterPrefs.json does not exist
	defaultPrefs: {
		"autostart": false,
		"autostartRedirects": false,
		"autostartNamespaces": [0],
		"minForShell": 3,
		"bypassRedirects": true,
		"autofillClassFromOthers": true,
		"autofillClassFromOres": true,
		"autofillImportance": true,
		"collapseParamsLowerLimit": 6,
		"watchlist": "preferences"
	},
	// MediaWiki configuration values
	mw: mw.config.get( [
		"skin",
		"wgPageName",
		"wgNamespaceNumber",
		"wgUserName",
		"wgFormattedNamespaces",
		"wgMonthNames",
		"wgRevisionId",
		"wgScriptPath",
		"wgServer",
		"wgCategories",
		"wgIsMainPage"
	] ),
	bannerDefaults: {
		classes: [
			"FA",
			"FL",
			"A",
			"GA",
			"B",
			"C",
			"Start",
			"Stub",
			"List"
		],
		importances: [
			"Top",
			"High",
			"Mid",
			"Low"
		],
		extendedClasses: [
			"Category",
			"Draft",
			"File",
			"FM",
			"Portal",
			"Project",
			"Template",
			"Bplus",
			"Future",
			"Current",
			"Disambig",
			"NA",
			"Redirect",
			"Book"
		],
		extendedImportances: [
			"Top",
			"High",
			"Mid",
			"Low",
			"Bottom",
			"NA"
		]
	},
	customBanners: {
		"WikiProject Military history": { // TODO: check it
			classes: [
				"FA",
				"FL",
				"A",
				"GA",
				"B",
				"C",
				"Start",
				"Stub",
				"List",
				"AL",
				"BL",
				"CL",
				"Category",
				"Draft",
				"File",
				"Portal",
				"Project",
				"Template",
				"Disambig",
				"Redirect",
				"Book"			
			],
			importances: []
		},
		"WikiProject Portals": {
			classes: [
				"FPo",
				"Complete",
				"Substantial",
				"Basic",
				"Incomplete",
				"Meta",
				"List",
				"Category",
				"Draft",
				"File",
				"Project",
				"Template",
				"Disambig",
				"NA",
				"Redirect"
			],
			importances: [
				"Top",
				"High",
				"Mid",
				"Low",
				"Bottom",
				"NA"
			]
		}
	},
	shellTemplates: [ // TODO: check it
		"WikiProject banner shell",
		"WikiProjectBanners",
		"WikiProject Banners",
		"WPB",
		"WPBS",
		"Wikiprojectbannershell",
		"WikiProject Banner Shell",
		"Wpb",
		"WPBannerShell",
		"Wpbs",
		"Wikiprojectbanners",
		"WP Banner Shell",
		"WP banner shell",
		"Bannershell",
		"Wikiproject banner shell",
		"WikiProject Banners Shell",
		"WikiProjectBanner Shell",
		"WikiProjectBannerShell",
		"WikiProject BannerShell",
		"WikiprojectBannerShell",
		"WikiProject banner shell/redirect",
		"WikiProject Shell",
		"Banner shell",
		"Scope shell",
		"Project shell",
		"WikiProject banner"
	],
	defaultParameterData: {
		"auto": {
			"label": {
				"en": "Auto-rated",
				"zh": "自动评级"
			},
			"description": {
				"en": "Automatically rated by a bot. Allowed values: ['yes'].",
				"zh": "机器人完成的自动评级。允许的值：['yes']。"
			},
			"autovalue": "yes"
		},
		"listas": {
			"label": {
				"en": "List as",
				"zh": "排序索引"
			},
			"description": {
				"en": "Sortkey for talk page",
				"zh": "讨论页的排序索引"
			}
		},
		"small": {
			"label": {
				"en": "Small?",
				"zh": "小？"
			},
			"description": {
				"en": "Display a small version. Allowed values: ['yes'].",
				"zh": "显示小型版本。允许的值：['yes']。"
			},
			"autovalue": "yes"
		},
		"attention": {
			"label": {
				"en": "Attention required?",
				"zh": "急需关注？"
			},
			"description": {
				"en": "Immediate attention required. Allowed values: ['yes'].",
				"zh": "需要立即关注。允许的值：['yes']。"
			},
			"autovalue": "yes"
		},
		"needs-image": {
			"label": {
				"en": "Needs image?",
				"zh": "需要图像？"
			},
			"description": {
				"en": "Request that an image or photograph of the subject be added to the article. Allowed values: ['yes'].",
				"zh": "条目需要本主题的图像或照片。允许的值：['yes']。"
			},
			"aliases": [
				"needs-photo"
			],
			"autovalue": "yes",
			"suggested": true
		},
		"needs-infobox": {
			"label": {
				"en": "Needs infobox?",
				"zh": "需要信息框？"
			},
			"description": {
				"en": "Request that an infobox be added to the article. Allowed values: ['yes'].",
				"zh": "条目需要一个信息框。允许的值：['yes']。"
			},
			"aliases": [
				"needs-photo" // TODO: why?
			],
			"autovalue": "yes",
			"suggested": true
		}
	}
};

export default config;
// </nowiki>