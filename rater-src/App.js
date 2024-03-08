import setupRater from "./setup";
import autoStart from "./autostart";
import styles from "./css.js";
import { makeErrorMsg } from "./api";
import windowManager from "./windowManager";
import HanAssist from "./HanAssist";
// <nowiki>

(function App() {
	let stylesheet;

	const showMainWindow = data => {
		if (!data || !data.success) {
			return;
		}
		if (stylesheet) {
			stylesheet.disabled = false;
		} else {
			stylesheet = mw.util.addCSS(styles);
		}
		// Add css class to body to enable background scrolling
		document.getElementsByTagName("body")[0].classList.add("rater-mainWindow-open");
		// Open the window
		windowManager.openWindow("main", data)
			.closed.then( result => {
				// Disable/remove the css styles, so as to not interfere with other scripts/content/OOUI windows
				if (stylesheet) { stylesheet.disabled = true; }
				document.getElementsByTagName("body")[0].classList.remove("rater-mainWindow-open");
				// Restart if needed
				if (result && result.restart) {
					windowManager.removeWindows(["main"])
						.then(setupRater)
						.then(showMainWindow, showSetupError);
					return;
				}
				// Show notification when saved successfully
				if (result && result.success) {
					const $message = $("<span>").append(
						$("<strong>").text(HanAssist.conv({
							hans: "成功储存评级结果。",
							hant: "成功儲存評級結果。"
						}))
					);
					if (result.upgradedStub) {
						$message.append(
							$("<br>"),
							// TODO: There should be a link that will edit the article for you
							$("<span>").text(HanAssist.conv({
								hans: "注意，条目似乎是一个小作品。",
								hant: "注意，條目似乎是一個小作品。"
							}))
						);
					}
					mw.notify(
						$message,
						{
							autoHide: true,
							autoHideSeconds: "long",
							tag: HanAssist.conv({
								hans: "成功储存评级结果。",
								hant: "成功儲存評級結果。"
							})
						}
					);
				}
			} );
	};

	const showSetupError = (code, jqxhr) => OO.ui.alert(
		makeErrorMsg(code, jqxhr),	{
			title: HanAssist.conv({
				hans: "Rater 工具打开失败",
				hant: "Rater 工具無法開啟"
			})
		}
	);

	// Invocation by portlet link 
	if($("#ca-rater").length === 0) {
		let area = "";
		switch (mw.config.get('skin')) {
		case 'vector':
			area = 'p-views';
			break;
		case 'minerva': // Mobile skin
			area = 'p-tb';
			break;
		default:
			area = 'p-cactions';
			break;
		}
		mw.util.addPortletLink(
			area,
			"#",
			HanAssist.conv({
				hans: "评级",
				hant: "評級"
			}),
			"ca-rater",
			HanAssist.conv({
				hans: "为页面进行品质与重要度评级",
				hant: "為頁面進行質量與重要度評級",
				tw: "為頁面進行品質與重要度評級"
			}),
			"5"
		);
		$("#ca-rater").click(event => {
			event.preventDefault();
			setupRater().then(showMainWindow, showSetupError);
		});
	}

	// Invocation by auto-start (do not show message on error)
	autoStart().then(showMainWindow);
})();
// </nowiki>