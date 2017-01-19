
//AutoTager 自动标注时间文字 by coder 2014/11/29

app.bringToFront();
// 对当前所有打开文档进行操作。因为是直接保存关闭，原文件要注意备份！

if (app.documents.length == 0) {
    alert("请打开至少一个文件");
} else {
    app.preferences.rulerUnits = Units.PIXELS;

//先看所有打开的文档是否在同一文件夹，并符合分类格式，是则自动提取信息并填写。
var tagInfo=new Object();
tagInfo.strPath='<多个文件夹>';
tagInfo.strDate='2014.09.17';
tagInfo.strNote='韩国游';

getTagInfoAllInOneFolder(tagInfo);

//主窗口构建
askDateDlg = "dialog { \
text:'AutoTager v1.0 - 直接覆盖保存-请注意备份',\
 myTabbedPanel: Panel{type:'tabbedpanel' ,\
									   Tab2: Panel{type: 'tab', text: '自动',\
												contents: Group{orientation: 'column',alignChildren:'left',\
																note: Group { orientation: 'column',alignChildren:'left', \
																				note:StaticText{text:'说明:'},\
																				note:StaticText{text:'    将自动处理已打开的文档，并从文档路径中按以下格式提取标注信息进行'},\
																				note:StaticText{text:'    自动标注,自动保存到原文件，并关闭文档！操作前请注意备份！！'},\
																				note:StaticText{text:'    不符合格式的不会做任何更改。'},\
																				note:StaticText{text:'例:'},\
																				note:StaticText{text:'    路径: e:\\\\xxx\\\\20140917\\\\韩国游\\\\xxx.jpg'},\
																				note:StaticText{text:'    日期: 2014.09.17'},\
																				note:StaticText{text:'    标注: 韩国游'},\
																			 }, \
																		},  \
												buttons: Group { orientation: 'row', alignment: 'right',\
														Btnok: Button { text:'确定', properties:{name:'ok'} }, \
														Btncancel: Button { text:'取消'} \
														} \
									   },\
                                       Tab1: Panel{type: 'tab', text: '手动',\
											contents: Group{orientation: 'column',alignChildren:'left',\
													path: Group { orientation: 'row',\
																	labelPath:StaticText{text:'路径: "+tagInfo.strPath+"'},\
																 }, \
													date: Group { orientation: 'row', \
																	labelDate: StaticText { text:'日期:' }, \
																	editDate: EditText { preferredSize: [150, 20] ,text:'"+tagInfo.strDate+"'} ,\
																}, \
													note: Group { orientation: 'row', \
																	labelNote: StaticText { text:'标注:' }, \
																	editNote: EditText { preferredSize: [150, 20] ,text:'"+tagInfo.strNote+" '}, \
																	} \
															},  \
											buttons: Group { orientation: 'row',\
													Btnok: Button { text:'确定', properties:{name:'ok'} }, \
													Btncancel: Button { text:'取消', properties:{name:'cancel'} } \
													} \
											notes:Group{orientation:'column', alignChildren:'left',\
																	note:StaticText{text:'说明:'},\
																	note:StaticText{text:'    将自动处理所有已打开的文档，按设定的标注信息进行'},\
																	note:StaticText{text:'    自动标注,并自动保存到原文件！操作前请注意备份！！'},\
																	note:StaticText{text:'    不会自动关闭文档，请使用file->closeAll功能'},\
														},\
											logos:Group{orientation:'row', alignment: 'right',\
														labelLogo:StaticText{text:'for 阿公阿布韩国游'},\
											},\
									   },\
									   Tab3: Panel{type: 'tab', text: '设置',\
											contents: Group{orientation: 'column',alignChildren:'left',\
																note: Group { orientation: 'column',alignChildren:'left', \
																				note:StaticText{text:'说明:'},\
																				note:StaticText{text:'    ERROR_NOT_IMPL'},\
																				note:StaticText{text:'    请自行从addDateNoteToActiveDocument函数改吧。。这个是脚本文件-_-'},\
																				note:StaticText{text:''},\
																				note:StaticText{text:''},\
																				note:StaticText{text:'    by coder',alignment: 'right'},\
																				note:StaticText{text:'    2014/11/29',alignment: 'right'},\
																			 }, \
																		},  \
									   },\
                             },\
}";

//alert(askDateDlg);

//主窗口
    win = new Window(askDateDlg);
	
//绑定窗口上的个个控件事件
    win.myTabbedPanel.Tab1.buttons.Btncancel.onClick = function () {
       this.parent.parent.parent.parent.close();
    }
	

    win.myTabbedPanel.Tab1.buttons.Btnok.onClick = function () {
       var strDate = win.myTabbedPanel.Tab1.contents.date.editDate.text
       var strNote = win.myTabbedPanel.Tab1.contents.note.editNote.text
       addDateNote(strDate,strNote)
	   this.parent.parent.parent.parent.close();
    }
	
	win.myTabbedPanel.Tab2.buttons.Btncancel.onClick = function () {
        this.parent.parent.parent.parent.close();
    }
  
   win.myTabbedPanel.Tab2.buttons.Btnok.onClick = function () {
	autoAddDateNote();
	this.parent.parent.parent.parent.close();
	}
	
//居中并显示主窗口
    win.center();
    win.show();
}

//从指定文档路径中提取信息
function getTagInfoFromFullName(fullName,tagInfo)
{
	var path=decodeURIComponent(fullName)
	path=path.substring(0,path.lastIndexOf('/'));
	var spFolderName=path.split('/');
	if(spFolderName.length<4)
	{
		return false;
	}
	var strDate=spFolderName[spFolderName.length-2]
	var strNote=spFolderName[spFolderName.length-1]
	//var strFileName=spFolderName[spFolderName.length-1]
	strDate=strToDate(strDate,'.');
	//alert(strDate);
	if(strDate==null)return false;
	tagInfo.strPath=path;
	tagInfo.strDate=strDate;
	tagInfo.strNote=strNote;
	return true;
}
//同一文件夹下的提取
function getTagInfoAllInOneFolder(tagInfo)
{
	//tagInfo.strPath="bach path";
	//先比较是否在同一文件夹下
	var i=0;
	var path='';
    for(i=0;i<app.documents.length;i++)
	{
		//alert(decodeURIComponent(app.documents[i].fullName));
		var curPath=decodeURIComponent(app.documents[i].fullName);
		curPath=curPath.substring(0,curPath.lastIndexOf('/'));
		//alert(curPath);
		if(i==0)
		{
			path=curPath;
			continue;
		}
		if(curPath!=path)return false;
	}
	return getTagInfoFromFullName(app.documents[0].fullName,tagInfo);
}
//8位数字格式化为yyyy.mm.dd
function strToDate(strDate,sp)
{
	if(strDate.match(/^\d{8}$/)==null)return null;
	return strDate.substring(0,4)+sp+strDate.substring(4,6)+sp+strDate.substring(6,8);
}

//自动处理函数
function autoAddDateNote()
{
	var tagInfo=new Object();
	tagInfo.strPath='';
	tagInfo.strDate='';
	tagInfo.strNote='';
	var bOk=new Array();
	var i=0;
	
    for(i=0;i<app.documents.length;i++)
	{
		//检查是否有信息
		

		if(getTagInfoFromFullName(app.documents[i].fullName,tagInfo))
		{
			//需先激活
			app.activeDocument=app.documents[i];
			//加入
			addDateNoteToActiveDocument(tagInfo.strNote,tagInfo.strDate)
			//合并所有图层并保存
			//var AD=app.activeDocument;
			app.documents[i].flatten();
			app.documents[i].save();
			bOk[i]=true;
			
			
		}
		else bOk[i]=false;
		//break;
    }
	
	//关闭已处理过的
	var countOk=0;
	for(i=0;i<app.documents.length;i++)
	{
		if(bOk[i]==true)
		{
			app.documents[i].close();
			i--;
			countOk++;
		}
	}
	
	alert(countOk+"个文档自动处理完成并已保存关闭!\n"+app.documents.length+"个不符格式未处理.");
}

//处理所有
function addDateNote(note,date)
{
	var i=0;
    for(i=0;i<app.documents.length;i++)
	{
		//需先激活
		app.activeDocument=app.documents[i];
		//加入
		addDateNoteToActiveDocument(note,date)
		//合并所有图层并保存
		//var AD=app.activeDocument;
		app.documents[i].flatten();
		app.documents[i].save();
		//break;
    }
	alert("处理完成"+i+"个文档!");
}

//加入当前图层
function addDateNoteToActiveDocument(note,date)
{

	//参数设置
	var AD=app.activeDocument;
	var edgeLeft=90;
	var edgeBottom=60;
	var warpHeight=90;
	var fontPostScriptName=app.fonts.getByName("MicrosoftYaHei-Bold").postScriptName;
	var fontSize=0;
	var fontSizePortion=parseInt(3264/12);
	var colorRGB=[255,0,0];
	var fillOpacity=60;
	
	//字体大小按宽的比例计算
	if(AD.width>=AD.height)fontSize=parseInt(AD.width/fontSizePortion);
	else fontSize=parseInt(AD.height/fontSizePortion);
	
	//加入图层并完成设置
	addTextLayer(AD,note,edgeLeft,edgeBottom+warpHeight,fontPostScriptName,fontSize,colorRGB,fillOpacity);
	addTextLayer(AD,date,edgeLeft,edgeBottom,fontPostScriptName,fontSize,colorRGB,fillOpacity);
	
	//合并所有图层
	//AD.flatten();
	//AD.save();
	
	//释放
	AD = null
	
}

//加入函数
function addTextLayer(AD,content,edgeLeft,edgeBottom,fontPostScriptName,fontSize,colorRGB,fillOpacity)
{

		var originalUnit = preferences.rulerUnits
        preferences.rulerUnits = Units.PIXELS

        var photoWidth = AD.width;
        var photoHeight = AD.height;
        var artLayerRef = AD.artLayers.add()
        artLayerRef.kind = LayerKind.TEXT
        var TI = artLayerRef.textItem
       
	   //右对齐
        TI.justification = Justification.RIGHT;
	   
	   
	  
			
			
			
	   //font  
	   //字体
	     //MicrosoftYaHei-Bold
	   //var myFont = app.fonts.getByName("MicrosoftYaHei-Bold");
		//alert(AD.artLayers[1].textItem.font);
	   //alert(TI.font);
	   
	   TI.font=fontPostScriptName;//app.fonts.getByName("MicrosoftYaHei-Bold").postScriptName; //这里一定要用postScriptName。。。看清说明啊。。。
       

        //大小
		var fontSize=fontSize;
        
        TI.size = fontSize;
    

        //color 
		//颜色
        var textcolor = new SolidColor;
        textcolor.rgb.red = colorRGB[0];
        textcolor.rgb.green = colorRGB[1];
        textcolor.rgb.blue = colorRGB[2];
        TI.color = textcolor;

		
		
	 
	   
	 
	   //内容

        TI.contents = content;

        //位置
        TI.position = [photoWidth-edgeLeft, photoHeight-edgeBottom];

		//透明度
		artLayerRef.fillOpacity = fillOpacity;
		
		//外发光
		//alert(app.findMenuCommandId("Outer Glow..."));
		//app.executeCommand(app.findMenuCommandId("Outer Glow..."));
		//释放
		
		
		
        artLayerRef = null
        TI = null
		
        app.preferences.rulerUnits = originalUnit
	
	
}
