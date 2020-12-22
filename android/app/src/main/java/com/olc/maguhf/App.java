package com.olc.maguhf;

import android.app.Application;

import com.olc.uhf.UhfAdapter;
import com.olc.uhf.UhfManager;

public class App extends Application {
    public static UhfManager mService;

    @Override
    public void onCreate() {
        super.onCreate();
        mService = UhfAdapter.getUhfManager(this.getApplicationContext());
        boolean isopen = mService.open();
        int b = 0;
    }


}
