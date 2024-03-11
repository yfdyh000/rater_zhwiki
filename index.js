/***************************************************************************************************
 Rater --- by Evad37
 > Helps assess WikiProject banners.

 This script is a loader that will load the actual script from the /app.js subpage
 once Resource loader modules are loaded and the page DOM is ready.
 Source code is available at https://github.com/evad37/rater
***************************************************************************************************/
// <nowiki>
$.when(
	// Resource loader modules
	mw.loader.using([
		"mediawiki.util", "mediawiki.api", "mediawiki.Title",
		"oojs-ui-core", "oojs-ui-widgets", "oojs-ui-windows",
		"oojs-ui.styles.icons-content", "oojs-ui.styles.icons-interactions",
		"oojs-ui.styles.icons-moderation", "oojs-ui.styles.icons-editing-core",
		"mediawiki.widgets", "mediawiki.widgets.NamespacesMultiselectWidget",
		"ext.gadget.HanAssist"
	]),
	// Page ready
	$.ready
).then(function(require) {
	var conf = mw.config.get(["wgNamespaceNumber", "wgPageName"]);
	// Do not operate on Special: pages, nor on non-existent pages or their talk pages
	if ( conf.wgNamespaceNumber < 0 || $("li.new[id|=ca-nstab]").length ) {
		return;
	}
	// Do not operate on top-level User and User_talk pages (only on subpages)
	if (
		conf.wgNamespaceNumber >= 2 &&
		conf.wgNamespaceNumber <= 3 &&
		conf.wgPageName.indexOf("/") === -1
	) {
		return;
	}
	var HanAssist = require('ext.gadget.HanAssist');
	// #region HanAssist Transfer
	// 傳遞 HanAssist
	// 將會在 rater-src/HanAssist.js 被取用
	mw.libs.RATER_ZHWIKI_HA = HanAssist;
	// #/region HanAssist Transfer
	// Otherwise, load the rest of the script.
	// Get the title using template substitution (so the same source file be used on both main and sandbox scripts)
	var title = /* </nowiki> */ "{{subst:str crop|{{subst:FULLPAGENAMEE}}|3}}/app.js"; /* <nowiki> */
	mw.loader.load( "https://zh.wikipedia.org/w/index.php?title="+title+"&action=raw&ctype=text/javascript" );
});
// </nowiki>