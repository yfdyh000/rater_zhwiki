import appConfig from "../../config";
import SuggestionLookupTextInputWidget from "./SuggestionLookupTextInputWidget";
import {getBannerNames} from "../../getBanners";
// <nowiki>

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
		placeholder: "新增 WikiProject...",
		$element: $("<div style='display:inline-block; margin:0 -1px; width:calc(100% - 55px);'>"),
		$overlay: this.$overlay,
	} );
	getBannerNames()
		.then(banners => [ // TODO: l10n
			...banners.withRatings.map(bannerName => ({
				label: bannerName.replace("WikiProject ", ""),
				data: {
					name: bannerName
				}
			})),
			...banners.withoutRatings.map(bannerName => ({
				label: bannerName.replace("WikiProject ", ""),
				data: {
					name: bannerName,
					withoutRatings: true
				}
			})),
			...banners.wrappers.map(bannerName => ({
				label: bannerName.replace("WikiProject ", "") + " [template wrapper]",
				data: {
					name: bannerName,
					wrapper: true
				}
			})),
			...banners.notWPBM.map(bannerName => ({
				label: bannerName.replace("WikiProject ", ""),
				data: {
					name: bannerName
				}
			})),
			...banners.inactive.map(bannerName => ({
				label: bannerName.replace("WikiProject ", "") + " [inactive]",
				data: {
					name: bannerName,
					withoutRatings: true
				}
			})),
			...banners.wir.map(bannerName => ({
				label: bannerName + " [Women In Red meetup/initiative]",
				data: {
					name: bannerName,
					withoutRatings: true
				}
			}))
		])
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
		label: "全部设为...",
		invisibleLabel: true,
		menu: {
			items: [
				new OO.ui.MenuSectionOptionWidget( {
					label: "质量"
				} ),
				new OO.ui.MenuOptionWidget( {
					data: {class: null},
					label: new OO.ui.HtmlSnippet("<span style=\"color:#777\">"+"（无质量）"+"</span>")
				} ),
				...appConfig.bannerDefaults.classes.map(classname => new OO.ui.MenuOptionWidget( {
					data: {class: classname},
					label: classname // TODO: i18n
				} )
				),
				new OO.ui.MenuSectionOptionWidget( {
					label: "重要度"
				} ),
				new OO.ui.MenuOptionWidget( {
					data: {importance: null},
					label: new OO.ui.HtmlSnippet("<span style=\"color:#777\">"+"（无重要度）"+"</span>")
				} ),
				...appConfig.bannerDefaults.importances.map(importance => new OO.ui.MenuOptionWidget( {
					data: {importance: importance},
					label: importance // TODO: i18n
				} )
				)
			]
		},
		$element: $("<span style=\"width:auto;display:inline-block;float:left;margin:0\" title='全部设为...'>"),
		$overlay: this.$overlay,
	} );

	// Remove all banners button
	this.removeAllButton = new OO.ui.ButtonWidget( {
		icon: "trash",
		title: "全部删除",
		flags: "destructive"
	} );

	// Clear all parameters button
	this.clearAllButton = new OO.ui.ButtonWidget( {
		icon: "cancel",
		title: "全部清空",
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