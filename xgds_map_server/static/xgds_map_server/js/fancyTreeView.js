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

app.views.FancyTreeView = Backbone.View.extend({
    template: '#template-layer-tree',
    initialize: function() {
        this.listenTo(app.vent, 'refreshTree', function() {this.refreshTree()});
        this.listenTo(app.vent, 'treeData:loaded', function() {this.createTree()});
        
        var source = $(this.template).html();
        if (_.isUndefined(source))
            this.template = function() {
                return '';
            };
        else {
            this.template = Handlebars.compile(source);
        }
        _.bindAll(this, 'render', 'afterRender'); 
        var _this = this; 
        this.render = _.wrap(this.render, function(render) { 
            render(); 
            _this.afterRender(); 
            return _this; 
        }); 
        this.storedParent = null;
    },
    render: function() {
        if (!_.isUndefined(app.tree) && !_.isNull(this.storedParent)){
            // rerender existing tree
            this.storedParent.append(this.$el);
            this.$el.show();
        } else {
            this.$el.html(this.template());
        }
    },
    afterRender: function() {
        app.vent.trigger('layerView:onRender');
        if (!_.isUndefined(app.tree)) {
            // rerendering tree
            return;
        }
        this.createTree();
        return;
    },
    refreshTree: function() {
        if (!_.isUndefined(app.tree)){
            app.tree.reload({
                url: app.options.layerFeedUrl
            }).done(function(){
                //TODO implement
                app.vent.trigger('layerView:reloadLayers');
            });
        }
    },
    destroy: function() {
      // don't really destroy
        this.$el.hide();
    },
    close: function() {
      // we don't really want to close!
    },
    createTree: function() {
        if (_.isUndefined(app.tree) && !_.isUndefined(app.treeData)){
            var layertreeNode = this.$el.find("#layertree");
            var mytree = layertreeNode.fancytree({
                extensions: ["persist"],
                source: app.treeData,
                checkbox: true,
                dblclick: function(event, data) {
                    var win = window.open(data.node.data.href, '_edit');
                },
                select: function(event, data) {
                    if (!_.isUndefined(data.node.data.kmlFile)){
                        if (_.isUndefined(data.node.kmlLayerView)) {
                            // make a new one
                            app.vent.trigger('kmlNode:create', data.node);
                        } else {
                            data.node.kmlLayerView.render();
                        }
                    } else if (!_.isUndefined(data.node.data.layerData)){
                        if (_.isUndefined(data.node.mapLayerView)) {
                            // make a new one
                            app.vent.trigger('mapLayerNode:create', data.node);
                        } else {
                            data.node.mapLayerView.render();
                        }
                    }
                  },
                  persist: {
                      // Available options with their default:
                      cookieDelimiter: "~",    // character used to join key strings
                      cookiePrefix: undefined, // 'fancytree-<treeId>-' by default
                      cookie: { // settings passed to jquery.cookie plugin
                        raw: false,
                        expires: "",
                        path: "",
                        domain: "",
                        secure: false
                      },
                      expandLazy: false, // true: recursively expand and load lazy nodes
                      overrideSource: true,  // true: cookie takes precedence over `source` data attributes.
                      store: "auto",     // 'cookie': use cookie, 'local': use localStore, 'session': use sessionStore
                      types: "active expanded focus selected"  // which status types to store
                    }
            });
            app.tree = layertreeNode.fancytree("getTree");
            this.storedParent = this.$el.parent();
            app.vent.trigger('tree:loaded');
        }
    }

    
});

