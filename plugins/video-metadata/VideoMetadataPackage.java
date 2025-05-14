package com.anonymous.pocketplayer.videometadata;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.uimanager.ViewManager;
import com.facebook.react.bridge.ReactApplicationContext;
import java.util.*;

public class VideoMetadataPackage implements ReactPackage {
  @Override
  public List<NativeModule> createNativeModules(ReactApplicationContext context) {
    List<NativeModule> modules = new ArrayList<>();
    modules.add(new VideoMetadataModule(context));
    return modules;
  }

  @Override
  public List<ViewManager> createViewManagers(ReactApplicationContext context) {
    return Collections.emptyList();
  }
}