import config from "../../config";
import HanAssist from "../../HanAssist";
// <nowiki>

function PrefsFormWidget( config ) {
	// Configuration initialization
	config = config || {};
	// Call parent constructor
	PrefsFormWidget.super.call( this, config );

	this.$element.addClass("rater-prefsFormWidget");

	this.layout =  new OO.ui.FieldsetLayout( {
		label: HanAssist.conv({
			hans: "设置",
			hant: "設定"
		}),
		$element: this.$element
	} );

	this.allowBackgroundToggle = new OO.ui.ToggleSwitchWidget();
	this.allowBackgroundToggle.connect(this, {"change": "onAllowBackgroundToggleChange"});

	this.preferences = {
		"autostart": {
			input: new OO.ui.ToggleSwitchWidget(),
			label: HanAssist.conv({
				hans: "自动打开Rater",
				hant: "自動打開Rater"
			})
		},
		"autostartRedirects": {
			input: new OO.ui.ToggleSwitchWidget(),
			label: HanAssist.conv({
				hans: "遇到重定向则自动打开",
				hant: "遇到重新導向則自動打開"
			})
		},
		"autostartNamespaces": {
			input: new mw.widgets.NamespacesMultiselectWidget(),
			label: HanAssist.conv({
				hans: "下列命名空间中自动打开",
				hant: "下列命名空間中自動打開"
			})
		},
		"bypassRedirects": {
			input: new OO.ui.ToggleSwitchWidget(),
			label: HanAssist.conv({
				hans: "自动使用重定向指向的横幅",
				hant: "自動使用重新導向指向的橫幅"
			}),
			title: HanAssist.conv({
				hans: "开启后，若横幅模板为重定向，自动改用重定向指向的目标名称",
				hant: "開啟後，若橫幅模板為重新導向，自動改用重新導向指向的目標名稱"
			})
		},
		"autofillClassFromOthers":  {
			input: new OO.ui.ToggleSwitchWidget(),
			label: HanAssist.conv({
				hans: "基于其他横幅自动填写质量",
				hant: "基於其他橫幅自動填寫質量"
			})
		},
		"autofillClassFromOres": {
			input: new OO.ui.ToggleSwitchWidget(),
			label: HanAssist.conv({
				hans: "基于ORES指标自动填写质量",
				hant: "基於ORES指標自動填寫質量"
			})
		},
		"autofillImportance": {
			input: new OO.ui.ToggleSwitchWidget(),
			label: HanAssist.conv({
				hans: "自动填写低重要度",
				hant: "自動填寫低重要度"
			})
		},
		"collapseParamsLowerLimit": {
			input: new OO.ui.NumberInputWidget( { "min": 1 } ),
			label: HanAssist.conv({
				hans: "自动折叠超过此数量的参数",
				hant: "自動摺疊超過此數量的參數"
			}) // review it
		},
		"watchlist": {
			input: new OO.ui.ButtonSelectWidget( {
				items: [
					new OO.ui.ButtonOptionWidget( {
						data: "preferences",
						label: HanAssist.conv({
							hans: "默认",
							hant: "預設"
						}),
						title: HanAssist.conv({
							hans: "遵循“参数设置”中有关“编辑页面”的设置",
							hant: "遵循「參數設定」中有關「編輯頁面」的設定"
						})
					} ),
					new OO.ui.ButtonOptionWidget( {
						data: "watch",
						label: "始终",
						title: HanAssist.conv({
							hans: "用 Rater 编辑的页面始终添加到监视列表",
							hant: "使用 Rater 編輯的頁面始終新增到監視清單"
						})
					} ),
					new OO.ui.ButtonOptionWidget( {
						data: "nochange",
						label: HanAssist.conv({
							hans: "从不",
							hant: "從不"
						}),
						title: HanAssist.conv({
							hans: "用 Rater 编辑的页面不添加到监视列表",
							hant: "使用 Rater 編輯的頁面不新增到監視清單"
						})
					} )
				]
			}).selectItemByData("preferences"),
			label: HanAssist.conv({
				hans: "添加编辑的页面到监视列表",
				hant: "新增編輯的頁面到監視清單"
			})
		},
		"otherLanguageCode": {
			input: new OO.ui.TextInputWidget({
				placeholder: "en",
				value: "en"
			}),
			label: HanAssist.conv({
				hans: "其他语言维基代码",
				hant: "其他語言維基代碼"
			})
		},
		"autoFetchOtherLangBanners": {
			input: new OO.ui.ButtonSelectWidget( {
				items: [
					new OO.ui.ButtonOptionWidget( {
						data: "always",
						label: HanAssist.conv({
							hans: "总是",
							hant: "總是"
						}),
						title: HanAssist.conv({
							hans: "当页面存在设定语言版本时，总是在启动后检查其专题横幅",
							hant: "當頁面存在設定語言版本時，總是在啟動後檢查其專題橫幅"
						})
					} ),
					new OO.ui.ButtonOptionWidget( {
						data: "noLocal",
						label: HanAssist.conv({
							hans: "本地无专题时",
							hant: "本地無專題時"
						}),
						title: HanAssist.conv({
							hans: "仅当本地没有专题横幅时，才检查其他语言版",
							hant: "僅當本地沒有專題橫幅時，才檢查其他語言版"
						})
					} ),
					new OO.ui.ButtonOptionWidget( {
						data: "off",
						label: HanAssist.conv({
							hans: "从不",
							hant: "從不"
						}),
						title: HanAssist.conv({
							hans: "不自动获取其他语言版专题横幅",
							hant: "不自動取得其他語言版專題橫幅"
						})
					} )
				]
			}).selectItemByData("off"),
			label: HanAssist.conv({
				hans: "启动后自动获取其他语言版专题横幅",
				hant: "啟動後自動取得其他語言版專題橫幅"
			})
		},
		"skipCloseConfirmation": {
			input: new OO.ui.ToggleSwitchWidget(),
			label: HanAssist.conv({
				hans: "关闭时不显示确认提示",
				hant: "關閉時不顯示確認提示"
			})
		},
		"allowBackgroundInteraction": {
			input: this.allowBackgroundToggle,
			label: HanAssist.conv({
				hans: "对话框打开时允许点击背景内容",
				hant: "對話框開啟時允許點選背景內容"
			}),
			title: HanAssist.conv({
				hans: "开启后 Rater 对话框为非模态，可点击背景页面中的链接等内容；切换开关即时生效",
				hant: "開啟後 Rater 對話框為非模態，可點選背景頁面中的連結等內容；切換開關即時生效"
			})
		},
		"resetCache": {
			input: new OO.ui.ButtonWidget( {
				label: HanAssist.conv({
					hans: "重置缓存",
					hant: "重設快取"
				}),
				title: HanAssist.conv({
					hans: "重置缓存数据，其中包括维基专题列表和模板参数",
					hant: "重設快取資料，其中包括維基專題列表和模板參數"
				}),
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

	const userName = mw.config.get("wgUserName");
	const prefsPageTitle = userName ? `User:${userName}/raterPrefs.json` : null;
	const saveNoteLabel = prefsPageTitle
		? $("<span>").append(
			HanAssist.conv({
				hans: "设置将保存到",
				hant: "設定將儲存到"
			}),
			$("<a>").attr(
				"href",
				`${mw.config.get("wgServer")}/wiki/${encodeURIComponent(prefsPageTitle)}`
			).text(prefsPageTitle)
		)
		: HanAssist.conv({
			hans: "您未登录，设置无法保存。",
			hant: "您尚未登入，無法儲存設定。"
		});
	const saveNote = new OO.ui.LabelWidget({label: saveNoteLabel});
	saveNote.$element.css({"color": "#777", "font-size": "0.9em"});
	this.layout.addItems([saveNote]);

	this.preferences.resetCache.input.connect(this, {"click": "onResetCacheClick"});
}
OO.inheritClass( PrefsFormWidget, OO.ui.Widget );

PrefsFormWidget.prototype.setPrefValues = function(prefs) {
	for (let prefName in prefs ) {
		let value = prefs[prefName];
		let prefDef = this.preferences[prefName];
		if (prefDef && prefDef.toggle) {
			prefDef.toggle.setValue(value);
			continue;
		}
		let input = prefDef && prefDef.input;
		switch (input && input.constructor.name) {
		case "OoUiButtonSelectWidget":
			input.selectItemByData(value);
			break;
		case "OoUiNumberInputWidget":
		case "OoUiToggleSwitchWidget":
			input.setValue(value);
			break;
		case "OoUiTextInputWidget":
			input.setValue(value);
			break;
		case "MwWidgetsNamespacesMultiselectWidget":
			input.clearItems();
			value.forEach(ns =>
				input.addTag(
					ns.toString(),
					ns === 0
						? HanAssist.conv({
	hans: "条目",
	hant: "條目"
})
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
		if (this.preferences[prefName].toggle) {
			value = this.preferences[prefName].toggle.getValue();
		} else {
			switch (input.constructor.name) {
			case "OoUiButtonSelectWidget":
				value = input.findSelectedItem().getData();
				break;
			case "OoUiToggleSwitchWidget":
				value = input.getValue();
				break;
			case "OoUiTextInputWidget":
				value = input.getValue();
				break;
			case "OoUiNumberInputWidget":
				value = Number(input.getValue()); // widget uses strings, not numbers!
				break;
			case "MwWidgetsNamespacesMultiselectWidget":
				value = input.getValue().map(Number); // widget uses strings, not numbers!
				break;
			}
		}
		prefs[prefName] = value;
	}
	return prefs;
};

PrefsFormWidget.prototype.onResetCacheClick = function() {
	OO.ui.confirm(HanAssist.conv({
	hans: "重置缓存后，Rater 程序将关闭并重启。已进行但未保存的更改将被放弃。",
	hant: "在重設快取後，工具將自動重新啟動。此前未發布的變更將被捨棄。"
}))
		.then(confirmed => {
			if (confirmed) { 
				this.emit("resetCache");
			}
		});
};

PrefsFormWidget.prototype.onAllowBackgroundToggleChange = function() {
	this.emit("applyAllowBackgroundInteraction", this.allowBackgroundToggle.getValue());
};

export default PrefsFormWidget;
// </nowiki>