// import { VideoView, useVideoPlayer } from "expo-video";
// import { useEffect, useRef, useState } from "react";
// import { Button, View } from "react-native";

// const videoSource =
//   "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

// export default function VideoScreen() {
//   const ref = useRef(null);
//   const [isPlaying, setIsPlaying] = useState(true);
//   const player = useVideoPlayer(videoSource, (player) => {
//     player.loop = true;
//     player.play();
//   });

//   useEffect(() => {
//     const subscription = player.addListener("playingChange", (isPlaying) => {
//       setIsPlaying(isPlaying);
//     });

//     return () => {
//       subscription.remove();
//     };
//   }, [player]);

//   return (
//     <View className="flex-1 items-center justify-center px-10 py-2.5">
//       <VideoView
//         ref={ref}
//         style={{ width: "100%", height: 300 }}
//         player={player}
//         allowsFullscreen
//         allowsPictureInPicture
//       />
//       <View className="p-2.5">
//         <Button
//           title={isPlaying ? "Pause" : "Play"}
//           onPress={() => {
//             if (isPlaying) {
//               player.pause();
//             } else {
//               player.play();
//             }
//             setIsPlaying(!isPlaying);
//           }}
//         />
//       </View>
//     </View>
//   );
// }
