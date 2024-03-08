// <nowiki>
import HanAssist from "./HanAssist";
import packagejson from "../package.json";
var version = packagejson.version;

// A global object that stores all the page and user configuration and settings
var config = {
	// Script info
	script: {
		// Advert to append to edit summaries
		advert:  `（[[User:YFdyh000/RATER#${version}|Rater]]）`,
		version: version
	},
	// Default preferences, if user subpage raterPrefs.json does not exist
	defaultPrefs: {
		"autostart": false,
		"autostartRedirects": false,
		"autostartNamespaces": [0],
		"minForShell": 1,
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
			//"Bplus",
			"Future",
			"Current",
			"Disambig",
			"NA",
			"Redirect",
			//"Book"
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
	bannerDefaultsLabel: { // i18n. this must be synchronized with the wiki and the above definition
		classes: Object.entries(HanAssist.batchConv({
			FA: {
				hans: '典范条目',
				hant: '典範條目'
			},
			FL: {
				hans: '特色列表',
				hant: '特色列表'
			},
			A: '甲',
			GA: {
				hans: '优良条目',
				hant: '優良條目'
			},
			B: '乙',
			C: '丙',
			Start: '初',
			Stub: '小作品',
			List: '列表'
		})).map(([k, v]) => `${k} - ${v}`),
		importances: Object.entries(HanAssist.batchConv({
			Top: {
				hans: '极高',
				hant: '極高'
			},
			High: '高',
			Mid: '中',
			Low: '低'
		})).map(([k, v]) => `${k} - ${v}`),
		extendedClasses: Object.entries(HanAssist.batchConv({
			Category: {
				hans: '分类',
				hant: '分類'
			},
			Draft: '草稿',
			File: {
				hans: '文件',
				hant: '檔案'
			},
			FM: {
				hans: '典范媒体',
				hant: '典範媒體'
			},
			Portal: {
				hans: '主题',
				hant: '主題'
			},
			Project: {
				hans: '项目',
				hant: '專案'
			},
			Template: '模板',
			// Bplus: '',
			Future: '未来',
			Current: {
				hans: '新闻动态',
				hant: '新聞動態'
			},
			Disambig: {
				hans: '消歧义',
				hant: '消歧義'
			},
			NA: {
				hans: '不适用',
				hant: '不適用'
			},
			Redirect: {
				hans: '重定向',
				hant: '重新導向'
			}
		})).map(([k, v]) => `${k} - ${v}`),
		extendedImportances: Object.entries(HanAssist.batchConv({
			Top: {
				hans: '极高',
				hant: '極高'
			},
			High: '高',
			Mid: '中',
			Low: '低',
			Bottom: {
				hans: '极低',
				hant: '極低'
			},
			NA: {
				hans: '不适用',
				hant: '不適用'
			}
		})).map(([k, v]) => `${k} - ${v}`),
	},
	customBanners: {
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
				"zh": "小型？"
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
				"zh": "需要关注？"
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