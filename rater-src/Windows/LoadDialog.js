import { makeErrorMsg } from "../api";
// <nowiki>

/* var incrementProgressByInterval = function() {
	var incrementIntervalDelay = 100;
	var incrementIntervalAmount = 0.1;
	var incrementIntervalMaxval = 98;
	return window.setInterval(
		incrementProgress,
		incrementIntervalDelay,
		incrementIntervalAmount,
		incrementIntervalMaxval
	);
}; */

var LoadDialog = function LoadDialog( config ) {
	LoadDialog.super.call( this, config );
};
OO.inheritClass( LoadDialog, OO.ui.Dialog ); 

LoadDialog.static.name = "loadDialog";
LoadDialog.static.title = "正在加载 Rater...";

// Customize the initialize() function: This is where to add content to the dialog body and set up event handlers.
LoadDialog.prototype.initialize = function () {
	// Call the parent method.
	LoadDialog.super.prototype.initialize.call( this );
	// Create a layout
	this.content = new OO.ui.PanelLayout( { 
		padded: true,
		expanded: false 
	} );
	// Create content
	this.progressBar = new OO.ui.ProgressBarWidget( {
		progress: 1
	} );
	this.setuptasks = [
		new OO.ui.LabelWidget( {
			label: "加载您的 Rater 设置...",
			$element: $("<p style=\"display:block\">")
		}),
		new OO.ui.LabelWidget( {
			label: "加载项目横幅列表...",
			$element: $("<p style=\"display:block\">")
		}),
		new OO.ui.LabelWidget( {
			label: "加载讨论页内容...",
			$element: $("<p style=\"display:block\">")
		}),
		new OO.ui.LabelWidget( {
			label: "解析讨论页模板...",
			$element: $("<p style=\"display:block\">")
		}),
		new OO.ui.LabelWidget( {
			label: "获取模板参数数据...",
			$element: $("<p style=\"display:block\">")
		}),
		new OO.ui.LabelWidget( {
			label: "检查主题页面...",
			$element: $("<p style=\"display:block\">")
		}),
		new OO.ui.LabelWidget( {
			label: "检索质量估算...",
			$element: $("<p style=\"display:block\">")
		}).toggle(),
	];
	this.closeButton = new OO.ui.ButtonWidget( {
		label: "关闭"
	}).toggle();
	this.setupPromises = [];

	// Append content to layout
	this.content.$element.append(
		this.progressBar.$element,
		(new OO.ui.LabelWidget( {
			label: "正在初始化：",
			$element: $("<strong style=\"display:block\">")
		})).$element,
		...this.setuptasks.map(widget => widget.$element),
		this.closeButton.$element
	);

	// Append layout to dialog
	this.$body.append( this.content.$element );

	// Connect events to handlers
	this.closeButton.connect( this, { "click": "onCloseButtonClick" } );
};

LoadDialog.prototype.onCloseButtonClick = function() {
	// Close this dialog, without passing any data
	this.close();
};

// Override the getBodyHeight() method to specify a custom height (or don't to use the automatically generated height).
LoadDialog.prototype.getBodyHeight = function () {
	return this.content.$element.outerHeight( true );
};

LoadDialog.prototype.incrementProgress = function(amount, maximum) {
	var priorProgress = this.progressBar.getProgress();
	var incrementedProgress = Math.min(maximum || 100, priorProgress + amount);
	this.progressBar.setProgress(incrementedProgress);
};

LoadDialog.prototype.addTaskPromiseHandlers = function(taskPromises) {
	var onTaskDone = index => {
		// Add "Done!" to label
		var widget = this.setuptasks[index];
		widget.setLabel(widget.getLabel() + " 完成！");
		// Increment status bar. Show a smooth transition by
		// using small steps over a short duration.
		var totalIncrement = 100 / this.setuptasks.length; // percent
		var totalTime = 400; // milliseconds
		var totalSteps = 10;
		var incrementPerStep = totalIncrement / totalSteps;

		for ( var step=0; step < totalSteps; step++) {
			window.setTimeout(
				this.incrementProgress.bind(this),
				totalTime * step / totalSteps,
				incrementPerStep
			);
		}
	};
	var onTaskError = (index, code, info) => {
		var widget = this.setuptasks[index];
		widget.setLabel(
			widget.getLabel() + "失败。" + makeErrorMsg(code, info)
		);
		this.closeButton.toggle(true);
		this.updateSize();
	};
	taskPromises.forEach(function(promise, index) {
		promise.then(
			() => onTaskDone(index),
			(code, info) => onTaskError(index, code, info)
		);
	});
};

// Use getSetupProcess() to set up the window with data passed to it at the time 
// of opening
LoadDialog.prototype.getSetupProcess = function ( data ) {
	data = data || {};
	return LoadDialog.super.prototype.getSetupProcess.call( this, data )
		.next( () => {
			var showOresTask = !!data.ores;
			this.setuptasks[6].toggle(showOresTask);
			var taskPromises = data.ores ? data.promises : data.promises.slice(0, -1);
			data.isOpened.then(() => this.addTaskPromiseHandlers(taskPromises));
		}, this );
};

// Prevent window from closing too quickly, using getHoldProcess()
LoadDialog.prototype.getHoldProcess = function ( data ) {
	data = data || {};
	if (data.success) {
		// Wait a bit before processing the close, which happens automatically
		return LoadDialog.super.prototype.getHoldProcess.call( this, data )
			.next(800);
	}
	// No need to wait if closed manually
	return LoadDialog.super.prototype.getHoldProcess.call( this, data );
};

// Use the getTeardownProcess() method to perform actions whenever the dialog is closed. 
LoadDialog.prototype.getTeardownProcess = function ( data ) {
	return LoadDialog.super.prototype.getTeardownProcess.call( this, data )
		.first( () => {
		// Perform cleanup: reset labels
			this.setuptasks.forEach( setuptask => {
				var currentLabel = setuptask.getLabel();
				setuptask.setLabel(
					currentLabel.slice(0, currentLabel.indexOf("...")+3)
				);
			} );
		}, this );
};

export default LoadDialog;
// </nowiki>