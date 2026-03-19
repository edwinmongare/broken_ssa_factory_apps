import Image from "next/image";

export const Icons = {
  Logo: () => (
    <Image
      src="/logo.png"
      width={50}
      height={50}
      alt="Logo"
      // Specify inline styles for the Image component if needed
      style={{ width: "50px", height: "50px" }}
    />
  ),
};

export default Icons;
