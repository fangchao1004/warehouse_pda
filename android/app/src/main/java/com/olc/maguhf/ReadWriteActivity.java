package com.olc.maguhf;

import java.text.Format;
import java.util.Iterator;
import java.util.List;

import com.olc.uhf.tech.ISO1800_6C;
import com.olc.uhf.tech.IUhfCallback;
import com.olc.uint.AsyncTaskExt;
import com.olc.uint.AsyncTaskExt.ASynCallBack;
import com.olc.maguhf.R;
import com.olc.maguhf.R.color;

import android.app.Activity;
import android.content.Context;
import android.content.res.ColorStateList;

import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.os.RemoteException;
import android.util.Log;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.WindowManager;
import android.view.inputmethod.InputMethodManager;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.RadioButton;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

/**
 * 2016.12.21
 * 
 * @author donqiwu
 */
public class ReadWriteActivity extends Activity implements OnClickListener {

	private ISO1800_6C uhf_6c;
	// ******************************************************
	Button m_btnDubiaoqian, m_btnXiebiaoqian, m_readepc;
	ImageButton btn_main_back;
	EditText m_editAddress, m_editLength, m_editInput, m_editmima;
	TextView m_result, m_textepc, tx_resultView;
	Spinner m_spinner;
	RadioButton Radio_RFU, Radio_EPC, Radio_TID, Radio_USER;
	// *******************************************************
	public static long lastTime; // last click time
	// *******************************************************
	// read user area as default
	byte btMemBank = 0x03;
	String m_strresult = "";
	ArrayAdapter<String> m_adapter;
	private Handler mHandler=new MainHandler();

	// ******************************************************
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_readwrite);
		uhf_6c=(ISO1800_6C) App.mService.getISO1800_6C();
		DevBeep.init(ReadWriteActivity.this);
		initview();
		// Close the soft keyboard by default(2017)��
		getWindow().setSoftInputMode(
				WindowManager.LayoutParams.SOFT_INPUT_STATE_HIDDEN);
	}
	private void initview() {
		Radio_RFU = (RadioButton) findViewById(R.id.Radio_RFU);
		Radio_EPC = (RadioButton) findViewById(R.id.Radio_EPC);
		Radio_TID = (RadioButton) findViewById(R.id.Radio_TID);
		Radio_USER = (RadioButton) findViewById(R.id.Radio_USER);
		Radio_RFU.setOnClickListener(this);
		Radio_EPC.setOnClickListener(this);
		Radio_TID.setOnClickListener(this);
		Radio_USER.setOnClickListener(this);

		btn_main_back = (ImageButton) findViewById(R.id.btn_main_back);
		m_readepc = (Button) findViewById(R.id.btn_readepc);
		m_btnDubiaoqian = (Button) findViewById(R.id.btn_dubiaoqian);
		m_btnXiebiaoqian = (Button) findViewById(R.id.btn_xiebiaoqian);
		m_readepc.setOnClickListener(this);
		m_btnDubiaoqian.setOnClickListener(this);
		m_btnXiebiaoqian.setOnClickListener(this);
		btn_main_back.setOnClickListener(this);

		m_textepc = (TextView) findViewById(R.id.textEPC);
		m_editAddress = (EditText) findViewById(R.id.address);
		m_editLength = (EditText) findViewById(R.id.datalength);
		m_editInput = (EditText) findViewById(R.id.inputdata);
		m_editmima = (EditText) findViewById(R.id.password);
		m_result = (TextView) findViewById(R.id.resultView);
		tx_resultView =(TextView) findViewById(R.id.tx_resultView);
	}
	public static byte[] stringToBytes(String hexString) {
		if (hexString == null || hexString.equals("")) {
			return null;
		}
		hexString = hexString.toUpperCase();
		int length = hexString.length() / 2;
		char[] hexChars = hexString.toCharArray();
		byte[] d = new byte[length];
		for (int i = 0; i < length; i++) {
			int pos = i * 2;
			d[i] = (byte) (charToByte(hexChars[pos]) << 4 | charToByte(hexChars[pos + 1]));
		}
		return d;
	}
	private static byte charToByte(char c) {
		return (byte) "0123456789ABCDEF".indexOf(c);
	}
	public int  Readlable(){
		m_strresult = "";
		m_result.setText(m_strresult);
		if ("".equals(m_textepc.getText().toString())){
			Toast.makeText(ReadWriteActivity.this,
					"Please select the EPC tags", Toast.LENGTH_SHORT).show();
			return -1;
		}
		String stradd = m_editAddress.getText().toString().trim();
		if (stradd.equals("")) {
			stradd = m_editAddress.getHint().toString();
		}
		int nadd = Integer.valueOf(stradd);

		String strdatalength = m_editLength.getText().toString().trim();
		if (strdatalength.equals("")) {
			strdatalength = m_editLength.getHint().toString();
		}
		int ndatalen = Integer.valueOf(strdatalength);

		String mimaStr = m_editmima.getText().toString().trim();
		if (mimaStr == null || mimaStr.equals("")) {
			m_strresult = "Please enter your 8 - digit password!!\n";
			mimaStr = m_editmima.getHint().toString().trim();
		}
		if (mimaStr.length() != 8) {
			Toast.makeText(ReadWriteActivity.this,
					"Please enter your 8 - digit password!!",
					Toast.LENGTH_SHORT).show();
			return -1;
		}
		byte[] passw = stringToBytes(mimaStr);
		byte[] epc =stringToBytes(m_textepc.getText().toString());
		if (null!=epc) 
		{
			byte []dataout=new byte[ndatalen*2];
			if (btMemBank == 1)
			{
				int result=uhf_6c.read(passw, epc.length, epc, (byte) btMemBank,nadd, ndatalen, dataout, 0, ndatalen);
			    if(result==0)
			    {
			    	m_result.setText(BytesToString(dataout,0,ndatalen*2));
					return 0;
			    }
			    else
			    {
			    	return result;
			    }
			    
			} else {
				int result=uhf_6c.read(passw, epc.length, epc, (byte) btMemBank,nadd, ndatalen, dataout, 0, ndatalen);
				if(result==0)
				{	
					m_result.setText(BytesToString(dataout,0,ndatalen*2));
					return 0;
				}else{
					return result;
				}
			}
		}
		return -1;
	}
	public  String BytesToString(byte[] b, int nS, int ncount) {
		String ret = "";
		int nMax = ncount > (b.length - nS) ? b.length - nS : ncount;
		for (int i = 0; i < nMax; i++) {
			String hex = Integer.toHexString(b[i + nS] & 0xFF);
			if (hex.length() == 1) {
				hex = '0' + hex;
			}
			ret += hex.toUpperCase();
		}
		return ret;
	}

	private int  Writelable() {

		m_strresult = "";
		tx_resultView.setText("");
		if ("".equals(m_textepc.getText().toString())) {
			Toast.makeText(ReadWriteActivity.this,
					"Please select the EPC tags", Toast.LENGTH_SHORT).show();
			return -1;
		}
		String stradd = m_editAddress.getText().toString().trim();
		if (stradd.equals("")) {
			stradd = m_editAddress.getHint().toString().trim();
		}
		int nadd = Integer.valueOf(stradd);
		String strdatalength = m_editLength.getText().toString().trim(); // 87784441
		if (strdatalength.equals("")) {
			strdatalength = m_editLength.getHint().toString().trim(); // 87784441
		}
		int ndatalen = Integer.valueOf(strdatalength);

		String mimaStr = m_editmima.getText().toString().trim();
		if (mimaStr == null || mimaStr.equals("")) {
			// m_strresult = "Please enter your 8 - digit password!!\n";
			// Toast.makeText(ReadWriteActivity.this,
			// "Please enter your 8 - digit password!!",
			// Toast.LENGTH_SHORT).show();
			mimaStr = m_editmima.getHint().toString().trim();
			// return;
		}
		if (mimaStr.length() != 8) {
			Toast.makeText(ReadWriteActivity.this,
					"Please enter your 8 - digit password!!",
					Toast.LENGTH_SHORT).show();
			return -1;
		}
		byte[] passw =stringToBytes(mimaStr);
		byte[] pwrite = new byte[ndatalen * 2];

		String dataE = m_editInput.getText().toString().trim();
		if (dataE.equals("")) {
			m_strresult = getResources().getString(R.string.Lable_write_null);
			dataE = m_editInput.getHint().toString();
		}
		byte[] myByte =stringToBytes(dataE);
		System.arraycopy(myByte, 0, pwrite, 0,
				myByte.length > ndatalen * 2 ? ndatalen * 2 : myByte.length);
		byte[] epc = stringToBytes(m_textepc.getText().toString());
		int  iswrite=uhf_6c.write(passw, epc.length, epc, btMemBank, (byte)nadd, (byte) ndatalen * 2, pwrite);	
		return iswrite;
	}
	/**
	 * @author dongqiwu
	 * */
	private class MainHandler extends Handler {
		@Override
		public void handleMessage(Message msg){
			if(msg.what ==1)//loop tag
			{
				DevBeep.PlayOK();
				m_textepc.setText(msg.obj.toString());
			}
		}
	}
	public  String  getErrorString(String Errorval){
		String strError="";
		if(Errorval.equals("00")){
			
			strError=  getResources().getString(R.string.WriteError00);
		}
		if(Errorval.equals("B3")){
			strError=  getResources().getString(R.string.WriteErrorB3);
		}else if(Errorval.equals("B4")){
			strError=  getResources().getString(R.string.WriteErrorB4);
		}else if(Errorval.equals("10")){
			strError=  getResources().getString(R.string.WriteError10);
		}else if(Errorval.equals("16")){
			strError=  getResources().getString(R.string.WriteError16);
		}else if(Errorval.equals("BF")){
			strError=  getResources().getString(R.string.WriteErrorBF);
		}else if(Errorval.equals("B0")){
			strError=  getResources().getString(R.string.WriteErrorB0);
		}else if(Errorval.equals("A0")){
			strError=  getResources().getString(R.string.ReadErrorA0);
		}else if(Errorval.equals("A3")){
			strError=  getResources().getString(R.string.ReadErrorA3);
		}else if(Errorval.equals("A4")){
			strError=  getResources().getString(R.string.ReadErrorA4);
		}else if(Errorval.equals("09")){
			strError=  getResources().getString(R.string.ReadError09);
		}
		return strError;
		
	}
	IUhfCallback callback = new IUhfCallback.Stub() {
		@Override
		public void doInventory(List<String> str) throws RemoteException {
			// for (Iterator it2 = str.iterator(); it2.hasNext();)
			Log.d("dqw", "count111=" + str.size());
			//allcount+=str.size();
			//Log.d("dqw00000007", "count111=" +allcount);
			// m_tvCount.setText("count of tag:" + String.valueOf(card_num));
			for (int i = 0; i < str.size(); i++) {
				String strepc = (String) str.get(i);
				Log.d("wyt", "RSSI=" + strepc.substring(0, 2));
				Log.d("wyt", "PC=" + strepc.substring(2, 6));
				Log.d("wyt", "EPC=" + strepc.substring(2, 6)+strepc.substring(6));
				//DevBeep.PlayOK();
				String strEpc =strepc.substring(2, 6)+strepc.substring(6);
				Message msg = new Message();
				msg.what = 1;
				msg.obj = strEpc;
				mHandler.sendMessage(msg);
			}

		}

		@Override
		public void doTIDAndEPC(List<String> str) throws RemoteException {
			for (Iterator it2 = str.iterator(); it2.hasNext();) {
				String strepc = (String) it2.next();
				// Log.d("wyt", strepc);
				int nlen = Integer.valueOf(strepc.substring(0, 2), 16);
				// Log.d("wyt", "PC=" + strepc.substring(2, 6));
				// Log.d("wyt", "EPC=" + strepc.substring(6, (nlen + 1) * 2));
				// Log.d("wyt", "TID=" + strepc.substring((nlen + 1) * 2));

			}
		}

	};

	/**
	 * Button events pay attention to limit the click interval
	 * 
	 * @return
	 */
	public boolean IsDoubClick() {
		boolean flag = false;
		long time = System.currentTimeMillis() - lastTime;
		if (time > 500) {
			flag = true;
		}
		lastTime = System.currentTimeMillis();
		return flag;
	}

	@Override
	public void onClick(View v) {
		switch (v.getId()) {
		case R.id.btn_main_back:
			finish();
			break;
		case R.id.Radio_RFU:
			btMemBank = 0x00;
			m_editAddress.setText("0");
			m_editLength.setText("4");
			break;
		case R.id.Radio_EPC:
			btMemBank = 0x01;
			m_editAddress.setText("2");
			break;
		case R.id.Radio_TID:
			m_editAddress.setText("0");
			btMemBank = 0x02;
			break;
		case R.id.Radio_USER:
			m_editAddress.setText("0");
			btMemBank = 0x03;
			break;
		case R.id.btn_readepc:
			if (IsDoubClick()) {
				uhf_6c.inventory(callback);
			}
			break;
		case R.id.btn_dubiaoqian:
			if (IsDoubClick()) {
				int mresult=Readlable();
				//String hex=Integer.toHexString(mresult);
//				hex=String.format("%02X",mresult);
//				tx_resultView.setText(getErrorString(hex));
				if(mresult==0){
					DevBeep.PlayOK();
					tx_resultView.setText("OK");
				}else{
					tx_resultView.setText(uhf_6c.getErrorDescription(mresult));
					DevBeep.PlayErr();
				}
			}
			break;
		case R.id.btn_xiebiaoqian:
			if (IsDoubClick()) {
				int mresult=Writelable();
				if(mresult==0){
					tx_resultView.setText("OK");
					DevBeep.PlayOK();
				}else{
					tx_resultView.setText(uhf_6c.getErrorDescription(mresult));
					DevBeep.PlayErr();
				}
			}

			break;
		default:
			break;
		}

	};
}