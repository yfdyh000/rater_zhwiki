import HanAssist from "../../HanAssist";
// <nowiki>

/**
 * @cfg {OO.ui.Element[]} items Items to be added
 * @cfg {Number} displayLimit The most to show at once. If the number of items
 *  is more than this, then only the first (displayLimit - 1) items are shown.
 */
var ParameterListWidget = function ParameterListWidget( config ) {
	config = config || {};

	// Call parent constructor
	ParameterListWidget.parent.call( this, config );
	OO.ui.mixin.GroupElement.call( this, {
		$group: this.$element
	} );
	this.addItems( config.items );

	this.$element.addClass("rater-parameterListWidget");
    
	this.preferences = config.preferences;
   
	// Hide some parameters (initially), if more than set display limit -- which is the 
	// one more than collapseParamsLowerLimit, to prevent only one param being hidden
	// (mostly: may occasionally occur if params were auto-filled).
	let displayLimit = this.preferences.collapseParamsLowerLimit + 1;
	if (displayLimit && this.items.length > displayLimit ) {
		var hideFromNumber = displayLimit - 1; // One-indexed
		var hideFromIndex = hideFromNumber - 1; // Zero-indexed
		var hiddenCount = 0;
		for (let i = hideFromIndex; i < this.items.length; i++) {
			if (!this.items[i].autofilled) { // Don't hide auto-filled params
				this.items[i].toggle(false);
				hiddenCount++;
			}
		}
		if (hiddenCount>0) {
			// Add button to show the hidden params
			this.showMoreParametersButton = new OO.ui.ButtonWidget({
				label: HanAssist.conv({
	hans: "显示额外",
	hant: "顯示其他"
}) + hiddenCount + HanAssist.conv({
	hans: "个参数",
	hant: "個參數"
}),
				framed: false,
				$element: $("<span style='margin-bottom:0'>")
			});
			this.addItems([this.showMoreParametersButton]);
		}
	}

	// Add the button that allows user to add more parameters
	this.addParametersButton = new OO.ui.ButtonWidget({
		label: HanAssist.conv({
	hans: "添加参数",
	hant: "新增參數"
}),
		icon: "add",
		framed: false,
		$element: $("<span style='margin-bottom:0'>")
	});
	this.addItems([this.addParametersButton]);

	/* --- Events --- */

	// Handle delete events from ParameterWidgets
	this.aggregate( { delete: "parameterDelete"	} );
	this.connect( this, { parameterDelete: "onParameterDelete" } );
    
	// Handle change events from ParameterWidgets
	this.aggregate( { change: "parameterChange"	} );
	this.connect( this, { parameterChange: "onParameterChange" } );

	// Handle updatedSize events from ParameterWidgets
	this.aggregate( {"updatedSize": "parameterUpdatedSize"} );
	this.connect( this, {"parameterUpdatedSize": "onUpdatedSize"} );
    
	// Handle button clicks
	if (this.showMoreParametersButton ) {
		this.showMoreParametersButton.connect( this, { "click": "onShowMoreParametersButtonClick" } );
	}
	this.addParametersButton.connect( this, { "click": "onAddParametersButtonClick" } );
};

OO.inheritClass( ParameterListWidget, OO.ui.Widget );
OO.mixinClass( ParameterListWidget, OO.ui.mixin.GroupElement );
/*
methods from mixin:
 - addItems( items, [index] ) : OO.ui.Element  (CHAINABLE)
 - clearItems( ) : OO.ui.Element  (CHAINABLE)
 - findItemFromData( data ) : OO.ui.Element|null
 - findItemsFromData( data ) : OO.ui.Element[]
 - removeItems( items ) : OO.ui.Element  (CHAINABLE)
*/

ParameterListWidget.prototype.onUpdatedSize = function() {
	// Emit an "updatedSize" event so the parent window can update size, if needed
	this.emit("updatedSize");
};

ParameterListWidget.prototype.addItems = function ( items, index ) {
	if ( items.length === 0 ) {
		return this;
	}

	// Call mixin method to do the adding
	OO.ui.mixin.GroupElement.prototype.addItems.call( this, items, index );

	// emit updatedSize event 
	this.onUpdatedSize();

	return this;
};	

ParameterListWidget.prototype.onParameterDelete = function(parameter) {
	this.removeItems([parameter]);
	this.emit("change");
};

ParameterListWidget.prototype.onParameterChange = function() {
	this.emit("change");
};

ParameterListWidget.prototype.getParameterItems = function() {
	return this.items.filter(item => item.constructor.name === "ParameterWidget");
};

ParameterListWidget.prototype.onShowMoreParametersButtonClick = function() {
	this.removeItems([this.showMoreParametersButton]);
	this.items.forEach(parameterWidget => parameterWidget.toggle(true));
	this.onUpdatedSize();
};

ParameterListWidget.prototype.onAddParametersButtonClick = function() {
	this.removeItems([this.addParametersButton]);
	this.emit("addParametersButtonClick");
};

ParameterListWidget.prototype.makeWikitext = function(pipeStyle, equalsStyle) {
	return this.getParameterItems()
		.map(parameter => parameter.makeWikitext(pipeStyle, equalsStyle))
		.join("");
};

ParameterListWidget.prototype.setPreferences = function(prefs) {
	this.preferences = prefs;
	var params = this.getParameterItems();
	// Unhide some parameters of the collapseParamsLowerLimit has increased.
	// (Not hiding any if it decreased, since it's a *lower* limit of what needs to be shown.)
	if ( params.length <= this.preferences.collapseParamsLowerLimit ) {
		return;
	}
	var hiddenParams = params.filter(param => !param.isVisible());
	var visibleParamsCount = params.length - hiddenParams.length;
	if (
		hiddenParams === 0 ||
        visibleParamsCount >= this.preferences.collapseParamsLowerLimit
	) {
		return;
	}
	var numToUnhide = Math.min(
		this.preferences.collapseParamsLowerLimit - visibleParamsCount,
		hiddenParams.length
	);
	for (let i = 0; i < numToUnhide; i++) {
		hiddenParams[i].toggle(true);
	}
	var stillHiddenCount = hiddenParams.length - numToUnhide;
	if (stillHiddenCount === 0) {
		this.removeItems([this.showMoreParametersButton]);
	} else {
		this.showMoreParametersButton.setLabel(
			HanAssist.conv({
	hans: "显示额外",
	hant: "顯示其他"
}) + stillHiddenCount + HanAssist.conv({
	hans: "个参数",
	hant: "個參數"
}),
		);
	}
};

export default ParameterListWidget;
// </nowiki>