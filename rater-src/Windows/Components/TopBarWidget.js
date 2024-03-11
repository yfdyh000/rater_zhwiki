import appConfig from "../../config";
import SuggestionLookupTextInputWidget from "./SuggestionLookupTextInputWidget";
import {getBannerNames} from "../../getBanners";
import HanAssist from "../../HanAssist";
// <nowiki>

function cutTitle(name) { // cutWikiProjectTemplateTitle
	return name.replace(/WikiProject /i, "").replace("专题", "").replace("專題", "");
}

function TopBarWidget( config ) {
	// Configuration initialization
	config = $.extend(
		{
			expanded: false,
			framed: false,
			padded: false
		},
		config || {}
	);
	// Call parent constructor
	TopBarWidget.super.call( this, config );
	this.$overlay = config.$overlay;
    
	// Search box
	this.searchBox = new SuggestionLookupTextInputWidget( {
		//placeholder: HanAssist.conv({
		//	hans: "新增维基专题...",
		//	hant: "新增維基專題..."
		//}),
		placeholder: HanAssist.conv({
			hans: "添加维基专题横幅或相关模板...",
			hant: "添加維基專題橫幅或相關模板..."
		}),
		$element: $("<div style='display:inline-block; margin:0 -1px; width:calc(100% - 55px);'>"),
		$overlay: this.$overlay,
	} );
	getBannerNames()
		.then(banners => {
			var o = [
				banners.withRatings.map(bannerName => ({
					label: cutTitle(bannerName),
					data: {
						name: bannerName
					}
				})),
				banners.withoutRatings.map(bannerName => ({
					label: cutTitle(bannerName),
					data: {
						name: bannerName,
						withoutRatings: true
					}
				}))
			].flat(1);
			let catPagesNum = o.length;
			for (let key of Object.keys(banners.projectsJSON)) {
				var alias = banners.projectsJSON[key];
				o.push(
					{
						label: cutTitle(key) + " - {" + alias.join(", ") + "}",
						data: {
							name: key,
							zhProjects: "values"
						}
					}
				);
			}
			o = o.filter((b, i) => //i < catPagesNum
				(i >= catPagesNum || (o.findIndex((e)=> e.data.name === b.data.name) != i))
			); // Remove duplicates
			return o;
		})
		.then(bannerOptions => this.searchBox.setSuggestions(bannerOptions));
    
	// Add button
	this.addBannerButton = new OO.ui.ButtonWidget( {
		icon: "add",
		title: "新增",
		flags: "progressive",
		$element: $("<span style='float:right;margin: 0;transform: translateX(-12px);'>"),
	} );
	var $searchContainer = $("<div style='display:inline-block; flex-shrink:1; flex-grow:100; min-width:250px; width:50%;'>")
		.append(this.searchBox.$element, this.addBannerButton.$element);

	// Set all classes/importances
	// in the style of a popup button with a menu (is actually a dropdown with a hidden label, because that makes the coding easier.)
	this.setAllDropDown = new OO.ui.DropdownWidget( {
		icon: "tag",
		label: HanAssist.conv({
			hans: "全部统一设为...",
			hant: "全部統一設成..."
		}),
		invisibleLabel: true,
		menu: {
			items: [
				new OO.ui.MenuSectionOptionWidget( {
					label: HanAssist.conv({
						hans: "质量",
						hant: "品質"
					})
				} ),
				new OO.ui.MenuOptionWidget( {
					data: {class: null},
					label: $('<span>').css('color', '#777').text(HanAssist.conv({
						hans: "（未評定）",
						hant: "（未評定）"
					}))
				} ),
				...appConfig.bannerDefaults.classes.map((classname, i) => {
					let display = appConfig.bannerDefaultsLabel.classes[i];
					return new OO.ui.MenuOptionWidget( {
						data: {class: classname},
						label: typeof display != "undefined" ? display : classname
					} );
				}
				),
				new OO.ui.MenuSectionOptionWidget( {
					label: HanAssist.conv({
						hans: "重要度",
						hant: "重要度"
					})
				} ),
				new OO.ui.MenuOptionWidget( {
					data: {importance: null},
					label: $('<span>').css('color', '#777').text(HanAssist.conv({
						hans: "（未評定）",
						hant: "（未評定）"
					}))
				}),
				...appConfig.bannerDefaults.importances.map((importance, i) => {
					let display = appConfig.bannerDefaultsLabel.importances[i];
					return new OO.ui.MenuOptionWidget( {
						data: {importance: importance},
						label: typeof display != "undefined" ? display : importance
					} );
				}
				),
			]
		},
		$element: $("<span>")
			.attr({
				style: 'width: auto; display: inline-block; float: left; margin: 0;',
				title: HanAssist.conv({
					hans: "全部统一设为...",
					hant: "全部統一設成..."
				})
			}),
		$overlay: this.$overlay,
	} );

	// Remove all banners button
	this.removeAllButton = new OO.ui.ButtonWidget( {
		icon: "trash",
		title: HanAssist.conv({
			hans: "全部删除",
			hant: "全部刪除"
		}),
		flags: "destructive"
	} );

	// Clear all parameters button
	this.clearAllButton = new OO.ui.ButtonWidget( {
		icon: "cancel",
		title: HanAssist.conv({
			hans: "全部清空",
			hant: "全部清除"
		}),
		flags: "destructive"
	} );

	// Group the buttons together
	this.menuButtons = new OO.ui.ButtonGroupWidget( {
		items: [
			this.removeAllButton,
			this.clearAllButton
		],
		$element: $("<span style='flex:1 0 auto;'>"),
	} );
	// Include the dropdown in the group
	this.menuButtons.$element.prepend(this.setAllDropDown.$element);

	// Put everything into a layout
	this.$element.addClass("rater-topBarWidget")
		.css({
			"position": "fixed",
			"width": "100%",
			"background": "#ccc",
			"display": "flex",
			"flex-wrap": "wrap",
			"justify-content": "space-around",
			"margin": "-2px 0 0 0"
		})
		.append(
			$searchContainer,
			this.menuButtons.$element
		);

	/* --- Event handling --- */
    
	this.searchBox.connect(this, {
		"enter": "onSearchSelect",
		"choose": "onSearchSelect"
	});
	this.addBannerButton.connect(this, {"click": "onSearchSelect"});
	this.setAllDropDown.getMenu().connect(this, {"choose": "onRatingChoose"});
	this.removeAllButton.connect(this, {"click": "onRemoveAllClick"});
	this.clearAllButton.connect(this, {"click": "onClearAllClick"});
}
OO.inheritClass( TopBarWidget, OO.ui.PanelLayout );

TopBarWidget.prototype.onSearchSelect = function(data) {
	this.emit("searchSelect", data);
};

TopBarWidget.prototype.onRatingChoose = function(item) {
	const data = item.getData();
	if (data.class || data.class===null) {
		this.emit("setClasses", data.class);
	}
	if (data.importance || data.importance===null) {
		this.emit("setImportances", data.importance);
	}
};

TopBarWidget.prototype.onRemoveAllClick = function() {
	this.emit("removeAll");
};

TopBarWidget.prototype.onClearAllClick = function() {
	this.emit("clearAll");
};

TopBarWidget.prototype.setDisabled = function(disable) {
	[
		this.searchBox,
		this.addBannerButton,
		this.setAllDropDown,
		this.removeAllButton,
		this.clearAllButton
	].forEach(widget => widget.setDisabled(disable));
};

export default TopBarWidget;
// </nowiki>