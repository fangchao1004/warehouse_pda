package com.olc.maguhf;

import java.util.Iterator;
import java.util.List;

import com.olc.maguhf.R;
import com.olc.uhf.tech.ISO1800_6C;
import com.olc.uhf.tech.IUhfCallback;

import android.annotation.SuppressLint;
import android.app.Activity;

import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.os.RemoteException;
import android.util.Log;
import android.view.View;
import android.view.WindowManager;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.RadioButton;
import android.widget.TextView;

public class LockActivity extends Activity implements OnClickListener {
	private ISO1800_6C uhf_6c;
	private long lastTime = 0;

	// ******************************************************
	TextView m_result, m_textepc;
	EditText etLockpassword, m_editKPSW;
	Button BtnLock, btnRead, BtnKill;
	ImageButton btn_main_back;
	RadioButton Radio_AccessRFU, Radio_killRFU, Radio_EPC, Radio_TID,
			Radio_USER;
	RadioButton Radio_OPEN, Radio_openforever, Radio_lock, Radio_lockforever;
	// ******************************************************
	byte btMemBank = 0x04;
	byte btAction = 0x02;
	String m_strresult = "";
	private Handler mHandler = new MainHandler();

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activitylock);
		uhf_6c = App.mService.getISO1800_6C();
		DevBeep.init(LockActivity.this);
		initview();
		
		getWindow().setSoftInputMode(
				WindowManager.LayoutParams.SOFT_INPUT_STATE_HIDDEN);
	}

	private void initview() {
		m_textepc = (TextView) findViewById(R.id.textEPC);
		m_result = (TextView) findViewById(R.id.resultView);
		etLockpassword = (EditText) findViewById(R.id.Lockpassword);
		m_editKPSW = (EditText) findViewById(R.id.killpassword);
		Radio_AccessRFU = (RadioButton) findViewById(R.id.Radio_AccessRFU);
		Radio_killRFU = (RadioButton) findViewById(R.id.Radio_killRFU);
		Radio_EPC = (RadioButton) findViewById(R.id.Radio_EPC);
		Radio_TID = (RadioButton) findViewById(R.id.Radio_TID);
		Radio_USER = (RadioButton) findViewById(R.id.Radio_USER);
		Radio_AccessRFU.setOnClickListener(this);
		Radio_killRFU.setOnClickListener(this);
		Radio_EPC.setOnClickListener(this);
		Radio_TID.setOnClickListener(this);
		Radio_USER.setOnClickListener(this);

		Radio_OPEN = (RadioButton) findViewById(R.id.Radio_OPEN);
		Radio_openforever = (RadioButton) findViewById(R.id.Radio_openforever);
		Radio_lock = (RadioButton) findViewById(R.id.Radio_lock);
		Radio_lockforever = (RadioButton) findViewById(R.id.Radio_lockforever);

		Radio_OPEN.setOnClickListener(this);
		Radio_openforever.setOnClickListener(this);
		Radio_lock.setOnClickListener(this);
		Radio_lockforever.setOnClickListener(this);

		btn_main_back = (ImageButton) findViewById(R.id.btn_main_back);
		btn_main_back.setOnClickListener(this);

		BtnLock = (Button) findViewById(R.id.BtnLock);
		BtnLock.setOnClickListener(this);

		BtnKill = (Button) findViewById(R.id.BtnKill);
		BtnKill.setOnClickListener(this);

		btnRead = (Button) findViewById(R.id.readepc);
		btnRead.setOnClickListener(this);
	}

	public boolean IsDoubClick() {
		boolean flag = false;
		long time = System.currentTimeMillis() - lastTime;
		if (time > 500) {
			flag = true;
		}
		lastTime = System.currentTimeMillis();
		return flag;
	}

	// /Kill PassWord", "Access PassWord", "EPC", "TID","USER" };
	// OPEN", "PWD R/W", "Perma Open", "Perma not R/W
	@Override
	public void onClick(View v) {
		switch (v.getId()) {
		case R.id.btn_main_back:
			finish();
			break;
		// MemBank
		case R.id.Radio_killRFU:
			btMemBank = 0x00;
			break;
		case R.id.Radio_AccessRFU:
			btMemBank = 0x01;
			break;
		case R.id.Radio_EPC:
			btMemBank = 0x02;
			break;
		case R.id.Radio_TID:
			btMemBank = 0x03;
			break;
		case R.id.Radio_USER:
			btMemBank = 0x04;
			break;
		// action
		case R.id.Radio_OPEN:
			btAction = 0x00;
			break;
		case R.id.Radio_openforever:
			btAction = 0x01;
			break;
		case R.id.Radio_lock:
			btAction = 0x02;
			break;
		case R.id.Radio_lockforever:
			btAction = 0x03;
			break;
		case R.id.readepc:
			uhf_6c.inventory(callback);
			break;
		// case R.id.dubiaoqian:
		// android.hardware.uhf.magic.olcreader.InventoryLables();
		// break;
		// case R.id.xiebiaoqian:
		//
		// break;
		case R.id.BtnLock:
			if (IsDoubClick()) {
				String lockpdwd = etLockpassword.getText().toString().trim();
				// if (lockpdwd == null || lockpdwd.equals("")) {
				// m_strresult += "Please enter your 8 - digit password!!\n";
				// m_result.setText(m_strresult);
				// return;
				// }
				if (lockpdwd.equals("")) {
					lockpdwd = etLockpassword.getHint().toString().trim();
				}
				if (lockpdwd.equals("00000000")) {
					// remind to change Acess Password
				}
				byte[] passw = stringToBytes(lockpdwd);

				// // suodingmingling
				// // int LD=0x802;//user
				// // int LD=0x8020;//�ţУ�
				// // int LD=0x20080;//�����������
				//
				// //kaifang
				// //int LD=0x20000;//�����������
				// //int LD=0x8000;//EPC
				// // int LD=0x800;//user
				// int LD=GetLockPayLoad(btMemBank,btAction);
				// olcreader.m_strPCEPC=m_textepc.getText().toString().trim();
				// if (olcreader.m_strPCEPC == null ||
				// olcreader.m_strPCEPC.equals("")) {
				// m_strresult += "Please  read lable\n";
				// m_result.setText(m_strresult);
				// return;
				// }
				if (m_textepc.getText().toString().equals("")) {
					m_strresult += "Please  read lable\n";
					m_result.setText(m_strresult);
					return;
				}
				byte[] epc = stringToBytes(m_textepc.getText().toString()
						.trim());
				// uhf_6c.select((byte) 0x01, 16, (byte) ((epc.length) * 8),
				// (byte) 0, epc);
				int LD1 = GetLockPayLoad(btMemBank, btAction);
				// byte[] epc
				// =stringToBytes(m_textepc.getText().toString().trim());
				// int LD = uhf_6c.getLockPayLoad(btMemBank, btAction);
				int result = uhf_6c.lock(passw, epc.length, epc, LD1);
				if (result == 0) {
					DevBeep.PlayOK();
					m_strresult = "OK";
					m_result.setText(m_strresult);
				} else {
					DevBeep.PlayErr();
					m_strresult = "";
					m_strresult = uhf_6c.getErrorDescription(result);
					m_result.setText(m_strresult);
				}
			}
			break;
		case R.id.BtnKill:
			String mimaStr = m_editKPSW.getText().toString().trim();
			Log.e("mimaStr=", mimaStr);
			if (mimaStr == null || mimaStr.equals("")) {
				m_strresult += "Please enter your 8 - digit password!!\n";
				m_result.setText(m_strresult);
				return;
			}
			if (mimaStr.equals("")) {
				mimaStr = etLockpassword.getHint().toString().trim();
			}
			if (m_textepc.getText().toString().equals("")) {
				m_strresult += "Please  read lable\n";
				m_result.setText(m_strresult);
				return;
			}
			byte[] epc = stringToBytes(m_textepc.getText().toString().trim());
			// olcreader.m_strPCEPC=m_textepc.getText().toString().trim();
			// if (olcreader.m_strPCEPC == null ||
			// olcreader.m_strPCEPC.equals("")) {
			// m_strresult += "Please  read lable\n";
			// m_result.setText(m_strresult);
			// return;
			// }
			byte[] pass = stringToBytes(mimaStr);
			int result = uhf_6c.kill(pass, epc.length, epc);
			if (result == 0) {
				DevBeep.PlayOK();
				m_strresult = "OK";
				m_result.setText(m_strresult);
			} else {
				DevBeep.PlayErr();
				m_strresult = uhf_6c.getErrorDescription(result);
				m_result.setText(m_strresult);
			}

			break;
		default:
			break;
		}

	}

	// EG:Mask:0x02
	// membank:00 10 11(permenent)
	// action open��permenent open��lock��permenent lock
	// 00 01 10 11

	public int GetLockPayLoad(byte membank, byte Action) {
		int nret = 0;
		switch (Action) {
		case 0:// open
			switch (membank) {
			case 0:// kill(OK)
				nret = 0x80000;
				break;
			case 1:// Access(OK)
				nret = 0x20000;
				break;
			case 2:// EPC(OK)
				nret = 0x8000;
				break;
			case 3:// TID
				nret = 0x2000;
				break;
			case 4:// USER(OK)
				nret = 0x800;
				break;
			}
			break;
		case 1:// permenent open
			switch (membank) {
			case 0:
				nret = 0x80100;// Killpassword
				break;
			case 1:
				nret = 0x20040;// Access(OK)
				break;
			case 2:
				nret = 0x8010;// EPC(OK)
				break;
			case 3:
				nret = 0x2004;// TID
				break;
			case 4:
				nret = 0x801;// user
				break;
			}
			break;
		case 2:// lock
			switch (membank) {
			case 0:
				nret = 0x80200;// (Kill����������)(OK)
				break;
			case 1:
				nret = 0x20080;// (����������������)(OK)
				break;
			case 2:
				nret = 0x8020;// (EPC)(OK)
				break;
			case 3:
				nret = 0x2008;// (TID)
				break;
			case 4:
				nret = 0x802;// 0x802(result OK)
				break;
			}
			break;
		case 3:// permenent lock
			switch (membank) {
			case 0:
				nret = 0xC0300;// killpassword
				break;
			case 1:
				nret = 0x300c0;// Acesspassword
				break;
			case 2:
				nret = 0xC030;// EPC
				break;
			case 3:
				nret = 0x300C;// TID
				break;
			case 4:
				nret = 0xC03;// user
				break;
			}
			break;

		}
		return nret;
	}

	IUhfCallback callback = new IUhfCallback.Stub() {
		@Override
		public void doInventory(List<String> str) throws RemoteException {
			// for (Iterator it2 = str.iterator(); it2.hasNext();)
			Log.d("dqw", "count111=" + str.size());
			for (int i = 0; i < str.size(); i++) {
				String strepc = (String) str.get(i);
				Log.d("wyt", "RSSI=" + strepc.substring(0, 2));
				Log.d("wyt", "PC=" + strepc.substring(2, 6));
				Log.d("wyt",
						"EPC=" + strepc.substring(2, 6) + strepc.substring(6));
				DevBeep.PlayOK();
				String strEpc = strepc.substring(2, 6) + strepc.substring(6);
				Message msg = new Message();
				msg.what = 1;
				msg.obj = strEpc;
				mHandler.sendMessage(msg);
			}
		}

		@Override
		public void doTIDAndEPC(List<String> arg0) throws RemoteException {
			// TODO Auto-generated method stub
		}
	};

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

	private class MainHandler extends Handler {
		@SuppressLint("HandlerLeak")
		@Override
		public void handleMessage(Message msg) {
			if (msg.what == 1) {
				String readerdata = (String) msg.obj;
				m_textepc.setText(readerdata);

			}
			// if (msg.what == olcreader.locklable || msg.what ==
			// olcreader.killlable) {
			// // if(m_strresult.indexOf((String)msg.obj)<0)
			// {
			// Log.e("8888888888",(String) msg.obj + "\r\n");
			// m_strresult = (String) msg.obj;
			// m_strresult += "\r\n";
			// m_result.setText(m_strresult);
			// }
			// }
			// if (msg.what == olcreader.msgreadepc) {
			// String readerdata = (String)msg.obj;
			// m_textepc.setText(readerdata);
			//
			// //reader.SetSelect((byte)0x02);
			// byte[] epc = olcreader.stringToBytes(readerdata);
			// olcreader.Select((byte) 0x01, 16, (byte) ((epc.length) * 8),
			// (byte) 0, epc);
			// olcreader.m_strPCEPC = readerdata;
			// }
		}
	};
}
