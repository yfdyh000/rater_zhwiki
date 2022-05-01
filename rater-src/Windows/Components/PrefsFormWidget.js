import config from "../../config";
// <nowiki>

function PrefsFormWidget( config ) {
	// Configuration initialization
	config = config || {};
	// Call parent constructor
	PrefsFormWidget.super.call( this, config );

	this.$element.addClass("rater-prefsFormWidget");

	this.layout =  new OO.ui.FieldsetLayout( {
		label: "设置",
		$element: this.$element
	} );

	this.preferences = {
		"autostart": {
			input: new OO.ui.ToggleSwitchWidget(),
			label: "自动打开Rater"
		},
		"autostartRedirects": {
			input: new OO.ui.ToggleSwitchWidget(),
			label: "重定向上自动打开"
		},
		"autostartNamespaces": {
			input: new mw.widgets.NamespacesMultiselectWidget(),
			label: "下列命名空间中自动打开"
		},
		"minForShell": {
			input: new OO.ui.NumberInputWidget( { "min": 2 } ),
			label: "专题横幅达到此数量时使用WikiProject banner shell"
		},
		"bypassRedirects": {
			input: new OO.ui.ToggleSwitchWidget(),
			label: "Bypass redirects to banners" // TODO
		},
		"autofillClassFromOthers":  {
			input: new OO.ui.ToggleSwitchWidget(),
			label: "基于其他横幅自动填写质量"
		},
		"autofillClassFromOres": {
			input: new OO.ui.ToggleSwitchWidget(),
			label: "基于ORES指标自动填写质量"
		},
		"autofillImportance": {
			input: new OO.ui.ToggleSwitchWidget(),
			label: "自动填写低重要度"
		},
		"collapseParamsLowerLimit": {
			input: new OO.ui.NumberInputWidget( { "min": 1 } ),
			label: "自动折叠超过此数量的参数" // review it
		},
		"watchlist": {
			input: new OO.ui.ButtonSelectWidget( {
				items: [
					new OO.ui.ButtonOptionWidget( {
						data: "preferences",
						label: "默认",
						title: "遵循“参数设置”中有关“编辑页面”的设置"
					} ),
					new OO.ui.ButtonOptionWidget( {
						data: "watch",
						label: "始终",
						title: "用 Rater 编辑的页面始终添加到监视列表"
					} ),
					new OO.ui.ButtonOptionWidget( {
						data: "nochange",
						label: "从不",
						title: "用 Rater 编辑的页面不添加到监视列表"
					} ),
				]
			}).selectItemByData("preferences"),
			label: "添加编辑的页面到监视列表"
		},
		"resetCache": {
			input: new OO.ui.ButtonWidget( {
				label: "重置缓存",
				title: "重置缓存数据，其中包括维基专题列表和模板参数",
				flags: ["destructive"]
			} )
		}
	};

	for (let prefName in this.preferences ) {
		if (prefName === "autofillClassFromOres") continue; // l10n
		this.layout.addItems([
			new OO.ui.FieldLayout( this.preferences[prefName].input, {
				label: this.preferences[prefName].label,
				align: "right"
			} )
		]);
	}

	this.preferences.resetCache.input.connect(this, {"click": "onResetCacheClick"});
}
OO.inheritClass( PrefsFormWidget, OO.ui.Widget );

PrefsFormWidget.prototype.setPrefValues = function(prefs) {
	for (let prefName in prefs ) {
		let value = prefs[prefName];
		let input = this.preferences[prefName] && this.preferences[prefName].input;
		switch (input && input.constructor.name) {
		case "OoUiButtonSelectWidget":
			input.selectItemByData(value);
			break;
		case "OoUiNumberInputWidget":
		case "OoUiToggleSwitchWidget":
			input.setValue(value);
			break;
		case "MwWidgetsNamespacesMultiselectWidget":
			input.clearItems();
			value.forEach(ns =>
				input.addTag(
					ns.toString(),
					ns === 0
						? "条目"
						: config.mw.wgFormattedNamespaces[ns]
				)
			);
			break;
		}
	}
};

PrefsFormWidget.prototype.getPrefs = function() {
	var prefs = {};
	for (let prefName in this.preferences ) {
		let input = this.preferences[prefName].input;
		let value;
		switch (input.constructor.name) {
		case "OoUiButtonSelectWidget":
			value = input.findSelectedItem().getData();
			break;
		case "OoUiToggleSwitchWidget":
			value = input.getValue();
			break;
		case "OoUiNumberInputWidget":
			value = Number(input.getValue()); // widget uses strings, not numbers!
			break;
		case "MwWidgetsNamespacesMultiselectWidget":
			value = input.getValue().map(Number); // widget uses strings, not numbers!
			break;
		}
		prefs[prefName] = value;
	}
	return prefs;
};

PrefsFormWidget.prototype.onResetCacheClick = function() {
	if(confirm("重置缓存后，Rater 程序将关闭并重启。已进行但未保存的更改将被放弃。")) {
		this.emit("resetCache");
	}
};

export default PrefsFormWidget;
// </nowiki>