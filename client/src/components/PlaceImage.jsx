import Image from "./Image";

export default function PlaceImage({ place, index = 0, className = null }) {
  PlaceImage.propTypes = {
    place,
    index,
    className,
  };
  if (!place.photos?.length) {
    return "";
  }
  if (!className) {
    className = "object-cover w-full h-full";
  }
  return <Image className={className} src={place.photos[index]} alt="" />;
}
