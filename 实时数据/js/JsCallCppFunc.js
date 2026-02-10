/// <summary>
	/// 	获取控件宽度
	/// </summary>
	/// <param name="">
	///		
	/// </param>
	/// <returns>
	///		返回控件的宽度
	/// </returns>
	/// <remarks>
	///    
	/// </remarks>
function GetCoorWidth()
{
	return window.external.GetCoorWidth();
}

/// <summary>
	/// 	获取控件高度
	/// </summary>
	/// <param name="">
	///		
	/// </param>
	/// <returns>
	///		返回控件的高度g
	/// </returns>
	/// <remarks>
	///    
	/// </remarks>
function GetCoorHeight()
{
	return window.external.GetCoorHeight();
}

/// <summary>
	/// 	向控件传输消息类型和消息内容
	/// </summary>
	/// <param name="">
	///		
	/// </param>
	/// <returns>
	///		返回控件的高度
	/// </returns>
	/// <remarks>
	///    
	/// </remarks>

function OnSendMsgInfoToKing(strMsgType, strMsgDetail)
{
	try{
			window.external.OnSendMsgInfoToKing(strMsgType, strMsgDetail);
	}
	catch (error) {
		alert("cuowu");
	}
}

function GetScriptStrFromOcx()
{
	return window.external.GetScriptStrFromOcx();
}

function ClearScript()
{
	window.external.ClearScript();
}

function GetHtmlBackPicPath()
{
	return window.external.GetHtmlBackPicPath();
} 

function GetVarValueByNameFromKS(strVarName)
{
	return window.external.GetVarValueByNameFromKS(strVarName);
} 

function SetVarValueToKS(strVarName, strVarValue)
{
	return window.external.SetVarValueToKing(strVarName, strVarValue);
} 