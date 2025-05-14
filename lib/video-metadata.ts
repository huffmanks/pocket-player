import { NativeModules } from "react-native";

const { VideoMetadata } = NativeModules;

interface VideoMetadataResponse {
  duration: number;
  width: number;
  height: number;
  mimeType: string;
  creationTime?: string;
}

export default {
  getMetadata: async (uri: string): Promise<VideoMetadataResponse> => {
    return await VideoMetadata.getMetadata(uri);
  },
};
