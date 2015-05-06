// __BEGIN_LICENSE__
//Copyright (c) 2015, United States Government, as represented by the 
//Administrator of the National Aeronautics and Space Administration. 
//All rights reserved.
//
//The xGDS platform is licensed under the Apache License, Version 2.0 
//(the "License"); you may not use this file except in compliance with the License. 
//You may obtain a copy of the License at 
//http://www.apache.org/licenses/LICENSE-2.0.
//
//Unless required by applicable law or agreed to in writing, software distributed 
//under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR 
//CONDITIONS OF ANY KIND, either express or implied. See the License for the 
//specific language governing permissions and limitations under the License.
// __END_LICENSE__

app.views = app.views || {};

app.views.ToolbarView = Backbone.Marionette.ItemView.extend({
    template: '#template-toolbar',
    events: {
        'click #btn-save': function() { },
        'click #btn-saveas': function() { this.showSaveAsDialog(); },
        'click #btn-undo': function() { app.Actions.undo(); },
        'click #btn-redo': function() { app.Actions.redo(); }
    },

    initialize: function() {
        this.listenTo(app.vent, 'mapmode', this.ensureToggle);
    },

    onShow: function() {
        if (!app.State.mapHeightSet) {
            var offset = this.$el.height() +
                parseFloat(this.$el.parent().css('margin-top')) +
                parseFloat(this.$el.parent().css('margin-bottom')) +
                10; // this exact number is needed because jquery ui uses
            // elements with absolute positioning for the resize handles
            var pageContentElement = $('#page-content');
            var oldMapHeight = app.map.$el.height();
            var initialHeight = oldMapHeight - offset;
            app.map.$el.height(initialHeight);
            app.map.$el.css('max-height', initialHeight + 'px');
            $(window).bind('resize', function() {
                app.map.$el.css('max-height', (pageContentElement.height() - offset) + 'px');
            });
            app.State.mapHeightSet = true;
        }
    },

    onRender: function() {
        if (app.Actions.undoEmpty()) {
            this.disableUndo();
        } else {
            this.enableUndo();
        }
        if (app.Actions.redoEmpty()) {
            this.disableRedo();
        } else {
            this.enableRedo();
        }
    },

    disableForReadOnly: function() {
        this.$('#btn-save').attr('disabled', 'true');
    },

    disableUndo: function() {
        this.$('#btn-undo').attr('disabled', 'true');
    },

    disableRedo: function() {
        this.$('#btn-redo').attr('disabled', 'true');
    },

    enableUndo: function() {
        this.$('#btn-undo').removeAttr('disabled');
    },

    enableRedo: function() {
        this.$('#btn-redo').removeAttr('disabled');
    },

    ensureToggle: function(modeName) {
        var btn = $('#btn-' + modeName);
        if (! btn.hasClass('active')) { 
            btn.prop("checked", true); 
            btn.addClass('active');
        }
        // turn off the others
        btn.siblings().each(function() {
            $(this).prop("checked", false);
            $(this).removeClass("active");
        });
    },

    updateSaveStatus: function(eventName) {
        var msgMap = {
            'change': 'Unsaved changes.',
            'sync': 'Plan saved.',
            'error': 'Save error.',
            'clear': '',
            'readOnly': 'Plan is LOCKED.'
        };
        if (app.options.readOnly) {
            eventName = 'readOnly';
        }
        if (eventName == 'change') {
            app.dirty = true;
        } else if (eventName == 'sync') {
            app.dirty = false;
        }

        var msg = msgMap[eventName];
        this.$el.find('#save-status').text(msg);
        if (eventName == 'change' || eventName == 'error' || eventName == 'readOnly') {
            this.$el.find('#save-status').addClass('notify-alert');
        } else {
            this.$el.find('#save-status').removeClass('notify-alert');
        }
    },

    updateTip: function(eventName) {
        var msgMap = {
            'edit': 'Shift click to delete stations, click & drag the blue dot to edit.',
            'add': 'Click to add stations to end.  Double-click last station.',
            'clear': 'Click and drag to pan map.'
        };
        var msg = msgMap[eventName];
        this.$el.find('#tip-status').text(msg);
    },

    refreshSaveAs: function(model, response) {
        var text = response.responseText;
        if (response.data != null) {
            var newId = response.data;
            if (newId != null) {
                document.location.href = newId;
            } else {
                app.vent.trigger('sync');
            }
        } else {
            app.vent.trigger('sync');
        }
    },

    
    showSaveAsDialog: function() {
    }

});


app.views.HideableRegion = Backbone.Marionette.Region.extend({
    close: function() {
        Backbone.Marionette.Region.prototype.close.call(this);
        this.ensureEl();
        this.$el.hide();
    },
    show: function(view) {
        Backbone.Marionette.Region.prototype.show.call(this, view);
        this.$el.show();
    }
});


app.views.LayerInfoTabView = Backbone.Marionette.ItemView.extend({
	template: '#template-layer-info',
	initialize: function() {
	},
	serializeData: function() {
		var data = this.model.toJSON();
		return data;
	}
});


app.views.FeaturePropertiesForm = Backbone.Marionette.ItemView.extend({
	template: '#template-feature-properties',
	serializeData: function() {
		var data = this.model.toJSON();
		console.log("this.model is", this.model)
		//TODO: add more later
		return data;
	}
});


app.views.FeaturesHeaderView = Backbone.Marionette.ItemView.extend({
    template: '#template-features-header'
});

app.views.FeaturePropertiesHeaderView = Backbone.Marionette.ItemView.extend({
    template: '#template-feature-properties-header'
});

app.views.NoFeaturesView = Backbone.Marionette.ItemView.extend({
    template: '#template-no-features'
});

app.views.FeatureListItemView = Backbone.Marionette.ItemView.extend({
    // The list item is a simple enough DOM subtree that we'll let the view build its own root element.
    tagName: 'li',
    initialize: function(options) {
        this.options = options || {};
        app.views.makeExpandable(this, this.options.expandClass);
    },
    template: function(data) {
        //return '' + data.model.toString()+ ' <i/>';
    	return '{model.toString} <i/>'.format(data);
    },
    serializeData: function() {
        var data = Backbone.Marionette.ItemView.prototype.serializeData.call(this, arguments);
        data.model = this.model; // give the serialized object a reference back to the model
        data.view = this; // and view
        return data;
    },
    attributes: function() {
        return {
            'data-item-id': this.model.cid,
            'class': this.model.get('type').toLowerCase() + '-sequence-item'
        };
    },
    events: {
        click: function() {
            this.expand();
        }
    },
    modelEvents: {
        'change': 'render'
    }
});


app.views.FeatureElementItemView = app.views.FeatureListItemView.extend({
    events: {
        click: function() {
            app.State.metaExpanded = true;
            app.State.featureSelected = undefined;
            this.expand();
            app.vent.trigger('showFeature', this.model);
        }
    },
    onExpand: function() {

    },
    serializeData: function() {
        var data = app.views.FeatureListItemView.prototype.serializeData.call(this, arguments);
        if (this.model.get('type') == 'Station') {
            data.timing = app.util.minutesToHMS("dummy duration");
        } else {
            data.timing = '+' + app.util.minutesToHMS("dummy duration");
        }
        return data;
    }

});


app.views.FeatureCollectionView = Backbone.Marionette.CollectionView.extend({
	tagName: 'ul',
	className: 'feature-list',
	childView: app.views.FeatureElementItemView,
	childViewOptions: {
		expandClass: 'col1'
	},
	
	emptyView: app.views.NoFeaturesView,
	
	initialize: function(options) {
		this.options = options || {};
		this.on('childview:expand', this.onItemExpand, this);
	},
	
	onItemExpand: function(childView) {
        app.State.featureSelected = childView.model;
    },
        
    onClose: function() {
        this.children.each(function(view) {
            view.close();
        });
    }
});


app.views.FeaturesTabView = Backbone.Marionette.LayoutView.extend({
	template: '#template-features-view',
	
    regions: {
        //Column Headings
        colhead1: '#colhead1',
        colhead2: '#colhead2',

        //Column content
        col1: '#col1',
        col2: {
            selector: '#col2',
            regionType: app.views.HideableRegion
        }
    },
	
    initialize: function() {
    	this.listenTo(app.vent, 'showFeature', this.showFeature, this)
        this.listenTo(app.vent, 'showNothing', this.showNothing, this);
    },
    
    onClose: function() {
    	this.stopListening();
    },
    
    onRender: function() {
        try {
            this.colhead1.close();
            this.col1.close();
            this.col2.close();
        } catch (err) { 
        	
        }
    	var headerView = new app.views.FeaturesHeaderView({});
    	this.colhead1.show(headerView);

    	//create a sub view that shows all features 
    	//and show on col1 (this.col1.show(subview)) <-- see planner PlanSequenceView.
    	var featureCollectionView = new app.views.FeatureCollectionView ({
			collection: app.mapLayer.get('feature')
    	});
    	
    	try {
    		this.col1.show(featureCollectionView);
    	} catch (exception) {
    		console.log(exception)
    	}
    },
    
    showFeature: function(itemModel) {
    	console.log("inside show Feature")
    	var headerView = new app.views.FeaturePropertiesHeaderView({});
    	this.colhead2.show(headerView);
    	try {
    		this.col2.close();
    	} catch (ex) {
    	}
    	var view = new app.views.FeaturePropertiesForm({model: itemModel, readonly: false });
    	this.col2.show(view);
    	
    },
    
    showNothing: function() {
        // clear the columns
        try {
            this.col2.close();
            this.col3.close();
            this.colhead2.close();
            this.colhead3.close();
        } catch (ex) {
            
        }
    }
});


app.views.makeExpandable = function(view, expandClass) {
    /*
     * Call this on a view to indicate it is a expandable item in the three-column layout.
     * When the view's 'expand' event is triggered, it will display it's chevron and trigger
     * the global 'viewExpanded' event.  On recieving a global 'viewExpoanded' event with an
     * expandClass that matches its own, the view will remove it's chevron.
     */
    if (app.currentTab != 'features') {
        // memory leak work around
        return;
    }
    
    console.log("inside make expandable");
    var expandable = {
        expand: function() {
            this.trigger('expand');
        },
        _expand: function() {
            var expandClass = this.options.expandClass;
            this.expanded = true;
            this._addIcon();
            app.vent.trigger('viewExpanded', this, expandClass);
            if (!_.isUndefined(this.onExpand) && _.isFunction(this.onExpand)) {
                this.onExpand();
            }
        },
        unexpand: function() {
            this.expanded = false;
            this.$el.find('i').removeClass('icon-play');
        },
        onExpandOther: function(target, expandClass) {
            if (this.options.expandClass === expandClass && this != target && target.isClosed != true) {
                this.unexpand();
            }
        },
        _ensureIcon: function() {
            if (view.$el.find('i').length == 0) {
                view.$el.append('<i/>');
            }
        },
        _restoreIcon: function() {
            if (this.expanded) {
                this._addIcon();
            }
        },
        _addIcon: function() {
            this._ensureIcon();
            this.$el.find('i').addClass('icon-play');
        },
        onClose: function() {
            this.stopListening();
        }
    };
    view = _.defaults(view, expandable);
    view.options = _.defaults(view.options, {expandClass: expandClass});
    view.listenTo(app.vent, 'viewExpanded', view.onExpandOther, view);
    view.on('expand', view._expand, view);
    view.on('render', view._restoreIcon, view);
};


app.views.EditingToolsView = Backbone.Marionette.ItemView.extend({
	template: '#template-editing-tools',
	initialize: function() {
		var map = app.map.map;
		featureOverlay = new ol.FeatureOverlay({
		  style: new ol.style.Style({
		    fill: new ol.style.Fill({
		      color: 'rgba(255, 255, 255, 0.2)'
		    }),
		    stroke: new ol.style.Stroke({
		      color: '#ffcc33',
		      width: 2
		    }),
		    image: new ol.style.Circle({
		      radius: 7,
		      fill: new ol.style.Fill({
		        color: '#ffcc33'
		      })
		    })
		  })
		});
		featureOverlay.setMap(map);

		var modify = new ol.interaction.Modify({
		  features: featureOverlay.getFeatures(),
		  // the SHIFT key must be pressed to delete vertices, so
		  // that new vertices can be drawn at the same position
		  // of existing vertices
		  deleteCondition: function(event) {
		    return ol.events.condition.shiftKeyOnly(event) &&
		        ol.events.condition.singleClick(event);
		  }
		});
		
		map.addInteraction(modify);
	},
	onRender: function(){

	}

});


app.views.TabNavView = Backbone.Marionette.LayoutView.extend({
    template: '#template-tabnav',
    regions: {
        tabTarget: '#tab-target',
        tabContent: '#tab-content'
    },
    events: {
        'click ul.tab-nav li': 'clickSelectTab'
    },

    viewMap: {
    	'info': app.views.LayerInfoTabView,
    	'features': app.views.FeaturesTabView,
    	'layers': app.views.FancyTreeView
    },

    initialize: function() {
        this.on('tabSelected', this.setTab);
        this.listenTo(app.vent, 'setTabRequested', function(tabId) {
            this.setTab(tabId);
        });
        this.layersView = null;
    },

    onRender: function() {
        if (! this.options.initialTab) {
            this.options.initialTab = 'info';
        }
        if (!_.isUndefined(app.currentTab)) {
            this.trigger('tabSelected', app.currentTab);
        } else {
            this.trigger('tabSelected', this.options.initialTab);
        }
    },

    clickSelectTab: function(event) {
        var newmode = $(event.target).parents('li').data('target');
        this.trigger('tabSelected', newmode);
    },

    setTab: function(tabId) {
    	 var oldTab = app.currentTab;
         app.currentTab = tabId;
         if (oldTab == tabId){
             return;
         }
    	
        var $tabList = this.$el.find('ul.tab-nav li');
        $tabList.each(function() {
            li = $(this);
            if (li.data('target') === tabId) {
                li.addClass('active');
            } else {
                li.removeClass('active');
            }
        });
        var viewClass = this.viewMap[tabId];
        if (! viewClass) { return undefined; }
        var view = new viewClass({
            model: app.mapLayer
        });
        if (oldTab == 'layers'){
            this.tabContent.show(view, {preventClose: true});
        } else {
            if (tabId == 'layers'){
                if (!_.isNull(this.layersView)){
                    this.tabContent.show(this.layersView);
                } else {
                    this.layersView = view;
                    this.tabContent.show(view);
                }
            } else {
                this.tabContent.show(view);
            }
        }
        
        app.vent.trigger('tab:change', tabId);
    }
});
