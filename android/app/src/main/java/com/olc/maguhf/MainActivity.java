package com.olc.maguhf;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

import com.olc.mode.readmode;
import com.olc.uhf.tech.ISO1800_6C;
import com.olc.uhf.tech.IUhfCallback;
import com.olc.uint.AsyncTaskExt;
import com.olc.uint.TxtReader;
import com.olc.uint.AsyncTaskExt.ASynCallBack;
import com.olc.maguhf.R;



import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.os.RemoteException;
import android.provider.Settings;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.app.AlertDialog.Builder;
import android.bluetooth.BluetoothAdapter;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.res.Resources.Theme;
import android.graphics.Color;
import android.graphics.drawable.AnimationDrawable;
import android.telephony.TelephonyManager;
import android.util.Log;
import android.view.KeyEvent;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

/**
 * @version 1.0
 * @author dongqiwu 2016.12.20 16:40
 */
public class MainActivity extends Activity implements OnClickListener {
	// ******************************************************************
	// private UhfManager mService;
	private ISO1800_6C uhf_6c;
	int allcount = 0;
	// *****************************************************************
	private boolean isLoop =false;
	private int Index = 1;
	
	private String[] ItemName = { "Read/Write", "Setting", "Lock",
			"Exportdata", "Help" };
	//private String[] ItemName = {"Exportdata","Clear","Help" };
	 //private String[] ItemName = { "Read/Write", "Setting", "Exportdata",
	// "Help" };
	// ****************************************************************
	private ImageButton bst_startmenu;
	private Button bst_readTid, bst_readEpc;
	private ListView list_read;
	private MuiltSelAdapter adapter;
	private List<readmode> readermodes = new ArrayList<readmode>();
	// ****************************************************************
	private Handler mHandler = new MainHandler();
	// ******************************************************************
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);
		// InitUHFASyn();
		// mService = UhfAdapter.getUhfManager(this.getApplicationContext());
		// mService.open();
		uhf_6c = (ISO1800_6C) App.mService.getISO1800_6C();
		DevBeep.init(MainActivity.this);
		initview();
//		Settings.System.getInt(this.getContentResolver(),
//				Settings.System.UHF, 0);
	}
	// public boolean InitUHF() {
	// mService = UhfAdapter.getUhfManager(this.getApplicationContext());
	// return mService.open();
	// }
	private int getInfo() {
		TelephonyManager mTm = (TelephonyManager) this
				.getSystemService(TELEPHONY_SERVICE);
		// String mtype = android.os.Build.MODEL;//
		String ID = android.os.Build.DISPLAY;// ProjectNameInternal
		// M1501_11_00d_1A.01_4850_1214
		if (ID.length() > 5) {
			String id = ID.substring(0, 5).toString();
			if (id.equals("M1503")) {
				return 3;
			}
		}
		return 1;
	}
	private void InitUHFASyn() {
		ASynCallBack mASynCallBack;
		mASynCallBack = new ASynCallBack() {
			@Override
			public void start() {
			}
			@Override
			public String run() {
				boolean isopen = false;// InitUHF();
				if (isopen) {
					return "1";
				}
				return "0";
			}
			@Override
			public void end(String str) {
				if (str.equals("1")) {

				}
			}
		};
		AsyncTaskExt.doAsync(mASynCallBack, this, "initializing",
				getResources().getString(R.string.initializing));
	}
	@Override
	protected void onPause() {
		super.onPause();
		isLoop=false;
	}
	@Override
	protected void onResume() {
		super.onResume();
		if(bst_readEpc.getText().toString().equals(getResources().getString(R.string.stopRead_EPC)))
		{
			isLoop=true;
			LoopReadEPC();
		}
	}
	@Override
	protected void onDestroy() {
		super.onDestroy();
		isLoop = false;
		App.mService.close();
	}
	@Override
	public boolean onKeyDown(int keyCode, KeyEvent event) {
		if (keyCode == KeyEvent.KEYCODE_BACK) {
			isLoop = false;
			App.mService.close();
			System.exit(0);
		}
		return super.onKeyDown(keyCode, event);
	}

	private void initview() {
		
		ItemName[0] = getResources().getString(R.string.menuRead);
		ItemName[1] = getResources().getString(R.string.menuSet);
		ItemName[2] = getResources().getString(R.string.menuLock);
		ItemName[3] = getResources().getString(R.string.menuexport);
		ItemName[4] = getResources().getString(R.string.menuhelp);
		
		/*
		 * ItemName[0] = getResources().getString(R.string.menuexport);
		ItemName[1] = getResources().getString(R.string.menucleardata);
		ItemName[2] = getResources().getString(R.string.menuhelp);*/
		// regist hander
		// regist hander
		bst_startmenu = (ImageButton) findViewById(R.id.btn_main_systemExit);
		bst_startmenu.setOnClickListener(this);
		bst_readEpc = (Button) findViewById(R.id.bst_readEPC);
		bst_readTid = (Button) findViewById(R.id.bst_readTid);
		bst_readEpc.setOnClickListener(this);
		bst_readTid.setOnClickListener(this);
		list_read = (ListView) findViewById(R.id.list_deviceitem);
		readermodes.clear();
		adapter = new MuiltSelAdapter(this, readermodes);
		list_read.setAdapter(adapter);
		list_read.setChoiceMode(ListView.CHOICE_MODE_SINGLE);
		adapter.notifyDataSetChanged();
	}

	// refreshButton
	public void StartMenus() {
		AlertDialog.Builder builder = new Builder(MainActivity.this);
		builder.setItems(ItemName, new DialogInterface.OnClickListener() {
			public void onClick(DialogInterface arg0, int arg1) {
				System.out.println(arg1);
			
				if (arg1 == 0) {
					if (isLoop) {
						isLoop = false;
						bst_readEpc.setText(R.string.Read_EPC);
					}
					Intent intentTo = new Intent();
					intentTo.setClass(MainActivity.this,
							ReadWriteActivity.class);
					startActivity(intentTo);
				}
				if (arg1 == 1) {
					if (isLoop) {
						isLoop = false;
						bst_readEpc.setText(R.string.Read_EPC);
					}
					Intent intentTo = new Intent();
					intentTo.setClass(MainActivity.this, SettingActivity.class);
					startActivity(intentTo);
				}
				if (arg1 == 2) {
					if (isLoop) {
						isLoop = false;
						bst_readEpc.setText(R.string.Read_EPC);
					}
					Intent intentTo = new Intent();
					intentTo.setClass(MainActivity.this, LockActivity.class);
					startActivity(intentTo);
				}
				if (arg1 ==3) {
					ExtenddateToText();
				}
				if (arg1 ==4) {
					readermodes.clear();
					list_read.setAdapter(adapter);
					adapter.notifyDataSetChanged();
				}
				/*
				if (arg1 ==2) {
					if (isLoop) {
						isLoop = false;
						bst_readEpc.setText(R.string.Read_EPC);
					}
					Intent intentTo = new Intent();
					intentTo.setClass(MainActivity.this, HelpActivity.class);
					startActivity(intentTo);
				}*/
				arg0.dismiss();
			}
		});
		builder.show();
	}

	private class inv_thread extends Thread {
		public void run() {
			super.run();
			while (1 == 1) {
				uhf_6c.inventory(callback);
				try {
					Thread.sleep(100);
				} catch (InterruptedException e) {
					e.printStackTrace();
				}
			}
		}
	}

	public void LoopReadEPC() {
		Thread thread = new Thread(new Runnable() {
			@Override
			public void run() {
				while (isLoop) {
					uhf_6c.inventory(callback);
					if (!isLoop) {
						break;
					}
					try {
						Thread.sleep(150);
					} catch (InterruptedException e) {
						e.printStackTrace();
						break;

					}
				}
			}
		});
		thread.start();
	}

	@Override
	public void onClick(View v) {
		switch (v.getId()) {
		case R.id.btn_main_systemExit:
//			if (isLoop) {
//				isLoop = false;
//				bst_readEpc.setText(R.string.Read_EPC);
//			}
			StartMenus();
			break;
		case R.id.bst_readEPC:
			if (!isLoop) {
				isLoop = true;
				LoopReadEPC();
				bst_readEpc.setText(R.string.stopRead_EPC);
				break;
			}
			if (isLoop) {
				// if(Index==1)
				// {
				// Index=1;
				// }
				isLoop = false;
				bst_readEpc.setText(R.string.Read_EPC);
				break;
			}
		case R.id.bst_readTid:

			break;
		default:
			break;
		}
	}

	private class MainHandler extends Handler {
		@SuppressLint("HandlerLeak")
		@Override
		public void handleMessage(Message msg) {
			if (msg.what == 1) {
				readmode model = new readmode();
				String readerdata = (String) msg.obj;
				{
					model.setTIDNo("");
					model.setEPCNo(readerdata);
					adapter.notifyDataSetChanged();
				}
				// m_number++;
				IshavaCode(model, 1);
			}

		}
	};

	@SuppressLint("ResourceAsColor")
	private Boolean IshavaCode(readmode code, int number) {
		int count = readermodes.size();
		int newcount = 0;
		for (int i = 0; i < count; i++) {
			if (readermodes.get(i).getEPCNo().equals(code.getEPCNo())) {
				
				newcount = Integer.parseInt(readermodes.get(i).getCountNo());
				if(newcount>=2000000000){//2000000000
					newcount=0;
					readermodes.get(i).setCountNo("0");
				}
				//
				readermodes.get(i).setCountNo(String.valueOf((newcount+1)));
				adapter = new MuiltSelAdapter(this, readermodes);
				list_read.setAdapter(adapter);
				//
				list_read.setSelection(list_read.getCount()-1);
				//list_read.smoothScrollToPosition(list_read.getCount() -1);//remove to end
				//list_read.setTranscriptMode(ListView.TRANSCRIPT_MODE_ALWAYS_SCROLL);  
				// 18666992511
				// list_read.getSelectedView().setBackgroundColor(Color.YELLOW);
				// list_read.selector//getSelectedView().setBackgroundColor(Color.YELLOW);
				return true;
			}
		}
		Index = readermodes.size()+1;
		readmode model = new readmode();
		model.setEPCNo(code.getEPCNo());
		model.setTIDNo("" + Index++);
		model.setCountNo(String.valueOf(number));
		readermodes.add(model);
		adapter = new MuiltSelAdapter(this, readermodes);
		list_read.setAdapter(adapter);
		int card_num = readermodes.size();
		list_read.setSelection(list_read.getCount()-1);
		
		return false;
	}

	class MuiltSelAdapter extends BaseAdapter {
		private Context context;
		private HashMap<Integer, Boolean> isSelected;
		private LayoutInflater inflater = null;
		private List<readmode> models = new ArrayList<readmode>();

		@SuppressLint("UseSparseArrays")
		public MuiltSelAdapter(Context context, List<readmode> models) {
			this.context = context;
			this.models = models;
			inflater = LayoutInflater.from(context);
			isSelected = new HashMap<Integer, Boolean>();
			initData(false);
		}

		public void initData(boolean flag) {
			for (int i = 0; i < models.size(); i++) {
				isSelected.put(i, flag);
			}
		}

		@Override
		public int getCount() {
			return models.size();
		}

		@Override
		public Object getItem(int arg0) {
			return models.get(arg0);
		}

		@Override
		public long getItemId(int arg0) {
			return arg0;
		}

		@Override
		public View getView(final int position, View convertView,
				ViewGroup parent) {
			ViewHolder holder = null;
			if (convertView == null) {
				holder = new ViewHolder();
				convertView = inflater.inflate(R.layout.listviewitem, null);
				holder.tv_EPCNo = (TextView) convertView
						.findViewById(R.id.textEPC);
				holder.tv_TIDNo = (TextView) convertView
						.findViewById(R.id.textTID);
				holder.tv_CountNo = (TextView) convertView
						.findViewById(R.id.textCountNo);
				convertView.setTag(holder);
			} else {
				holder = (ViewHolder) convertView.getTag();
			}
			readmode model = readermodes.get(position);
			holder.tv_EPCNo.setText(model.getEPCNo());
			holder.tv_TIDNo.setText(model.getTIDNo());
			holder.tv_CountNo.setText(model.getCountNo());
			return convertView;
		}

		public HashMap<Integer, Boolean> getIsSelected() {
			return isSelected;
		}

		public void setIsSelected(HashMap<Integer, Boolean> isSelected) {
			this.isSelected = isSelected;
		}

		class ViewHolder {
			TextView tv_EPCNo;
			TextView tv_TIDNo;
			TextView tv_CountNo;

		}
	}

	private void ExtenddateToText() {
		ASynCallBack mASynCallBack;

		mASynCallBack = new ASynCallBack() {
			final String FOLDER_PATH = "sdcard" + "/ScanUHFLogs/";
			String FILE_PATH = "";

			@Override
			public void start() {
				SimpleDateFormat sDateFormat = new SimpleDateFormat(
						"yyyyMMddhhmmss");
				String filedate = sDateFormat.format(new java.util.Date());
				FILE_PATH = FOLDER_PATH + filedate + ".TXT";
			}

			@Override
			public String run() {

				// 
				if (readermodes != null && readermodes.size() > 0) {
					for (int i = 0; i < readermodes.size(); i++) {
						TxtReader.saveData2File(readermodes.get(i).getTIDNo()
								+ "   " + readermodes.get(i).getEPCNo() + "   "
								+ readermodes.get(i).getCountNo() + "\r\n",
								FILE_PATH, FOLDER_PATH);

					}
					return "OK";
				} else {
					return "";
				}
			}

			@Override
			public void end(String str) {
				if ("OK".equals(str)) {
					Toast.makeText(
							MainActivity.this,
							getResources().getString(R.string.savesuccess)
									+ FILE_PATH, Toast.LENGTH_LONG).show();
				} else {
					Toast.makeText(MainActivity.this, R.string.nodata,
							Toast.LENGTH_SHORT).show();
				}
			}
		};
		AsyncTaskExt.doAsync(mASynCallBack, this, "",
				getResources().getString(R.string.saveing));
	}

	IUhfCallback callback = new IUhfCallback.Stub() {
		@Override
		public void doInventory(List<String> str) throws RemoteException {
			// for (Iterator it2 = str.iterator(); it2.hasNext();)
			Log.d("dqw", "count111=" + str.size());
			allcount += str.size();
			Log.d("dqw00000007", "count111=" + allcount);
			//m_tvCount.setText("count of tag:" + String.valueOf(card_num));
			for (int i = 0; i < str.size(); i++) {
				String strepc = (String) str.get(i);
				Log.d("wyt", "RSSI=" + strepc.substring(0, 2));
				Log.d("wyt", "PC=" + strepc.substring(2, 6));
				Log.d("wyt", "EPC=" + strepc.substring(6));
				DevBeep.PlayOK();///1，DevBeep 是什么 起什么作用 也没看到包的引用？
				String strEpc = strepc.substring(2, 6) + strepc.substring(6);
				Message msg = new Message();
				msg.what = 1;
				msg.obj = strEpc; ///2，msg 是不是就包含了uhf标签的相关信息？
				mHandler.sendMessage(msg);///3，如果想要对msg进行自定义操作。是不是这里就不需要了？
			}
		}
		///4，这个函数起到什么作用
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

}
