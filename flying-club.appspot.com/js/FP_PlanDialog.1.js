/*global Ext, AJAX_FETCH, AJAX_ACTION

*/

function FP_PlanDialog(fppIDX, retDataType){

var self = this;

this.fppID = fppIDX


//*************************************************************************************				
//** FP Form
//*************************************************************************************


this.frm = new Ext.FormPanel({
	frame: true,
	//title: 'Sign Up',
	autoHeight: true,
    url: '/rpc/plan/fetch/',
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
    bodyStyle: 'padding: 10px',
    waitMsgTarget: true,
    items: [	{xtype: 'hidden', name: 'fppID'},{xtype: 'hidden', name: 'retDataType', value: this.retDataType},

				{xtype: 'fieldset', title: 'XML Source', autoHeight: true, 
					items:[
						{hideLabel: true, xtype: 'textarea',    height: 500,
							 name: 'xml', width: '95%', msgTarget: 'side'}
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
                                url: '/rpc/plan/edit/',
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
	title: 'Flight Plan',
	iconCls: 'icoPlan',
	width: window.innerWidth - 200,
	items:[ this.frm ]

})

this.win.show();

this.load = function(fppID){
	return
	self.frm.getEl().mask("Loading..");
	Ext.Ajax.request({
		url: '/rpc/plan/fetch/',
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


