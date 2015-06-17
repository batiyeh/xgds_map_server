app.views.SearchView = Backbone.Marionette.LayoutView.extend({
    template: '#template-search',
    events: {
        'click #getSearchFormButton': 'setupSearchForm',
        'click #doSearch': 'doSearch'
    },
    regions: {
        modelChoiceRegion: '#modelChoiceDiv',
        searchFormRegion: { selector: '#searchFormDiv',
                            regionType: app.views.HideableRegion },
        searchResultsRegion: { selector: '#searchResultsDiv',
                               regionType: app.views.HideableRegion }
    },
    initialize: function() {
        var source = $(this.template).html();
        if (_.isUndefined(source)) {
            this.template = function() {
                return '';
            };
        } else {
            this.template = Handlebars.compile(source);
        }
    },
    onRender: function() {
        var theKeys = Object.keys(app.options.searchModels);
        this.$el.html(this.template({
            searchModels: theKeys
        }));
        this.searchResultsView = new app.views.SearchResultsView({template:'#template-search-results', 
                                                                  region: this.searchResultsRegion})
        this.searchResultsRegion.show(this.searchResultsView);
    },
    setupSearchForm: function() {
        var newModel = this.$("#searchModelSelector").val();
        if (!_.isUndefined(this.selectedModel)){
            if (newModel == this.selectedModel){
                return;
            }
        }
        app.vent.trigger("mapSearch:clear");
        this.searchResultsView.reset();
        this.selectedModel = newModel;
        var templateName = '#template-' + this.selectedModel;
        this.searchFormView = new app.views.SearchFormView({template:templateName})
        this.searchFormRegion.show(this.searchFormView);
        this.$("#form-"+this.selectedModel).on('submit', function(event){
            event.preventDefault();
        });
    },
    doSearch: function() {
        var theForm = this.$("#form-"+this.selectedModel);
        var postData = theForm.serializeArray();
        postData.push({'name':'modelClass', 'value':app.options.searchModels[this.selectedModel].model});
        $.ajax({
            url: '/xgds_map_server/doMapSearch',
            dataType: 'json',
            data: postData,
            success: $.proxy(function(data) {
                this.searchResultsView.updateContents(this.selectedModel, data);
            }, this),
            error: $.proxy(function(data){
                app.vent.trigger("mapSearch:clear");
                this.showDataError(data);
            }, this)
          });
    },
    clearSearch: function() {
        
    }
});

app.views.SearchFormView = Backbone.Marionette.ItemView.extend({
});

app.views.SearchResultsView = Backbone.Marionette.ItemView.extend({
    initialize: function(options){
        this.region = this.options.region;
    },
    updateContents: function(selectedModel, data) {
        if (data.length > 0){
            if (!_.isUndefined(this.theDataTable)) {
                this.theDataTable.fnClearTable();
                this.theDataTable.fnAddData(data);
            } else {
                this.theTable = this.$("#searchResultsTable");
                this.columns = Object.keys(data[0]);
                this.columns = _.difference(this.columns, app.options.searchModels[selectedModel].hiddenColumns);
                var columnHeaders = this.columns.map(function(col){
                    return { data: col}
                });
                var dataTableObj = {
                        data: data,
                        columns: columnHeaders,
                        autoWidth: true,
                        stateSave: false,
                        paging: true,
                        pageLength: 10, 
                        lengthChange: true,
                        ordering: true,
                        jQueryUI: false,
                        scrollY:  this.calcDataTableHeight(),
                        "lengthMenu": [[10, 20, 40, -1], [10, 20, 40, "All"]],
                        "language": {
                            "lengthMenu": "Display _MENU_"
                        }
                }
                this.setupColumnHeaders();
                this.theDataTable = this.theTable.dataTable( dataTableObj );
                this.listenToTableChanges();
                this.filterMapData();
            }
        }
    },
    setupColumnHeaders: function() {
      this.theTable.append('<thead class="table_header"><tr id="columnRow"></tr></thead>');
      var columnRow = this.$('#columnRow');
      $.each(this.columns, function(index, col){
          columnRow.append("<th>"+ col +"</th>");
      });
    },
    listenToTableChanges: function() {
        var _this = this;
        this.$("#searchResultsTable").on( 'page.dt', { _this : this }, function (event) {
            var _this = event.data._this;
            _this.filterMapData();
        });
        this.$("#searchResultsTable").on( 'search.dt', { _this : this },  function (event) {
            var _this = event.data._this;
            _this.filterMapData();
        });
    },
    unListenToTableChanges: function() {
        this.$("#searchResultsTable").off( 'page.dt');
        this.$("#searchResultsTable").off( 'search.dt');
    },
    filterMapData: function() {
        var thedt = this.theDataTable;
        var rowData = thedt.$('tr', {"page": "current", "filter": "applied"} );
        var data = [];
        $.each(rowData, function(index, value){
            var datum = thedt.fnGetData(value);
            if (!_.isUndefined(datum)){
                data.push(datum);
            }
        });
        app.vent.trigger("mapSearch:found", data);  
    },
    calcDataTableHeight : function() {
        var h =  Math.floor($(window).height()*.4);
        return h + 'px';
    },
    reset: function() {
        if (!_.isUndefined(this.theDataTable)) {
            this.unListenToTableChanges();
            this.theDataTable.fnDestroy();
            this.theDataTable = undefined;
            this.$('#searchResultsTable').empty();
        }
    }
});
