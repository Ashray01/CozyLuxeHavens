import PropTypes from "prop-types";

export default function Image({ src, ...rest }) {
  Image.propTypes = {
    src: PropTypes.arrayOf(PropTypes.array).isRequired,
  };

  src =
    src && src.includes("https://")
      ? src
      : "http://localhost:4000/api/uploads/" + src;

  return <img {...rest} src={src} alt="" />;
}
