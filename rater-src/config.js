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
		classes: wgULS([
			"FA - 典范条目",
			"FL - 特色列表",
			"A - 甲",
			"GA - 优良",
			"B - 乙",
			"C - 丙",
			"Start - 初",
			"Stub - 小作品",
			"List - 列表"
		], ["FA - 典範", "FL - 特色列表", "A - 甲", "GA - 優良", "B - 乙", "C - 丙", "Start - 初", "Stub - 小作品", "List - 列表"]),
		importances: wgULS([
			"Top - 极高",
			"High - 高",
			"Mid - 中",
			"Low - 低"
		], ["Top - 極高", "High - 高", "Mid - 中", "Low - 低"]),
		extendedClasses: wgULS([
			"Category - 分类",
			"Draft - 草稿",
			"File - 文件",
			"FM - 典范媒体",
			"Portal - 主题",
			"Project - 项目",
			"Template - 模板",
			//"Bplus",
			"Future - 未来",
			"Current - 新闻动态",
			"Disambig - 消歧义",
			"NA - 无",
			"Redirect - 重定向",
			//"Book"
		], ["Category - 分類", "Draft - 草稿", "File - 檔案", "FM - 典範媒體", "Portal - 主題", "Project - 計畫", "Template - 模板",
			//"Bplus", 
			"Future - 未來", "Current - 動態", "Disambig - 消歧義", "NA - 不適用", "Redirect - 重新導向"]),
		extendedImportances: wgULS([
			"Top - 极高",
			"High - 高",
			"Mid - 中",
			"Low - 低",
			"Bottom - 极低",
			"NA - 无"
		], ["Top - 極高", "High - 高", "Mid - 中", "Low - 低", "Bottom - 極低", "NA - 不適用"])
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