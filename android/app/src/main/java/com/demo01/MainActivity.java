package com.demo01;

import android.os.Bundle;

import com.facebook.react.ReactActivity;
import com.olc.uhf.UhfAdapter;
import com.olc.uhf.UhfManager;
import com.olc.uhf.tech.ISO1800_6C;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "demo01";
  }


  @Override
  protected void onDestroy() {
    super.onDestroy();
    // UhfModule.isLoop = false;
    // MainApplication.mService.close();
  }

}
