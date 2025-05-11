import { memo } from "react";
import { Image, View } from "react-native";

import { cn, imagesToRows } from "@/lib/utils";

interface PlaylistCollageProps {
  images:
    | {
        id: string;
        thumbUri: string;
      }[]
    | null;
}

const PlaylistCollage = memo(function PlaylistCollage({ images }: PlaylistCollageProps) {
  if (!images || images.length === 0) {
    return <ImageCard viewClassName="h-48 w-48 overflow-hidden rounded-lg bg-secondary" />;
  }

  const rows = imagesToRows(images);

  const isSingleImage = rows.length === 1 && rows[0].length === 1;

  return (
    <View>
      {isSingleImage ? (
        <ImageCard
          imgUri={rows[0][0].thumbUri}
          viewClassName="h-48 w-48 overflow-hidden rounded-lg bg-card"
        />
      ) : (
        <View className="h-48 w-48 overflow-hidden rounded-lg bg-card">
          {rows.map((item, rowIndex) => (
            <View
              key={`row-${rowIndex}`}
              className={cn("rotate-[9deg] flex-row gap-2")}>
              {item.map((img, index) => (
                <ImageCard
                  key={img.id}
                  imgUri={img.thumbUri}
                  viewClassName={cn(
                    "h-24 w-24 overflow-hidden rounded-lg",
                    item.length === 3 && index === 0 && "-ml-8",
                    item.length === 3 && index === 2 && "-mr-8",
                    item.length === 2 && index === 0 && "-ml-2",
                    item.length === 2 && index === 1 && "-mr-2",
                    rows.length === 2 && item.length >= 2 && rowIndex === 0 && "-mt-2",
                    rows.length === 2 && item.length >= 2 && rowIndex === 1 && "mt-2",
                    rows.length === 2 &&
                      rows[0].length === 2 &&
                      rows[1].length === 2 &&
                      rowIndex === 0 &&
                      "-mt-2",
                    rows.length === 2 &&
                      rows[0].length === 2 &&
                      rows[1].length === 2 &&
                      rowIndex === 1 &&
                      "mt-2",
                    rows.length === 2 &&
                      item.length === 1 &&
                      rows[1].length === 2 &&
                      rowIndex === 0 &&
                      "mx-auto -mt-2",
                    rows.length === 2 &&
                      item.length === 2 &&
                      rows[0].length === 1 &&
                      rowIndex === 1 &&
                      "mt-2",
                    rows.length === 2 &&
                      item.length === 1 &&
                      rows[1].length === 1 &&
                      rowIndex === 0 &&
                      "ml-1 mt-2",
                    rows.length === 2 &&
                      item.length === 1 &&
                      rows[0].length === 1 &&
                      rowIndex === 1 &&
                      "-mt-3 ml-[52px]"
                  )}
                />
              ))}
            </View>
          ))}
        </View>
      )}
    </View>
  );
});

function ImageCard({ imgUri, viewClassName }: { imgUri?: string; viewClassName: string }) {
  return (
    <View className={viewClassName}>
      {imgUri ? (
        <Image
          source={{ uri: imgUri }}
          resizeMode="cover"
          className="h-full w-full"
        />
      ) : (
        <View className="h-full w-full" />
      )}
    </View>
  );
}

export default PlaylistCollage;
