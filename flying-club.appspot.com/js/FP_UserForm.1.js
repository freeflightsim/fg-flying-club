/*global Ext
*/

//#############################################################################################################
//## User Form
//#############################################################################################################

function FP_UserForm(){

var self = this;

//*************************************************************************************				
//** User Form
//*************************************************************************************
this.frm = new Ext.FormPanel({
	frame: false,
	renderTo: 'profile_widget_div',
	autoHeight: true,
    url: '/rpc/crew/fetch/',
	baseParams: {},
    reader: new Ext.data.JsonReader({
				root: 'crew',
				fields: [	'name', 'email','callsign', 'irc', 'cvs', 'forum', 'wiki',
							'location', 'ident',
							{name:'pilot', type: 'boolean'},
							{name:'atc', type: 'boolean'},
							{name:'fgcom', type: 'boolean'},
							'date_created', 'ident'
				]
	}),
	plain: true,
	waitMsgTarget: true,
    labelAlign: 'right',
    bodyStyle: 'border: none; padding: 10px',
	labelPad: 10,
    waitMsgTarget: true,
    items: [
			{fieldLabel: 'Full Name', xtype: 'textfield',  emptyText: 'eg Linus Torvalds',
				allowBlank: false, minLength: 3, name: 'name', width: '50%', msgTarget: 'side'},
			{fieldLabel: 'Email', xtype: 'textfield',  emptyText: 'Required for updates', name: 'email', width: '80%', msgTarget: 'side',allowBlank: true},

			{fieldLabel: 'CallSign', xtype: 'textfield',  name: 'callsign', width: '20%', msgTarget: 'side', allowBlank: false },
			{fieldLabel: 'Pilot', xtype: 'checkbox',  name: 'pilot', boxLabel: 'Check if your a pilot' },
			{fieldLabel: 'ATC', xtype: 'checkbox',  name: 'atc', boxLabel: 'Check if you can atc'},
			{fieldLabel: 'fgCom', xtype: 'checkbox',  name: 'fgcom' , boxLabel: 'Check if you use fgCom'},

			{fieldLabel: 'Irc Nick', xtype: 'textfield',  name: 'irc', width: '20%', msgTarget: 'side'},
			{fieldLabel: 'Forum User', xtype: 'textfield',  name: 'forum', width: '20%', msgTarget: 'side'},
			{fieldLabel: 'Wiki User', xtype: 'textfield',  name: 'wiki', width: '20%', msgTarget: 'side'},
			{fieldLabel: 'Cvs Account', xtype: 'textfield',  name: 'cvs', width: '20%', msgTarget: 'side'},
			{fieldLabel: 'Location', xtype: 'textfield',  name: 'location', width: '80%', msgTarget: 'side', emptyText: 'eg Town, Country'},
			{fieldLabel: 'Created', xtype: 'statictextfield',  name: 'date_created'},
			{fieldLabel: 'Identity', xtype: 'statictextfield',  name: 'ident'}
    ],
	buttonAlign: 'center',
    buttons: [  {text: 'Update', iconCls: 'icoSave', 
                    handler: function(){
                        if(self.frm.getForm().isValid()){
                            self.frm.getForm().submit({
                                url: '/rpc/crew/edit/',
                                waitMsg: 'Saving...',
                                success: function(frm, action){
									var data = Ext.decode(action.response.responseText);
									if(data.error){
										return;
									}
									Ext.fp.msg("Saved", "Details were updated");									
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

this.frm.load();

} /* fgUserForm() */