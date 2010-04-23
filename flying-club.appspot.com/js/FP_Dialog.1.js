/*global Ext, AJAX_FETCH, AJAX_ACTION

*/

function FP_Dialog(fppIDX, retDataType){

var self = this;

this.fppID = fppIDX
this.retDataType = retDataType

this.depDate = new Ext.form.DateField({
	fieldLabel: 'Date', allowBlank: false, minLength: 3,   
	format: 'Y-m-d', 
	name: 'dep_date', width: '40%', msgTarget: 'side'
});
this.depDate.on("select", function(widget, date){
	var f = self.frm.getForm();
	var arrDate = f.findField('arr_date');
	if(arrDate.getValue() == ''){
		arrDate.setValue(widget.getValue());
	}
});

this.depTime = new Ext.form.TimeField({
	fieldLabel: 'Time', 
	name: 'dep_time', width: '80%', msgTarget: 'side', format: 'H:i' 
});
this.depTime.on("select", function(widget, date){
	var f = self.frm.getForm();

	// checl the dat eaint blank
	var arrDate = f.findField('arr_date');
	if(arrDate.getValue() == ''){
		arrDate.setValue(f.findField('dep_date').getValue());
	}

	var arrDate = f.findField('arr_time');
	if(arrDate.getValue() == ''){
		arrDate.setValue(widget.getValue());
	}
});

var recDef = Ext.data.Record.create([
	{name: 'icao'},
	{name: 'airport'}
]);


this.depStore = new Ext.data.JsonStore({
	url: '/rpc/airports/',
	root: 'airports',
	idProperty: 'icao',
	fields: ['icao', 'airport']
});
this.depCombo = new Ext.form.ComboBox({
	typeAhead: true,
	triggerAction: 'all',
	fieldLabel: 'Airport',
	loadingText: 'Searching...',
	mode: 'remote',
	queryParam: 'search',
	store: this.depStore,
	valueField: 'icao',
	displayField: 'airport',
	name: 'dep',
	hiddenName: 'dep',
	forceSelection: true,
	minChars: 3,
	allowBlank: false,
	width: '85%'
});

this.arrStore = new Ext.data.JsonStore({
	url: '/rpc/airports/',
	root: 'airports',
	idProperty: 'icao',
	fields: ['icao', 'airport']
});
this.arrCombo = new Ext.form.ComboBox({
	typeAhead: true,
	triggerAction: 'all',
	fieldLabel: 'Airport',
	loadingText: 'Searching...',
	mode: 'remote',
	queryParam: 'search',
	store: this.arrStore,
	valueField: 'icao',
	displayField: 'airport',
	name: 'arr',
	hiddenName: 'arr',
	forceSelection: true,
	minChars: 3,
	allowBlank: false,
	width: '85%'
});
/*var st = self.depCombo.getStore();
for(var i = 0; i < airports.length; i++){
	console.log(airports[i].airport);
	var rec = new recDef({
		icao: airports[i].icao,
		airport: airports[i].airport
	});
}
*/

//console.log("fppID", fppID);
//*************************************************************************************				
//** User Form
//*************************************************************************************
this.frm = new Ext.FormPanel({
	    frame: true,
	//title: 'Sign Up',
	autoHeight: true,
    url: '/rpc/fetch/',
	baseParams: { fppID: this.fppID },
    reader: new Ext.data.JsonReader({
				root: 'fpp',
				fields: [	'callsign', 'fppID', 
							'dep','dep_date', 'dep_time', 'dep_atc',
							'arr','arr_date', 'arr_time', 'arr_atc',
							'comments', 'email'
				]
	}),
    labelAlign: 'right',
    bodyStyle: 'padding: 20px',
    waitMsgTarget: true,
    items: [	{xtype: 'hidden', name: 'fppID'},{xtype: 'hidden', name: 'retDataType', value: this.retDataType},
				/*  Pilot */
				{xtype: 'fieldset', title: 'Pilot', autoHeight: true, 
					items:[
						{fieldLabel: 'Callsign', xtype: 'textfield',  
								 minLength: 3, name: 'callsign', width: '30%', msgTarget: 'side'},
						{fieldLabel: 'Email', xtype: 'textfield',   disabled: true,
								sallowBlank: false, minLength: 3, name: 'email', width: '80%', msgTarget: 'side'}
					]
				},
				/** Departure **/
				{xtype: 'fieldset', title: 'Departure', autoHeight: true, 
					items:[
							this.depCombo,
							this.depDate, this.depTime,
							{fieldLabel: 'ATC', xtype: 'textfield',  name: 'dep_atc', width: '20%', msgTarget: 'side'}
					]
				},
				/** Arrival **/
				{xtype: 'fieldset', title: 'Arrival', autoHeight: true, 
					items:[
							
							this.arrCombo,
							{fieldLabel: 'Date', xtype: 'datefield', sallowBlank: false, minLength: 3, format: 'Y-m-d', 
								name: 'arr_date', width: '40%', msgTarget: 'side' },
							{fieldLabel: 'Time', xtype: 'timefield',  name: 'arr_time', width: '20%', msgTarget: 'side', format: 'H:i' },
							{fieldLabel: 'ATC', xtype: 'textfield',  name: 'arr_atc', width: '20%', msgTarget: 'side'}
					]
				},
				{xtype: 'fieldset', title: 'Comment', autoHeight: true, items: [
					{hideLabel: true, xtype: 'textarea',  height: 100,
								allowBlank: true, name: 'comment', width: '95%'}
					]
				}
    ],
    buttons: [  /** Delete Button **/
				{text: 'Delete', iconCls: 'icoDelete', hidden: self.fppID == 0,
                    handler: function(){
						var ok = confirm("Delete this item?'");
						if(!ok){
							return;
						}
						self.frm.getEl().mask('Nuking item');	
						Ext.Ajax.request({
							url: '/rpc/rm/',
							params: {fppID: self.fppID, retDataType: self.retDataType},
							success: function(response, opts){
								var payload = Ext.decode(response.responseText);
								self.frm.fireEvent("fpp_refresh", payload);
								Ext.fp.msg('Deleted');
								self.win.close();
							},
							failure: function(response, opts){
								Ext.fg.msg('OOOPS', 'Something went wrong !');
								self.frm.getEl().ummask();
							}

						});
                    }
                },
				/** Cancel Button **/
				{text: 'Cancel', iconCls: 'icoCancel',
                    handler: function(){
                        self.win.close();
                    }
                },
				/** Submit Button **/
				{text: self.fppID == 0 ? 'Create' : 'Save',
					iconCls: 'icoSave',
                    handler: function(){
                        if(self.frm.getForm().isValid()){
                            self.frm.getForm().submit({
                                url: '/rpc/edit/',
                                waitMsg: 'Saving...',
                                success: function(frm, action){
									var payload = Ext.decode(action.response.responseText);
									if(payload.error){
										alert("Error: " + payload.error);
										return;
									}
							
									Ext.fp.msg('Saved');
									self.frm.fireEvent("fpp_refresh", payload);
                                    self.win.close();
                                },
                                failure: function(){
                                    Ext.fp.msg('OOOPS', 'Something went wrong !');
                                }

                            });

                        }
                    }
                }

    ]
});


this.win = new Ext.Window({
	title: 'ATC Request',
	iconCls: 'icoFpp',
	width: 500,
	items:[ this.frm ]

})

this.win.show();

this.load = function(fppID){
	self.frm.getEl().mask("Loading..");
	Ext.Ajax.request({
		url: '/rpc/fetch/',
		params: {fppID: fppID},
		success: function(response, opts){
			//console.log(response, opts);
			var data = Ext.decode(response.responseText);
			//console.log(data);
			if(data.error){
				alert("Error: " + data.error.description);
				return;
			}
			
			var fpp = data.fpp;
			var f = self.frm.getForm() 
			f.findField("fppID").setValue(fpp.fppID);
			f.findField("callsign").setValue(fpp.callsign);
			f.findField("email").setValue(fpp.email);
			f.findField("comment").setValue(fpp.comment);

			f.findField("dep").setValue(fpp.dep);
			var d = Date.parseDate(fpp.dep_date, 'Y-m-d H:i:s');
			f.findField("dep_date").setValue(d);
			f.findField("dep_time").setValue(d);
			f.findField("dep_atc").setValue(fpp.dep_atc);

			f.findField("arr").setValue(fpp.arr);
			var d = Date.parseDate(fpp.arr_date, 'Y-m-d H:i:s');
			f.findField("arr_date").setValue(d);
			f.findField("arr_time").setValue(d);
			f.findField("arr_atc").setValue(fpp.arr_atc);

			f.clearInvalid();
			f.findField("arr_atc").focus();
			self.frm.getEl().unmask();		
		},
		failure: function(response, opts){

			//Ext.geo.msg('OOOPS', 'Something went wrong !');
		}

	});
}
this.load(this.fppID);



} /* FP_Dialog */


