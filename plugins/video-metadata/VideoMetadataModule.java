package com.anonymous.pocketplayer.videometadata;

import android.media.MediaMetadataRetriever;
import com.facebook.react.bridge.*;
import java.io.IOException;
import java.util.*;

public class VideoMetadataModule extends ReactContextBaseJavaModule {
  public VideoMetadataModule(ReactApplicationContext context) {
    super(context);
  }

  @Override
  public String getName() {
    return "VideoMetadata";
  }

  @ReactMethod
  public void getMetadata(String uri, Promise promise) {
    MediaMetadataRetriever retriever = new MediaMetadataRetriever();
    try {
      retriever.setDataSource(uri);

      WritableMap map = Arguments.createMap();
      map.putDouble("duration", Double.parseDouble(retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)) / 1000.0);
      map.putInt("width", Integer.parseInt(retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH)));
      map.putInt("height", Integer.parseInt(retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT)));
      map.putString("mimeType", retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_MIMETYPE));
      map.putString("creationTime", retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DATE));

      promise.resolve(map);
    } catch (Exception e) {
      promise.reject("E_METADATA", "Failed to read metadata", e);
    } finally {
      try {
        retriever.release();
      } catch (IOException ignored) {}
    }
  }

}
