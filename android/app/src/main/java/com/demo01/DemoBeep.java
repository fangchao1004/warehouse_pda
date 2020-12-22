package com.demo01;


import android.content.Context;
import android.media.AudioManager;
import android.media.SoundPool;
import android.util.Log;

public class DemoBeep {
    private static SoundPool soundPool = null;
    private static int sound_errID = 0;
    private static int sound_okID = 0;
    private static int stream_beepID = 0;
    private static boolean bRunning;

    public static void init(Context ct) {
        try {
            bRunning = false;
            //if(soundPool == null)
            {
                soundPool = new SoundPool(1, AudioManager.STREAM_MUSIC, 0);
                Log.d("DevBeep", "soundPool:" + soundPool.toString());
                sound_okID = soundPool.load(ct, R.raw.beep_ok, 1);
//            sound_okID = soundPool.load("/sdcard/beep_ok.wav", 1);

                Log.d("DevBeep", "sound_okID:" + sound_okID);
                sound_errID = soundPool.load(ct, R.raw.beep_err, 1);
//                sound_errID = soundPool.load("../../../../res/raw/beep_err.wav", 1);
                Log.d("DevBeep", "sound_errID:" + sound_errID);
            }
        } catch (RuntimeException e) {
            Log.d("DevBeep", "RuntimeException:" + e);
        }
    }

    public static void release() {
        if (stream_beepID > 0)
            soundPool.stop(stream_beepID);
        soundPool.unload(sound_errID);
        soundPool.unload(sound_okID);
        soundPool.release();
    }

    public static void PlayOK() {
        if (bRunning) return;
        if (soundPool == null) return;
        bRunning = true;
        Log.d("wyt", "PlayOK3" + stream_beepID);
        if (stream_beepID > 0) soundPool.stop(stream_beepID);
        Log.d("wyt", "PlayOK4");
        stream_beepID = soundPool.play(sound_okID, 1.0f, 1.0f, 0, 0, 1.0f);
        Log.d("wyt", "PlayOK5" + sound_okID);
        bRunning = false;
    }

    public static void PlayErr() {
        if (bRunning) return;
        if (soundPool == null) return;
        bRunning = true;
        if (stream_beepID > 0) soundPool.stop(stream_beepID);
        stream_beepID = soundPool.play(sound_errID, 1.0f, 1.0f, 0, 0, 1.0f);
        bRunning = false;
    }
}
