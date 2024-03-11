import appConfig from "../../config";
import ParameterListWidget from "./ParameterListWidget";
import ParameterWidget from "./ParameterWidget";
import DropdownParameterWidget from "./DropdownParameterWidget";
import SuggestionLookupTextInputWidget from "./SuggestionLookupTextInputWidget";
import { filterAndMap, classMask, importanceMask } from "../../util";
import {Template, getWithRedirectTo} from "../../Template";
import HorizontalLayoutWidget from "./HorizontalLayoutWidget";
import globalConfig from "../../config";
import HanAssist from "../../HanAssist";
// <nowiki>

function BannerWidget( template, config ) {
	// Configuration initialization
	config = config || {};
	// Call parent constructor
	BannerWidget.super.call( this, config );
	this.$overlay = config.$overlay;

	/* --- PREFS --- */
	this.preferences = config.preferences;
	
	/* --- PROPS --- */
	this.paramData = template.paramData;
	this.paramAliases = template.paramAliases || {};
	this.parameterSuggestions = template.parameterSuggestions;
	this.name = template.name;
	this.wikitext = template.wikitext;
	this.pipeStyle = template.pipeStyle;
	this.equalsStyle = template.equalsStyle;
	this.endBracesStyle = template.endBracesStyle;
	this.mainText = template.getTitle().getMainText();
	this.redirectTargetMainText = template.redirectTarget && template.redirectTarget.getMainText();
	this.isShellTemplate = template.isShellTemplate();
	this.changed = template.parameters.some(parameter => parameter.autofilled); // initially false, unless some parameters were autofilled
	this.hasClassRatings = template.classes && template.classes.length;
	this.hasImportanceRatings = template.importances && template.importances.length;
	this.inactiveProject = template.inactiveProject;

	/* --- TITLE AND RATINGS --- */

	this.getLocalTitleForClasses = function (rName) {  // TODO: structure
		return appConfig.bannerDefaultsLabel.extendedClasses.find(n=>n.includes(rName + " -")) 
		|| appConfig.bannerDefaultsLabel.classes.find(n=>n.includes(rName + " -")) 
		|| rName;
	};
	this.getLocalTitleForImportances = function (rName) {
		return appConfig.bannerDefaultsLabel.importances.find(n=>n.includes(rName + " -")) 
		|| appConfig.bannerDefaultsLabel.extendedImportances.find(n=>n.includes(rName + " -")) 
		|| rName;
	};

	this.openButton = new OO.ui.ButtonWidget( {
		icon: "link",
		label: HanAssist.conv({
	hans: "打开页面",
	hant: "打开页面"
}),
		title: HanAssist.conv({
	hans: "打开页面",
	hant: "打开页面"
}),
		$element: $("<div style=\"width:100%\">")
	} );
	this.removeButton = new OO.ui.ButtonWidget( {
		icon: "trash",
		label: HanAssist.conv({
	hans: "移除横幅",
	hant: "移除橫幅"
}),
		title: HanAssist.conv({
	hans: "移除横幅",
	hant: "移除橫幅"
}),
		flags: "destructive",
		$element: $("<div style=\"width:100%\">")
	} );
	this.clearButton = new OO.ui.ButtonWidget( {
		icon: "cancel",
		label: HanAssist.conv({
	hans: "清空参数",
	hant: "清除參數"
}),
		title: HanAssist.conv({
	hans: "清空参数",
	hant: "清除參數"
}),
		flags: "destructive",
		$element: $("<div style=\"width:100%\">")
	} );
	this.openButton.$element.find("a").css("width","100%");
	this.removeButton.$element.find("a").css("width","100%");
	this.clearButton.$element.find("a").css("width","100%");

	this.titleButtonsGroup = new OO.ui.ButtonGroupWidget( {
		items: [ this.removeButton, this.clearButton, this.openButton ],
		$element: $("<span style='width:100%;'>"),
	} );

	this.mainLabelPopupButton = new OO.ui.PopupButtonWidget( {
		label: `{{${template.getTitle().getMainText()}}}${this.inactiveProject ? HanAssist.conv({
	hans: "（不活跃）",
	hant: "（不活躍）"
}) : ""}`,
		$element: $("<span style='display:inline-block;width:48%;margin-right:0;padding-right:8px'>"),
		$overlay: this.$overlay,
		indicator:"down",
		framed:false,
		popup: {
			$content: this.titleButtonsGroup.$element,
			width: 200,
			padded: false,
			align: "force-right",
			anchor: false
		}
	} );
	this.mainLabelPopupButton.$element
		.children("a").first().css({"font-size":"110%"})
		.find("span.oo-ui-labelElement-label").css({"white-space":"normal"});

	// Rating dropdowns
	if (this.isShellTemplate) {
		this.classDropdown = new DropdownParameterWidget( {
			label: new OO.ui.HtmlSnippet("<span style=\"color:#777\">Class</span>"),
			menu: {
				items: [
					new OO.ui.MenuOptionWidget( {
						data: null,
						label: new OO.ui.HtmlSnippet(`<span style="color:#777">（${config.isArticle ? HanAssist.conv({
	hans: "无质量",
	hant: "未評定"
}) : HanAssist.conv({
	hans: "自动检测",
	hant: "自動偵測"
})}）</span>`)
					} ),
					...globalConfig.bannerDefaults.classes.map( classname =>
						new OO.ui.MenuOptionWidget( {
							data: classname,
							label: this.getLocalTitleForClasses(classname)
						} )
					)
				],
			},
			$overlay: this.$overlay,
		} );
		var shellClassParam = template.parameters.find(parameter => parameter.name === "class");
		this.classDropdown.getMenu().selectItemByData( shellClassParam && classMask(shellClassParam.value) );
	} else if (this.hasClassRatings) {
		this.classDropdown = new DropdownParameterWidget( {
			label: new OO.ui.HtmlSnippet("<span style=\"color:#777\">"+"质量"+"</span>"),
			menu: {
				items: [
					new OO.ui.MenuOptionWidget( {
						data: null,
						label: new OO.ui.HtmlSnippet(`<span style="color:#777">${config.isArticle ? HanAssist.conv({
	hans: "继承自shell",
	hant: "繼承自shell"
}) : HanAssist.conv({
	hans: "（自动检测）",
	hant: "（自動偵測）"
})}</span>`)
					} ),
					...template.classes.map( classname =>
						new OO.ui.MenuOptionWidget( {
							data: classname,
							label: this.getLocalTitleForClasses(classname)
						} )
					)
				],
			},
			$overlay: this.$overlay,
		} );
		var classParam = template.parameters.find(parameter => parameter.name === "class");
		this.classDropdown.getMenu().selectItemByData( classParam && classMask(classParam.value) );
	}

	if (this.hasImportanceRatings) {
		this.importanceDropdown = new DropdownParameterWidget( {
			label: new OO.ui.HtmlSnippet("<span style=\"color:#777\">重要度</span>"),
			menu: {
				items: [
					new OO.ui.MenuOptionWidget( {
						data: null, label: new OO.ui.HtmlSnippet(`<span style="color:#777">${config.isArticle ? HanAssist.conv({
	hans: "（无重要度）",
	hant: "（未評定）"
}) : HanAssist.conv({
	hans: "（自动检测）",
	hant: "（自動偵測）"
})}</span>`)
					} ),
					...template.importances.map(importance =>
						new OO.ui.MenuOptionWidget( {
							data: importance,
							label: this.getLocalTitleForImportances(importance)
						} )
					)
				]
			},
			$overlay: this.$overlay,
		} );
		var importanceParam = template.parameters.find(parameter => parameter.name === "importance");
		this.importanceDropdown.getMenu().selectItemByData( importanceParam && importanceMask(importanceParam.value) );
	}

	this.titleLayout = new OO.ui.HorizontalLayout( {
		items: [ this.mainLabelPopupButton ]
	} );
	if (this.hasClassRatings || this.isShellTemplate) {
		this.titleLayout.addItems([ this.classDropdown ]);
	}
	if (this.hasImportanceRatings) {
		this.titleLayout.addItems([ this.importanceDropdown ]);
	}

	/* --- PARAMETERS LIST --- */

	var parameterWidgets = filterAndMap(
		template.parameters,
		param => {
			if ( this.isShellTemplate ) {
				if (param.name == "1") {
					this.shellParam1Value = param.value;
					return false;
				}
				return param.name !== "class";
			}
			return param.name !== "class" && param.name !== "importance";
		},
		param => new ParameterWidget(param, template.paramData[param.name], {$overlay: this.$overlay})
	);

	this.parameterList = new ParameterListWidget( {
		items: parameterWidgets,
		preferences: this.preferences
	} );

	/* --- ADD PARAMETER SECTION --- */

	this.addParameterNameInput = new SuggestionLookupTextInputWidget({
		suggestions: template.parameterSuggestions,
		placeholder: HanAssist.conv({
	hans: "参数名",
	hant: "參數名稱"
}),
		$element: $("<div style='display:inline-block;width:40%'>"),
		validate: function(val) {
			let {validName, name, value} = this.getAddParametersInfo(val);
			return (!name && !value) ? true : validName;
		}.bind(this),
		allowSuggestionsWhenEmpty: true,
		$overlay: this.$overlay
	});
	this.updateAddParameterNameSuggestions();
	this.addParameterValueInput = new SuggestionLookupTextInputWidget({
		placeholder: HanAssist.conv({
	hans: "参数值",
	hant: "參數內容"
}),
		$element: $("<div style='display:inline-block;width:40%'>"),
		validate: function(val) {
			let {validValue, name, value} = this.getAddParametersInfo(null, val);
			return (!name && !value) ? true : validValue;
		}.bind(this),
		allowSuggestionsWhenEmpty: true,
		$overlay: this.$overlay
	});
	this.addParameterButton = new OO.ui.ButtonWidget({
		label: HanAssist.conv({
	hans: "添加",
	hant: "新增"
}),
		icon: "add",
		flags: "progressive"
	}).setDisabled(true);
	this.addParameterControls = new HorizontalLayoutWidget( {
		items: [
			this.addParameterNameInput,
			new OO.ui.LabelWidget({label:"="}),
			this.addParameterValueInput,
			this.addParameterButton
		]
	} );

	this.addParameterLayout = new OO.ui.FieldLayout(this.addParameterControls, {
		label: HanAssist.conv({
	hans: "添加参数：",
	hant: "新增參數："
}),
		align: "top"
	}).toggle(false);
	// A hack to make messages appear on their own line
	this.addParameterLayout.$element.find(".oo-ui-fieldLayout-messages").css({
		"clear": "both",
		"padding-top": 0
	});

	/* --- OVERALL LAYOUT/DISPLAY --- */

	// Display the layout elements, and a rule
	this.$element.addClass("rater-bannerWidget").append(
		this.titleLayout.$element,
		this.parameterList.$element,
		this.addParameterLayout.$element
	);
	if (!this.isShellTemplate) {
		this.$element.append( $("<hr>") );
	}

	if (this.isShellTemplate) {
		this.$element.css({
			"background": "#eee",
			"border-radius": "10px",
			"padding": "0 10px 5px",
			"margin-bottom": "12px",
			"font-size": "92%"			
		});
	}

	/* --- EVENT HANDLING --- */

	if (this.hasClassRatings) {
		this.classDropdown.connect( this, {"change": "onClassChange" } );
	}
	if (this.hasImportanceRatings) {
		this.importanceDropdown.connect( this, {"change": "onImportanceChange" } );
	}
	this.parameterList.connect( this, {
		"change": "onParameterChange",
		"addParametersButtonClick": "showAddParameterInputs",
		"updatedSize": "onUpdatedSize"
	} );
	this.addParameterButton.connect(this, { "click": "onParameterAdd" });
	this.addParameterNameInput.connect(this, {
		"change": "onAddParameterNameChange",
		"enter": "onAddParameterNameEnter",
		"choose": "onAddParameterNameEnter"
	});
	this.addParameterValueInput.connect(this, {
		"change": "onAddParameterValueChange",
		"enter": "onAddParameterValueEnter",
		"choose": "onAddParameterValueEnter"
	});
	this.openButton.connect(this, {"click": "onOpenButtonClick"}, );
	this.removeButton.connect(this, {"click": "onRemoveButtonClick"}, );
	this.clearButton.connect( this, {"click": "onClearButtonClick"} );

	/* --- APPLY PREF -- */
	if (this.preferences.bypassRedirects) {
		this.bypassRedirect();
	}

}
OO.inheritClass( BannerWidget, OO.ui.Widget );

/**
 * @param {String} templateName
 * @param {Object} [data]
 * @param {Boolean} data.withoutRatings
 * @param {Boolean} data.isWrapper
 * @param {Object} config
 * @returns {Promise<BannerWidget>}
 */
BannerWidget.newFromTemplateName = function(templateName, data, config) {
	var template = new Template();
	template.name = templateName;
	if (data && data.withoutRatings) {
		template.withoutRatings = true;
	}
	return getWithRedirectTo(template)
		.then(function(template) {
			return $.when(
				template.setClassesAndImportances(),
				template.setParamDataAndSuggestions()
			).then(() => {
				// Add missing required/suggested values
				template.addMissingParams();
				// Return the now-modified template
				return template;
			});
		})
		.then(template => new BannerWidget(template, config));
};

BannerWidget.prototype.onUpdatedSize = function() {
	// Emit an "updatedSize" event so the parent window can update size, if needed
	this.emit("updatedSize");
};

BannerWidget.prototype.setChanged = function() {
	this.changed = true;
	this.emit("changed");
	// TODO: check it
	if (this.mainText === "WikiProject Biography" || this.redirectTargetMainText === "WikiProject Biography") {
		// Emit event so BannerListWidget can update the banner shell template (if present)
		this.emit("biographyBannerChange");		
	}
};

BannerWidget.prototype.onParameterChange = function() {
	this.setChanged();
	this.updateAddParameterNameSuggestions();
};

BannerWidget.prototype.onClassChange = function() {
	this.setChanged();
	this.classChanged = true;
	var classItem = this.classDropdown.getMenu().findSelectedItem();
	if (classItem && classItem.getData() == null ) {
		// clear selection
		this.classDropdown.getMenu().selectItem();
	}
};

BannerWidget.prototype.onImportanceChange = function() {
	this.setChanged();
	this.importanceChanged = true;
	var importanceItem = this.importanceDropdown.getMenu().findSelectedItem();
	if (importanceItem && importanceItem.getData() == null ) {
		// clear selection
		this.importanceDropdown.getMenu().selectItem();
	}
};

BannerWidget.prototype.showAddParameterInputs = function() {
	this.addParameterLayout.toggle(true);
	this.addParameterNameInput.focus();
	this.onUpdatedSize();
};

BannerWidget.prototype.getAddParametersInfo = function(nameInputVal, valueInputVal) {
	var name = nameInputVal && nameInputVal.trim() || this.addParameterNameInput.getValue().trim();
	var paramAlreadyIncluded = name === "class" ||
		name === "importance" ||
		(name === "1" && this.isShellTemplate) ||
		this.parameterList.getParameterItems().some(paramWidget => paramWidget.name === name);
	var value = valueInputVal && valueInputVal.trim() || this.addParameterValueInput.getValue().trim();
	var autovalue = name && this.paramData[name] && this.paramData[name].autovalue || null;
	return {
		validName: !!(name && !paramAlreadyIncluded),
		validValue: !!(value || autovalue),
		isAutovalue: !!(!value && autovalue),
		isAlreadyIncluded: !!(name && paramAlreadyIncluded),
		name,
		value,
		autovalue
	};
};

BannerWidget.prototype.onAddParameterNameChange = function() {
	let { validName, validValue, isAutovalue, isAlreadyIncluded, name, autovalue } = this.getAddParametersInfo();
	// Set value input placeholder as the autovalue
	this.addParameterValueInput.$input.attr( "placeholder",  autovalue || "" );
	// Set suggestions, if the parameter has a list of allowed values
	var allowedValues = this.paramData[name] &&
		this.paramData[name].allowedValues && 
		this.paramData[name].allowedValues.map(val => {return {data: val, label:val}; });
	this.addParameterValueInput.setSuggestions(allowedValues || []);
	// Set button disabled state based on validity
	this.addParameterButton.setDisabled(!validName || !validValue);
	// Show notice if autovalue will be used
	this.addParameterLayout.setNotices( validName && isAutovalue ? [HanAssist.conv({
	hans: "将自动填写参数值",
	hant: "將自動填寫參數值"
})] : [] );
	// Show error is the banner already has the parameter set
	this.addParameterLayout.setErrors( isAlreadyIncluded ? [HanAssist.conv({
	hans: "参数已存在",
	hant: "參數已存在"
})] : [] );
};

BannerWidget.prototype.onAddParameterNameEnter = function() {
	this.addParameterValueInput.focus();
};

BannerWidget.prototype.onAddParameterValueChange = function() {
	let { validName, validValue, isAutovalue } = this.getAddParametersInfo();
	this.addParameterButton.setDisabled(!validName || !validValue);
	this.addParameterLayout.setNotices( validName && isAutovalue ? ["将自动填写参数值"] : [] ); 
};

BannerWidget.prototype.onAddParameterValueEnter = function() {
	// Make sure button state has been updated
	this.onAddParameterValueChange();
	// Do nothing if button is disabled (i.e. name and/or value are invalid)
	if ( this.addParameterButton.isDisabled() ) {
		return;
	}
	// Add parameter
	this.onParameterAdd();
};

BannerWidget.prototype.onParameterAdd = function() {
	let { validName, validValue, name, value, autovalue }  = this.getAddParametersInfo();
	if (!validName || !validValue) {
		// Error should already be shown via onAddParameter...Change methods
		return;
	}
	var newParameter = new ParameterWidget(
		{
			"name": name,
			"value": value || autovalue
		},
		this.paramData[name],
		{$overlay: this.$overlay}
	);
	this.parameterList.addItems([newParameter]);
	this.addParameterNameInput.setValue("");
	this.addParameterValueInput.setValue("");
	this.addParameterNameInput.$input.focus();
};

BannerWidget.prototype.updateAddParameterNameSuggestions = function() {
	let paramsInUse = {};
	this.parameterList.getParameterItems().forEach(
		paramWidget => paramsInUse[paramWidget.name] = true
	);
	this.addParameterNameInput.setSuggestions(
		this.parameterSuggestions.filter(
			suggestion => !paramsInUse[suggestion.data]
		)
	);
};

BannerWidget.prototype.onOpenButtonClick = function() {
	window.open(mw.util.getUrl("Template:" + this.name), '_blank');
};

BannerWidget.prototype.onRemoveButtonClick = function() {
	this.emit("remove");
};

BannerWidget.prototype.onClearButtonClick = function() {
	this.parameterList.clearItems(
		this.parameterList.getParameterItems()
	);
	if ( this.hasClassRatings ) {
		this.classDropdown.getMenu().selectItem();
	}
	if ( this.hasImportanceRatings ) {
		this.importanceDropdown.getMenu().selectItem();
	}
};

BannerWidget.prototype.bypassRedirect = function() {
	if (!this.redirectTargetMainText) {
		return;
	}
	// Store the bypassed name
	this.bypassedName = this.name;
	// Update title label
	this.mainLabelPopupButton.setLabel(`{{${this.redirectTargetMainText}}}${this.inactiveProject ? HanAssist.conv({
	hans: "（不活跃）",
	hant: "（不活躍）"
}) : ""}`);
	// Update properties
	this.name = this.redirectTargetMainText;
	this.mainText = this.redirectTargetMainText;
	this.redirectTargetMainText = null;
	this.setChanged();
};

BannerWidget.prototype.makeWikitext = function() {
	if (!this.changed && this.wikitext) {
		return this.wikitext;
	}
	var pipe = this.pipeStyle;
	var equals = this.equalsStyle;
	var classItem = (this.hasClassRatings || this.isShellTemplate) && this.classDropdown.getMenu().findSelectedItem();
	var classVal = classItem && classItem.getData();
	var importanceItem = this.hasImportanceRatings && this.importanceDropdown.getMenu().findSelectedItem();
	var importanceVal = importanceItem && importanceItem.getData();

	return ("{{" +
		this.name +
		( (this.hasClassRatings || this.isShellTemplate) && classVal!=null ? `${pipe}class${equals}${classVal||""}` : "" ) +
		( this.hasImportanceRatings && importanceVal!=null ? `${pipe}importance${equals}${importanceVal||""}` : "" ) +
		this.parameterList.getParameterItems()
			.map(parameter => parameter.makeWikitext(pipe, equals))
			.join("") +
		this.endBracesStyle)
		.replace(/\n+}}$/, "\n}}"); // avoid empty line at end like [[Special:Diff/925982142]]
};

BannerWidget.prototype.setPreferences = function(prefs) {
	this.preferences = prefs;
	if (this.preferences.bypassRedirects) {
		this.bypassRedirect();
	}
	this.parameterList.setPreferences(prefs);
};

export default BannerWidget;
// </nowiki>