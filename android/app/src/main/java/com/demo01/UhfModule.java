// ToastModule.java

package com.demo01;


import android.os.RemoteException;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.olc.uhf.tech.ISO1800_6C;
import com.olc.uhf.tech.IUhfCallback;

import java.util.Iterator;
import java.util.List;

import androidx.annotation.Nullable;


public class UhfModule extends ReactContextBaseJavaModule {


    public UhfModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "UhfExample";
    }

    /**
     * android 主动调用 react native
     * react native 中进行事件监听
     *
     * @param reactContext
     * @param eventName
     * @param params
     */
    private void sendEvent(ReactContext reactContext, String eventName, @Nullable WritableMap params) {
        if (reactContext == null) {
            return;
        }
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
    }


    private ISO1800_6C uhf_6c = MainApplication.uhf_6c;
    int allcount = 0;
    public static boolean isLoop = false;

    @ReactMethod
    public void startInventory(Callback callback) {
        try {
            Log.d("wyt", "startInventory");
            if (!isLoop) {
                isLoop = true;
                LoopReadEPC();
            } else {
                isLoop = false;
            }
            Log.d("wyt", " uhf_6c.inventory");
            callback.invoke(isLoop);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void LoopReadEPC() {
        Thread thread = new Thread(new Runnable() {
            @Override
            public void run() {
//                Log.d("wyt", " LoopReadEPC:" + isLoop);
                while (isLoop) {
                    uhf_6c.inventory(iuhfcallback);
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


    IUhfCallback iuhfcallback = new IUhfCallback.Stub() {
        @Override
        public void doInventory(List<String> str) throws RemoteException {
            // for (Iterator it2 = str.iterator(); it2.hasNext();)
            Log.d("dqw", "count111=" + str.size());
            allcount += str.size();
            Log.d("dqw00000007", "count111=" + allcount);
            //m_tvCount.setText("count of tag:" + String.valueOf(card_num));
            for (int i = 0; i < str.size(); i++) {
                String strepc = (String) str.get(i);
//                Log.d("wyt", "1RSSI=" + strepc.substring(0, 2));
//                Log.d("wyt", "1PC=" + strepc.substring(2, 6));
//                Log.d("wyt", "1EPC=" + strepc.substring(6));
                DemoBeep.PlayOK();
                String strEpc = strepc.substring(2, 6) + strepc.substring(6);
//                Log.d("wyt", "1strEpc" + strEpc);
                WritableMap params = Arguments.createMap();
                params.putString("data", strepc.substring(6));
                sendEvent(getReactApplicationContext(), "uhf_data", params);
            }
        }

        @Override
        public void doTIDAndEPC(List<String> str) throws RemoteException {
            for (Iterator it2 = str.iterator(); it2.hasNext(); ) {
                String strepc = (String) it2.next();
                // Log.d("wyt", strepc);
                int nlen = Integer.valueOf(strepc.substring(0, 2), 16);
//                Log.d("wyt", "2PC=" + strepc.substring(2, 6));
//                Log.d("wyt", "2EPC=" + strepc.substring(6, (nlen + 1) * 2));
//                Log.d("wyt", "2TID=" + strepc.substring((nlen + 1) * 2));

            }
        }
    };


}


