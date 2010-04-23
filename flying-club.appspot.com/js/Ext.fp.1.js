
//*******************************************
// ** Utils Class
//*******************************************
Ext.fp = function(){

   var msgCt;
    function createBox(t, s){
        return ['<div class="msg">',
                '<div class="x-box-tl"><div class="x-box-tr"><div class="x-box-tc"></div></div></div>',
                '<div class="x-box-ml"><div class="x-box-mr"><div class="x-box-mc"><h3>', t, '</h3>', s, '</div></div></div>',
                '<div class="x-box-bl"><div class="x-box-br"><div class="x-box-bc"></div></div></div>',
                '</div>'].join('');
    }

    return {
        msg : function(title, body, tim){
            if(!msgCt){
                msgCt = Ext.DomHelper.insertFirst(document.body, {id:'msg-div'}, true);
            }
            msgCt.alignTo(document, 't-t');
            //var s = String.format.apply(String, Array.prototype.slice.call(arguments, 1));
            var m = Ext.DomHelper.append(msgCt, {html:createBox(title, body)}, true);
            var Timmy = tim > 0 ? tim : 3;
            m.slideIn('t').pause(Timmy).ghost("t", {remove:true});
        },

        init : function(){
        }

	};

}();

//*******************************************
// ** Clock
//*******************************************
var gToggle = false;
function tick_tock_clock(){
	gToggle = !gToggle;
	var d = new Date();
	document.getElementById('real_date').innerHTML = Ext.util.Format.date(d, "l d F Y" ); 
	var sep  = gToggle ? ":" : "." 
	
	var s = d.getUTCHours() < 10 ? "0" + d.getUTCHours() : d.getUTCHours();  
	s += sep 
	s += d.getUTCMinutes() < 10 ? "0" + d.getUTCMinutes() : d.getUTCMinutes()  
	s += sep 
	s += d.getUTCSeconds() < 10 ? "0" + d.getUTCSeconds() : d.getUTCSeconds()  
	document.getElementById('real_time').innerHTML = s
	setTimeout("tick_tock_clock()", 1000); 
}



//*******************************************
// ** Main Widget
//*******************************************
function FP_MainWidget(){

var self = this;
this.plansGrid = new FP_PlansPane();
this.pilotRequestsGrid = new FP_Grid();
this.timelineGrid = new TL_Grid();

this.tabWidget = new Ext.TabPanel({
	activeTab: 0,
	renderTo: 'grid_div',
	deferedRender: false,
	plain: true,
	height: 600,
	items:[
		this.plansGrid.grid,
		this.timelineGrid.grid
		, this.pilotRequestsGrid.grid,
		{contentEl:'help_text_div', title: 'Help', iconCls: 'icoHelp'}
	]
});
this.tabWidget.on('tabChange', function(tabPanel, tab){
	var tit = tabPanel.getActiveTab().title 
	if(tit == 'Pilot Requests'){
		self.pilotRequestsGrid.load();

	}else if (tit == 'Time Line') {
		self.timelineGrid.load();

	}else if (tit == 'Flight Plans') {
		self.plansGrid.load();
	}
});
self.plansGrid.load();

}


//*******************************************
// ** Startup
//*******************************************
function startInit(){
	tick_tock_clock();
}





//*******************************************
// ** Sign Out
//*******************************************
function signOut(){
	var m = Ext.MessageBox.confirm("Sign Out", "Clicking Yes will nuke the cookie", 
		function(TODO){
			location.href = '/do_logout/'
		}

	)


}



