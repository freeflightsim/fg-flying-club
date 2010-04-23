

function TL_Grid(){

var self = this;
this.selectedID = null;


//********************************************
//**** Store
var recDef = Ext.data.Record.create([
	{name: 'fppID'},
	{name: 'callsign'},
	{name: 'dep'},
	{name: 'arr'}
]);


this.store = new Ext.data.JsonStore({
	root: 'timeline',
	idProperty: 'fppID',
	fields: [ 	'callsign', 'dep', 'arr', 'mode', 'fppID',
				'col_0','col_1', 'col_2', 'col_3', 'col_4', 'col_5', 'col_6', 
				'col_7', 'col_8', 'col_9', 'col_10', 'col_11', 'col_12', 
				'col_13', 'col_14','col_15','col_16','col_17','col_18',
				'col_19','col_20','col_21','col_22','col_23','col_24',
				'col_25','col_26','col_27','col_28','col_29','col_30','col_31','col_32'
	],
	remoteSort: false,
	sortInfo: {field: "dep_date", direction: 'ASC'}
});

//********************************************
//**** Edit + Actions
this.edit_dialog = function(fppID){
	var d = new FP_Dialog(fppID, 'timeline');
	d.frm.on("fpp_refresh", function(data){
		self.load_timeline(data.timeline, data.fppID);
	});

}
this.actionAdd = new Ext.Button({ text:'Add Entry', iconCls:'icoFppAdd', 
	handler:function(){
		self.edit_dialog(0);
	}
});
this.actionEdit = new Ext.Button({ text:'Edit Entry', iconCls:'icoFppEdit', disabled: true,
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
		//self.jobsStore.baseParams.filter = button.myFilter;
		//self.jobsStore.load();
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
this.render_airport = function(v, meta, rec){
	return rec.get('dep') + " - " + rec.get("arr");
} 
this.render_cell = function(v, meta, rec){
	if(!v){
		return;
	}
	var arr = v.split("|");
	if(arr[0] == 'dep'){
		meta.css = 'cell_dep'
		return arr[1];
	}else if (arr[0] == 'arr'){
		meta.css = 'cell_arr'
		return arr[1];
	}else{
		meta.css = 'cell_mid'
		return "&gt;";
	}
	
}

//********************************************
//**** Placeholder Cols
this.colHeaders = []
this.colHeaders.push({header: 'Callsign',  dataIndex:'callsign', sortable: true});
this.colHeaders.push({header: 'Dep',  dataIndex:'dep', sortable: true});
this.colHeaders.push({header: 'Arr',  dataIndex:'arr', sortable: true});
for(var i = 0; i < 26; i++){
	this.colHeaders.push({header: + i ,  dataIndex: 'col_' + i, sortable: false});
}

this.rangeLabel = new Ext.Toolbar.TextItem({
	text: '-'
});
this.countLabel = new Ext.Toolbar.TextItem({
	text: '-'
});


//************************************************
//**  Grid
//************************************************
this.grid = new Ext.grid.GridPanel({
	iconCls: 'icoTimeline',
	title: 'Time Line',
	autoScroll: true,
	enableHdMenu: false,
	layout:'fit',
	stripeRows: true,
	deferedRender: false,
	sm: this.selModel,
	tbar:[  this.actionAdd, '-', this.actionEdit, '-', 
			'->', this.filters.curr, this.filters.tomorrow, this.filters.after,
			'-', this.actionRefresh, 
	],
	viewConfig: {emptyText: 'No item scheduled', forceFit: true}, 
	store: this.store,
	loadMask: true,
	columns: this.colHeaders,

	listeners: {},
	bbar: [ this.countLabel, '->', this.rangeLabel

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
	self.grid.getEl().mask("Loading..");
	Ext.Ajax.request({
		url: '/rpc/timeline/',
		params: {},
		success: function(response, opts){
			var payload = Ext.decode(response.responseText);
			if(payload.error){
				alert("Error: " + payload.error);
				return;
			}
			self.load_timeline(payload.timeline, payload.fppID);
			self.grid.getEl().unmask();	
		},
		failure: function(response, opts){
			self.grid.getEl().unmask();	
			Ext.fg.msg('OOOPS', 'Something went wrong !');
		}

	});
}

this.load_timeline = function(data, xSelectedID){
	return
	if(xSelectedID){
		selectedID = xSelectedID;
	}else{
		selectedID = null;
	}
	//console.log('sel', selectedID, self.store.indexOfId(selectedID) );
	self.rangeLabel.setText(data.start_date + "=" + data.end_date);
	self.store.removeAll();
	colHeaders = [];
	//colHeaders.push({header: 'ID',  dataIndex:'fppID', sortable: true, width: 200});
	colHeaders.push({header: 'Callsign',  dataIndex:'callsign', sortable: true});
	colHeaders.push({header: 'Dep',  dataIndex:'dep', sortable: true, width: 40});
	colHeaders.push({header: 'Arr',  dataIndex:'arr', sortable: true, width: 40});
	for(var i = 0; i < 27; i++){
		var ki = 'col_' + i;
		colHeaders.push({header: data.cols[ki],  dataIndex: ki, sortable: false, width: 20,
								align: 'center', renderer: self.render_cell});
	}
	self.grid.getColumnModel().setConfig(colHeaders);

	//var fpp = data.rows;
	for(var r=0; r < data.rows.length; r++){
		var f = data.rows[r]

		var rec = new recDef({
			fppID: f.fppID,
			callsign: f.callsign,
			dep: f.dep,
			arr: f.arr
		});
		for(var i =0; i < f.cols.length; i++){
			//console.log(i, f.cols[i]);
			var s = f.cols[i].mode + "|" + f.cols[i].time + "|" + f.cols[i].airport
			rec.set(f.cols[i].col_ki, s);
		}
		
		self.store.add(rec);
	}
	self.countLabel.setText( self.store.getCount() > 0 ? self.store.getCount() + ' flights' : 'No flights');
	if(selectedID){
		//console.log('sel', selectedID, self.store.indexOfId(selectedID) );
		//TODO wtf why this not work
		self.selModel.selectRow( self.store.indexOfId(selectedID) );
	}
}
//this.load();

} /***  */





