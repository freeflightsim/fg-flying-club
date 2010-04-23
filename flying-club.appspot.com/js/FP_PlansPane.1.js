

function FP_PlansPane(){

var self = this;

var recDef = Ext.data.Record.create([
	{name: 'planID'},
	{name: 'cruise'},
	{name: 'dep'},
	{name: 'dest'}
]);

this.store = new Ext.data.JsonStore({
	url: '/rpc/plans/',
	baseParams: {'filter': 'TODO'},
	root: 'plans',
	idProperty: 'planID',
	fields: [ 	'cruise', 'planID',
				'dep', 'dep_airport',
				'dest', 'dest_airport', 
				'comment'
	],
	remoteSort: false,
	sortInfo: {field: "dep_date", direction: 'ASC'}
});

this.store.load();

this.edit_dialog = function(fppID){
	var d = new FP_PlanDialog(fppID, 'schedule');
	d.frm.on("fpp_refresh", function(data){
		self.store.loadData(data);
	});

}
this.actionAdd = new Ext.Button({ text:'Create Plan', iconCls:'icoPlanAdd', 
	handler:function(){
		self.edit_dialog(0);
	}
});
this.actionEdit = new Ext.Button({ text:'View Plan', iconCls:'icoPlan', disabled: true,
	handler:function(){
		if( !self.selModel.hasSelection() ){
			return;
		}
		var record = self.selModel.getSelected();
		self.edit_dialog(record.get('fppID'));
	}
});

this.actionRefresh = new Ext.Action({
	iconCls:'icoRefresh', 
	handler: function(){
		self.load();
	}
});



//***************************************************************
//** Toolbar Filter Buttons / functions
//***************************************************************
this.set_filter = function(button, state){
	if(state){
		Ext.fp.msg('','Not yet implemented');
	}
    button.setIconClass( state ? 'icoFilterOn' : 'icoFilterOff');
};
this.filters = {};
this.filters.curr = new Ext.Button({
    text: 'Current',
    iconCls: 'icoFilterOn',
	enableToggle: true, allowDepress: false,
	pressed: true,
    myFilter: 'current',  toggleHandler: this.set_filter, toggleGroup: 'tbFilter'
});

this.filters.tomorrow = new Ext.Button({
    text: 'Tomorrow',
    iconCls: 'icoFilterOff',
    enableToggle: true, allowDepress: false,
    pressed: false,
    myFilter: 'completed', toggleHandler: this.set_filter, toggleGroup: 'tbFilter'
});
this.filters.after = new Ext.Button({
    text: 'After',
    iconCls: 'icoFilterOff',
    enableToggle: true, allowDepress: false,
    pressed: false,
    myFilter: 'after', toggleHandler: this.set_filter, toggleGroup: 'tbFilter'
});


//***************************************************************
//** Selection
//***************************************************************
this.selModel = new Ext.grid.RowSelectionModel({singleSelect: true});
this.selModel.on("selectionchange", function(selModel){
	self.actionEdit.setDisabled(!selModel.hasSelection())
});



//***************************************************************
//** Renderers
//***************************************************************
this.render_dep = function(v, meta, rec){
	meta.css = 'fpp_dep';
	return v;
}
this.render_dep_date = function(v, meta, rec){
	meta.css = 'fpp_dep';
	return Ext.util.Format.date(v, "H:i - d M");
}
this.render_dep_atc = function(v, meta, rec){
	meta.css = 'fpp_dep';
	var c = v == "" ? 'atc_take' : 'atc_ok';
	var lbl = v == "" ? 'Take' : v;
	return "<span class='" + c + "'>" + lbl + "</span>";
}
this.render_arr = function(v, meta, rec){
	meta.css = 'fpp_arr';
	return v;
}
this.render_arr_date = function(v, meta, rec){
	meta.css = 'fpp_arr';
	return Ext.util.Format.date(v, "H:i - d M");
}
this.render_arr_atc = function(v, meta, rec){
	meta.css = 'fpp_arr';
	var c = v == "" ? 'atc_take' : 'atc_ok';
	var lbl = v == "" ? 'Take' : v;
	return "<a  class='" + c + "' href='javascript:showDialog(\"\");'>" + lbl + "</a>";
}


//********************************************
//**** Placeholder Cols
this.colHeaders = []
this.colHeaders.push({header: 'Icao',  dataIndex:'dep', sortable: true});
this.colHeaders.push({header: 'Dep',  dataIndex:'dep_airport', sortable: true});
this.colHeaders.push({header: 'Icao',  dataIndex:'dest', sortable: true});
this.colHeaders.push({header: 'Dest',  dataIndex:'dest_airport', sortable: true});
this.colHeaders.push({header: 'Cruise',  dataIndex:'cruise', sortable: true});
this.colHeaders.push({header: 'Comment',  dataIndex:'comment', sortable: true});

this.countLabel = new Ext.Toolbar.TextItem({
	text: '-'
});

//***************************************************************
//** Selection
//***************************************************************
this.selModel = new Ext.grid.RowSelectionModel({singleSelect: true});
this.selModel.on("selectionchange", function(selModel){
	self.actionEdit.setDisabled(!selModel.hasSelection())
});

//************************************************
//**  Grid
//************************************************
this.grid = new Ext.grid.GridPanel({
	title: 'Flight Plans',
	iconCls: 'icoPlans',
	autoScroll: true,
	enableHdMenu: false,
	stripeRows: true,
	deferedRender: false,
	sm: this.selModel,
	tbar:[  this.actionAdd, '-', this.actionEdit, '-', 
			'->', this.filters.curr, this.filters.tomorrow, this.filters.after,
			'-', this.actionRefresh
	],
	viewConfig: {emptyText: 'No item scheduled', forceFit: true}, 
	store: this.store,
	loadMask: true,
	columns: this.colHeaders,

	listeners: {},
	bbar: [ this.countLabel, '->'

	]
});
this.grid.on("rowdblclick", function(grid, idx, e){
	var record = self.store.getAt(idx);
	self.edit_dialog(record.get('fppID'));
	
});    
    
this.grid.on("cellclick", function(grid, rowIdx, colIdx, e){
	if(colIdx == 4 || colIdx == 7){
		var record = self.store.getAt(rowIdx);
		self.edit_dialog(record.get('fppID'));
	}
});   


this.load = function(){
	self.store.load();
	return;
	self.grid.getEl().mask("Loading..");
	Ext.Ajax.request({
		url: '/rpc/plans/',
		params: {},
		success: function(response, opts){
			var payload = Ext.decode(response.responseText);
			if(payload.error){
				alert("Error: " + payload.error);
				return;
			}
			self.load_plans(payload);
			self.grid.getEl().unmask();	
		},
		failure: function(response, opts){
			self.grid.getEl().unmask();	
			Ext.fg.msg('OOOPS', 'Something went wrong !');
		}

	});
}

this.load_plans = function(payload){
	
	if(payload.planID){
		planID = payload.planID;
	}else{
		planID = null;
	}
	//console.log('sel', selectedID, self.store.indexOfId(selectedID) );
	//self.rangeLabel.setText(data.start_date + "=" + data.end_date);
	self.store.removeAll();
	colHeaders = [];
	colHeaders.push({header: 'Dep',  dataIndex:'dep', sortable: true, width: 30});
	colHeaders.push({header: 'Dest',  dataIndex:'dest', sortable: true, width: 30});
	colHeaders.push({header: 'Cruise',  dataIndex:'cruise', sortable: true, width: 30});
	for(var i = 0; i < payload.col_len + 1; i++){
		var ki = 'col_' + i;
		colHeaders.push({header: i,  dataIndex: ki, sortable: false, swidth: 20,
								align: 'center', renderer: self.render_cell});
	}
	self.grid.getColumnModel().setConfig(colHeaders);
	var data = payload.plans;
	//var fpp = data.rows;
	for(var r=0; r < data.length; r++){
		var f = data[r]

		var rec = new recDef({
			fppID: f.planID,
			cruise: f.cruise,
			dep: f.dep,
			dest: f.dest
		});
		for(var i =0; i < f.route.length; i++){
			//console.log(i, f.cols[i]);
			var s = f.route[i].ident //+ "|" + f.cols[i].time + "|" + f.cols[i].airport
			rec.set('col_' + i, s);
		}
		
		self.store.add(rec);
	}
	self.countLabel.setText( self.store.getCount() > 0 ? self.store.getCount() + ' plans' : 'No plans');
	if(planID){
		//console.log('sel', selectedID, self.store.indexOfId(selectedID) );
		//TODO wtf why this not work
		self.selModel.selectRow( self.store.indexOfId(planID) );
	}
}
//this.store.load();

} /***  */





