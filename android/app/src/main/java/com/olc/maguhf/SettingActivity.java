package com.olc.maguhf;

import com.olc.maguhf.R;
import com.olc.uhf.tech.ISO1800_6C;

import android.annotation.SuppressLint;
import android.app.Activity;

import android.os.Bundle;
import android.text.Editable;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.Toast;

/**
 * 2016.12.20
 * 
 * @author dongqiwu setting power
 * 
 */
@SuppressLint("ShowToast")
public class SettingActivity extends Activity implements OnClickListener {

	private ISO1800_6C uhf_6c;
	// ******************************************
	private EditText m_editPower;
	private Button Btn_ReadPower, Btn_SetPower;
	private ImageButton btn_main_back;

	// *******************************************
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_setting);
		uhf_6c=App.mService.getISO1800_6C();
		initview();
	}

	private void initview() {
		m_editPower = (EditText) findViewById(R.id.et_power);
		Btn_ReadPower = (Button) findViewById(R.id.Btn_ReadPower);
		Btn_SetPower = (Button) findViewById(R.id.Btn_SetPower);
		btn_main_back = (ImageButton) findViewById(R.id.btn_main_back);
		btn_main_back.setOnClickListener(this);
		Btn_ReadPower.setOnClickListener(this);
		Btn_SetPower.setOnClickListener(this);
	}


	@SuppressLint("ShowToast")
	@Override
	public void onClick(View v) {
		switch (v.getId()) {
		case R.id.btn_main_back:
			finish();
			break;
		case R.id.Btn_ReadPower:
			int npower =App.mService.getTransmissionPower();
			if (npower != 0x11) {
				m_editPower.setText("" + npower);
				Toast.makeText(SettingActivity.this, R.string.ReadpowerSuccess,
						1000).show();
			} else {
				Toast.makeText(SettingActivity.this, R.string.ReadpowerFail,
						1000).show();
			}
			break;
		case R.id.Btn_SetPower:
			if ("".equals(m_editPower.getText().toString())) {
				Toast.makeText(SettingActivity.this, R.string.setpowerhint,
						1000).show();
				break;
			}
			String Strpower = m_editPower.getText().toString();
			if (Integer.parseInt(Strpower)>2800||Integer.parseInt(Strpower)<1200) {
				Toast.makeText(SettingActivity.this, R.string.powerabout,
						1000).show();
				break;
			}
			int npower1 = Integer.valueOf(m_editPower.getText().toString()
					.trim());
			int result=App.mService.setTransmissionPower(npower1);
			if(result==0)
			{
				Toast.makeText(SettingActivity.this, R.string.SetpowerSuccess,
						1000).show();
			}
			else
			{		
				Toast.makeText(SettingActivity.this, uhf_6c.getErrorDescription(result),
						1000).show();
			}

			break;

		default:
			break;
		}
	}

}